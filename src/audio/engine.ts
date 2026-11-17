import type { Composition, NoteEvent } from "../music/score";

const midiToHz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

export class MusicEngine {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private scheduled: AudioScheduledSourceNode[] = [];
  private graphNodes: AudioNode[] = [];
  private stopTimer: number | null = null;
  private playing = false;

  get isPlaying() {
    return this.playing;
  }

  async play(score: Composition, onEnded: () => void) {
    this.stop();
    this.context ??= new AudioContext();
    await this.context.resume();

    const context = this.context;
    const master = this.track(context.createGain());
    const dry = this.track(context.createGain());
    const reverbSend = this.track(context.createGain());
    const wet = this.track(context.createGain());
    const lowpass = this.track(context.createBiquadFilter());
    const compressor = this.track(context.createDynamicsCompressor());

    master.gain.value = 0.78;
    dry.gain.value = 0.88;
    reverbSend.gain.value = 0.22;
    wet.gain.value = 0.19;
    lowpass.type = "lowpass";
    lowpass.frequency.value = 10500;
    lowpass.Q.value = 0.35;
    compressor.threshold.value = -18;
    compressor.knee.value = 18;
    compressor.ratio.value = 2;
    compressor.attack.value = 0.015;
    compressor.release.value = 0.28;

    master.connect(dry);
    dry.connect(lowpass);
    master.connect(reverbSend);
    this.createRoomReverb(reverbSend, wet, context);
    wet.connect(lowpass);
    lowpass.connect(compressor);
    compressor.connect(context.destination);
    this.master = master;

    const startAt = context.currentTime + 0.08;
    const secondsPerBeat = 60 / score.bpm;
    const lastEventBeat = score.events.reduce(
      (last, event) => Math.max(last, event.beat + event.duration),
      score.bars * score.beatsPerBar
    );

    for (const event of score.events) {
      this.scheduleVoice(
        event,
        startAt + event.beat * secondsPerBeat,
        event.duration * secondsPerBeat,
        context,
        master
      );
    }

    this.playing = true;
    this.stopTimer = window.setTimeout(() => {
      this.playing = false;
      this.stopTimer = null;
      this.scheduled = [];
      this.master = null;
      onEnded();
      this.releaseGraph(2800);
    }, (lastEventBeat * secondsPerBeat + 2.8) * 1000);
  }

  stop() {
    if (this.stopTimer !== null) window.clearTimeout(this.stopTimer);
    this.stopTimer = null;

    const now = this.context?.currentTime ?? 0;
    for (const source of this.scheduled) {
      try {
        source.stop(now + 0.025);
      } catch {
        // A source may already have ended.
      }
    }
    this.scheduled = [];

    if (this.master && this.context) {
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(0, now, 0.035);
    }
    this.master = null;
    this.playing = false;
    this.releaseGraph(260);
  }

  private track<T extends AudioNode>(node: T): T {
    this.graphNodes.push(node);
    return node;
  }

  private releaseGraph(delay: number) {
    const nodes = this.graphNodes;
    this.graphNodes = [];
    if (!nodes.length) return;

    window.setTimeout(() => {
      for (const node of nodes) {
        try {
          node.disconnect();
        } catch {
          // Nodes may already be disconnected.
        }
      }
    }, delay);
  }

  private createRoomReverb(input: AudioNode, output: AudioNode, context: AudioContext) {
    const delayTimes = [0.0297, 0.0371, 0.0411, 0.0437];
    const feedbackLevels = [0.69, 0.67, 0.65, 0.63];

    delayTimes.forEach((delayTime, index) => {
      const delay = this.track(context.createDelay(0.12));
      const damping = this.track(context.createBiquadFilter());
      const feedback = this.track(context.createGain());
      const returnGain = this.track(context.createGain());

      delay.delayTime.value = delayTime;
      damping.type = "lowpass";
      damping.frequency.value = 4200 - index * 420;
      feedback.gain.value = feedbackLevels[index];
      returnGain.gain.value = 0.24;

      input.connect(delay);
      delay.connect(damping);
      damping.connect(feedback);
      feedback.connect(delay);
      delay.connect(returnGain);
      returnGain.connect(output);
    });
  }

  private scheduleVoice(
    event: NoteEvent,
    start: number,
    duration: number,
    context: AudioContext,
    destination: AudioNode
  ) {
    const frequency = midiToHz(event.midi);
    if (event.voice === "piano") {
      this.schedulePiano(frequency, event.velocity, start, duration, context, destination);
    } else if (event.voice === "bell") {
      this.scheduleBell(frequency, event.velocity, start, duration, context, destination);
    } else {
      this.schedulePad(frequency, event.velocity, start, duration, context, destination);
    }
  }

  private schedulePiano(
    frequency: number,
    velocity: number,
    start: number,
    duration: number,
    context: AudioContext,
    destination: AudioNode
  ) {
    const output = this.track(context.createGain());
    const tone = this.track(context.createBiquadFilter());
    tone.type = "lowpass";
    tone.frequency.setValueAtTime(Math.min(9000, frequency * 16), start);
    tone.frequency.setTargetAtTime(Math.max(1100, frequency * 4.2), start + 0.045, 0.38);
    output.gain.value = 0.82;
    tone.connect(output);
    output.connect(destination);

    // Slightly inharmonic partials give the struck string a more piano-like colour.
    const partials = [
      { harmonic: 1, level: 1, decay: 0.85 },
      { harmonic: 2, level: 0.31, decay: 0.62 },
      { harmonic: 3, level: 0.115, decay: 0.48 },
      { harmonic: 4, level: 0.043, decay: 0.36 },
      { harmonic: 5, level: 0.016, decay: 0.28 }
    ];

    partials.forEach((partial, index) => {
      const oscillator = this.track(context.createOscillator());
      const partialGain = this.track(context.createGain());
      const inharmonicity = 0.00012;
      const harmonic = partial.harmonic;
      oscillator.type = "sine";
      oscillator.frequency.value =
        frequency * harmonic * Math.sqrt(1 + inharmonicity * harmonic * harmonic);

      const peak = velocity * partial.level * partial.decay;
      partialGain.gain.setValueAtTime(0.0001, start);
      partialGain.gain.linearRampToValueAtTime(peak, start + 0.005 + index * 0.001);
      partialGain.gain.setTargetAtTime(
        0.0001,
        start + Math.max(0.12, duration * 0.58),
        0.22 + index * 0.055
      );

      oscillator.connect(partialGain);
      partialGain.connect(tone);
      oscillator.start(start);
      oscillator.stop(start + duration + 1.6);
      this.scheduled.push(oscillator);
    });
  }

  private scheduleBell(
    frequency: number,
    velocity: number,
    start: number,
    duration: number,
    context: AudioContext,
    destination: AudioNode
  ) {
    const output = this.track(context.createGain());
    const tone = this.track(context.createBiquadFilter());
    tone.type = "highpass";
    tone.frequency.value = 520;
    output.gain.setValueAtTime(0.0001, start);
    output.gain.linearRampToValueAtTime(velocity, start + 0.008);
    output.gain.exponentialRampToValueAtTime(0.0001, start + Math.max(0.7, duration * 1.25));
    tone.connect(output);
    output.connect(destination);

    for (const [ratio, level] of [[1, 1], [2.756, 0.22], [5.404, 0.07]] as const) {
      const oscillator = this.track(context.createOscillator());
      const partialGain = this.track(context.createGain());
      oscillator.type = "sine";
      oscillator.frequency.value = frequency * ratio;
      partialGain.gain.value = level;
      oscillator.connect(partialGain);
      partialGain.connect(tone);
      oscillator.start(start);
      oscillator.stop(start + Math.max(duration, 1.8) + 0.5);
      this.scheduled.push(oscillator);
    }
  }

  private schedulePad(
    frequency: number,
    velocity: number,
    start: number,
    duration: number,
    context: AudioContext,
    destination: AudioNode
  ) {
    const output = this.track(context.createGain());
    const filter = this.track(context.createBiquadFilter());
    filter.type = "lowpass";
    filter.frequency.value = 1450;
    filter.Q.value = 0.5;
    output.gain.setValueAtTime(0.0001, start);
    output.gain.linearRampToValueAtTime(velocity, start + 1.1);
    output.gain.setTargetAtTime(Math.max(0.0001, velocity * 0.72), start + 1.1, 0.8);
    output.gain.setTargetAtTime(0.0001, start + Math.max(1.2, duration - 0.6), 0.45);
    filter.connect(output);
    output.connect(destination);

    for (const [ratio, level, detune] of [[1, 0.6, -5], [1.003, 0.4, 5]] as const) {
      const oscillator = this.track(context.createOscillator());
      const partialGain = this.track(context.createGain());
      oscillator.type = "triangle";
      oscillator.frequency.value = frequency * ratio;
      oscillator.detune.value = detune;
      partialGain.gain.value = level;
      oscillator.connect(partialGain);
      partialGain.connect(filter);
      oscillator.start(start);
      oscillator.stop(start + duration + 1.2);
      this.scheduled.push(oscillator);
    }
  }
}
