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
    const warmth = this.track(context.createBiquadFilter());
    const compressor = this.track(context.createDynamicsCompressor());

    master.gain.value = 0.68;
    dry.gain.value = 0.76;
    reverbSend.gain.value = 0.38;
    wet.gain.value = 0.31;
    warmth.type = "lowpass";
    warmth.frequency.value = 7600;
    warmth.Q.value = 0.32;
    compressor.threshold.value = -22;
    compressor.knee.value = 22;
    compressor.ratio.value = 1.7;
    compressor.attack.value = 0.04;
    compressor.release.value = 0.55;

    master.connect(dry);
    dry.connect(warmth);
    master.connect(reverbSend);
    this.createAmbientReverb(reverbSend, wet, context);
    wet.connect(warmth);
    warmth.connect(compressor);
    compressor.connect(context.destination);
    this.master = master;

    const startAt = context.currentTime + 0.12;
    const secondsPerBeat = 60 / score.bpm;
    const lastEventBeat = score.events.reduce(
      (last, event) => Math.max(last, event.beat + event.duration),
      score.bars * score.beatsPerBar
    );

    for (const event of score.events) {
      this.scheduleVoice(
        event,
        startAt + (event.beat + (event.timingOffset ?? 0)) * secondsPerBeat,
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
      this.releaseGraph(6500);
    }, (lastEventBeat * secondsPerBeat + 6.5) * 1000);
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
      this.master.gain.setTargetAtTime(0, now, 0.06);
    }
    this.master = null;
    this.playing = false;
    this.releaseGraph(500);
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

  private createAmbientReverb(input: AudioNode, output: AudioNode, context: AudioContext) {
    const delayTimes = [0.173, 0.229, 0.293, 0.367, 0.431];
    const feedbackLevels = [0.57, 0.55, 0.53, 0.51, 0.49];

    delayTimes.forEach((delayTime, index) => {
      const delay = this.track(context.createDelay(0.7));
      const damping = this.track(context.createBiquadFilter());
      const feedback = this.track(context.createGain());
      const returnGain = this.track(context.createGain());

      delay.delayTime.value = delayTime;
      damping.type = "lowpass";
      damping.frequency.value = 3400 - index * 330;
      feedback.gain.value = feedbackLevels[index];
      returnGain.gain.value = 0.16;

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
    if (event.voice === "pluck") {
      this.schedulePluck(frequency, event.velocity, start, duration, context, destination);
    } else if (event.voice === "bass") {
      this.scheduleBass(frequency, event.velocity, start, duration, context, destination);
    } else if (event.voice === "bell") {
      this.scheduleBell(frequency, event.velocity, start, duration, context, destination);
    } else if (event.voice === "strings") {
      this.scheduleStrings(frequency, event.velocity, start, duration, context, destination);
    } else if (event.voice === "flute") {
      this.scheduleFlute(frequency, event.velocity, start, duration, context, destination);
    } else {
      this.schedulePad(frequency, event.velocity, start, duration, context, destination);
    }
  }

  private schedulePluck(
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
    tone.frequency.setValueAtTime(Math.min(6800, frequency * 10), start);
    tone.frequency.setTargetAtTime(Math.max(1100, frequency * 4.2), start + 0.12, 0.8);
    output.gain.value = 0.82;
    tone.connect(output);
    output.connect(destination);

    const partials = [
      { ratio: 1, level: 1, decay: 1.15 },
      { ratio: 2.01, level: 0.19, decay: 0.58 },
      { ratio: 3.98, level: 0.045, decay: 0.28 }
    ];

    partials.forEach((partial, index) => {
      const oscillator = this.track(context.createOscillator());
      const partialGain = this.track(context.createGain());
      oscillator.type = index === 0 ? "triangle" : "sine";
      oscillator.frequency.value = frequency * partial.ratio;
      partialGain.gain.setValueAtTime(0.0001, start);
      partialGain.gain.linearRampToValueAtTime(
        velocity * partial.level,
        start + 0.012 + index * 0.003
      );
      partialGain.gain.setTargetAtTime(0.0001, start + 0.035, partial.decay);
      oscillator.connect(partialGain);
      partialGain.connect(tone);
      oscillator.start(start);
      oscillator.stop(start + Math.max(duration, 0.3) + 4.2);
      this.scheduled.push(oscillator);
    });
  }

  private scheduleBass(
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
    filter.frequency.value = 520;
    filter.Q.value = 0.35;
    output.gain.setValueAtTime(0.0001, start);
    output.gain.linearRampToValueAtTime(velocity, start + 0.22);
    output.gain.setTargetAtTime(velocity * 0.68, start + 0.25, 0.75);
    output.gain.setTargetAtTime(0.0001, start + Math.max(0.5, duration - 0.35), 0.3);
    filter.connect(output);
    output.connect(destination);

    for (const [type, ratio, level] of [
      ["sine", 1, 0.82],
      ["triangle", 2, 0.11]
    ] as const) {
      const oscillator = this.track(context.createOscillator());
      const partialGain = this.track(context.createGain());
      oscillator.type = type;
      oscillator.frequency.value = frequency * ratio;
      partialGain.gain.value = level;
      oscillator.connect(partialGain);
      partialGain.connect(filter);
      oscillator.start(start);
      oscillator.stop(start + duration + 1.2);
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
    filter.frequency.setValueAtTime(850, start);
    filter.frequency.linearRampToValueAtTime(1750, start + 1.8);
    filter.Q.value = 0.35;
    output.gain.setValueAtTime(0.0001, start);
    output.gain.linearRampToValueAtTime(velocity, start + 1.7);
    output.gain.setTargetAtTime(velocity * 0.78, start + 1.7, 1.1);
    output.gain.setTargetAtTime(0.0001, start + Math.max(1.8, duration - 0.7), 0.75);
    filter.connect(output);
    output.connect(destination);

    for (const [ratio, level, detune, type] of [
      [1, 0.62, -4, "triangle"],
      [1.003, 0.31, 4, "sine"],
      [0.5, 0.12, 0, "sine"]
    ] as const) {
      const oscillator = this.track(context.createOscillator());
      const partialGain = this.track(context.createGain());
      oscillator.type = type;
      oscillator.frequency.value = frequency * ratio;
      oscillator.detune.value = detune;
      partialGain.gain.value = level;
      oscillator.connect(partialGain);
      partialGain.connect(filter);
      oscillator.start(start);
      oscillator.stop(start + duration + 2.2);
      this.scheduled.push(oscillator);
    }
  }


  private scheduleStrings(
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
    filter.frequency.setValueAtTime(1150, start);
    filter.frequency.linearRampToValueAtTime(2600, start + 2.2);
    filter.Q.value = 0.28;
    output.gain.setValueAtTime(0.0001, start);
    output.gain.linearRampToValueAtTime(velocity, start + 1.05);
    output.gain.setTargetAtTime(velocity * 0.82, start + 1.05, 1.4);
    output.gain.setTargetAtTime(0.0001, start + Math.max(1.2, duration - 0.5), 0.9);
    filter.connect(output);
    output.connect(destination);

    for (const [type, ratio, level, detune] of [
      ["sawtooth", 1, 0.16, -5],
      ["triangle", 1.002, 0.58, 4],
      ["sine", 2, 0.08, 0]
    ] as const) {
      const oscillator = this.track(context.createOscillator());
      const partialGain = this.track(context.createGain());
      oscillator.type = type;
      oscillator.frequency.value = frequency * ratio;
      oscillator.detune.value = detune;
      partialGain.gain.value = level;
      oscillator.connect(partialGain);
      partialGain.connect(filter);
      oscillator.start(start);
      oscillator.stop(start + duration + 2.5);
      this.scheduled.push(oscillator);
    }
  }

  private scheduleFlute(
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
    tone.frequency.value = Math.min(5200, frequency * 7);
    tone.Q.value = 0.22;
    output.gain.setValueAtTime(0.0001, start);
    output.gain.linearRampToValueAtTime(velocity, start + 0.11);
    output.gain.setTargetAtTime(velocity * 0.82, start + 0.16, 0.7);
    output.gain.setTargetAtTime(0.0001, start + Math.max(0.3, duration - 0.18), 0.28);
    tone.connect(output);
    output.connect(destination);

    const fundamental = this.track(context.createOscillator());
    const fundamentalGain = this.track(context.createGain());
    fundamental.type = "sine";
    fundamental.frequency.value = frequency;
    fundamentalGain.gain.value = 0.92;
    fundamental.connect(fundamentalGain);
    fundamentalGain.connect(tone);
    fundamental.start(start);
    fundamental.stop(start + duration + 1.1);
    this.scheduled.push(fundamental);

    const breath = this.track(context.createOscillator());
    const breathGain = this.track(context.createGain());
    breath.type = "triangle";
    breath.frequency.value = frequency * 2;
    breathGain.gain.value = 0.045;
    breath.connect(breathGain);
    breathGain.connect(tone);
    breath.start(start);
    breath.stop(start + duration + 1.1);
    this.scheduled.push(breath);
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
    tone.frequency.value = 900;
    output.gain.setValueAtTime(0.0001, start);
    output.gain.linearRampToValueAtTime(velocity, start + 0.035);
    output.gain.exponentialRampToValueAtTime(0.0001, start + Math.max(1.2, duration * 1.5));
    tone.connect(output);
    output.connect(destination);

    for (const [ratio, level] of [[1, 1], [2.756, 0.16], [5.404, 0.035]] as const) {
      const oscillator = this.track(context.createOscillator());
      const partialGain = this.track(context.createGain());
      oscillator.type = "sine";
      oscillator.frequency.value = frequency * ratio;
      partialGain.gain.value = level;
      oscillator.connect(partialGain);
      partialGain.connect(tone);
      oscillator.start(start);
      oscillator.stop(start + Math.max(duration, 2) + 2.5);
      this.scheduled.push(oscillator);
    }
  }
}
