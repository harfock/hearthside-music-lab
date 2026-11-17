import type { Composition, NoteEvent } from "../music/score";

type Voice = NoteEvent["voice"];

const midiToHz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

export class MusicEngine {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private scheduled: AudioScheduledSourceNode[] = [];
  private stopTimer: number | null = null;
  private playing = false;

  get isPlaying() {
    return this.playing;
  }

  async play(score: Composition, onEnded: () => void) {
    this.stop();
    const AudioContextClass = window.AudioContext;
    this.context ??= new AudioContextClass();
    await this.context.resume();

    const context = this.context;
    const master = context.createGain();
    const compressor = context.createDynamicsCompressor();
    const lowpass = context.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 10500;
    lowpass.Q.value = 0.35;
    master.gain.value = 0.72;
    compressor.threshold.value = -18;
    compressor.knee.value = 18;
    compressor.ratio.value = 2;
    compressor.attack.value = 0.015;
    compressor.release.value = 0.25;
    master.connect(lowpass);
    lowpass.connect(compressor);
    compressor.connect(context.destination);
    this.master = master;

    const startAt = context.currentTime + 0.08;
    const secondsPerBeat = 60 / score.bpm;
    const totalDuration = score.bars * score.beatsPerBar * secondsPerBeat;

    for (const event of score.events) {
      this.scheduleVoice(event, startAt + event.beat * secondsPerBeat, event.duration * secondsPerBeat, context, master);
    }

    this.playing = true;
    this.stopTimer = window.setTimeout(() => {
      this.playing = false;
      this.scheduled = [];
      onEnded();
    }, (totalDuration + 2.2) * 1000);
  }

  stop() {
    if (this.stopTimer !== null) {
      window.clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }
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
      const oldMaster = this.master;
      window.setTimeout(() => oldMaster.disconnect(), 250);
      this.master = null;
    }
    this.playing = false;
  }

  private scheduleVoice(
    event: NoteEvent,
    start: number,
    duration: number,
    context: AudioContext,
    destination: AudioNode
  ) {
    const frequency = midiToHz(event.midi);
    const voice = event.voice as Voice;
    if (voice === "piano") this.schedulePiano(frequency, event.velocity, start, duration, context, destination);
    if (voice === "bell") this.scheduleBell(frequency, event.velocity, start, duration, context, destination);
    if (voice === "pad") this.schedulePad(frequency, event.velocity, start, duration, context, destination);
  }

  private schedulePiano(frequency: number, velocity: number, start: number, duration: number, context: AudioContext, destination: AudioNode) {
    const output = context.createGain();
    const tone = context.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.setValueAtTime(Math.min(6200, frequency * 13), start);
    tone.frequency.exponentialRampToValueAtTime(Math.max(900, frequency * 3.5), start + Math.min(0.35, duration));
    output.gain.setValueAtTime(0.0001, start);
    output.gain.linearRampToValueAtTime(velocity, start + 0.012);
    output.gain.exponentialRampToValueAtTime(Math.max(0.0002, velocity * 0.24), start + Math.min(0.45, duration * 0.55));
    output.gain.setTargetAtTime(0.0001, start + Math.min(0.5, duration * 0.6), Math.max(0.12, duration * 0.55));
    tone.connect(output);
    output.connect(destination);

    const partials = [
      { ratio: 1, gain: 1 },
      { ratio: 2.001, gain: 0.24 },
      { ratio: 3.009, gain: 0.075 },
      { ratio: 4.02, gain: 0.025 }
    ];
    for (const partial of partials) {
      const oscillator = context.createOscillator();
      const partialGain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency * partial.ratio;
      partialGain.gain.value = partial.gain;
      oscillator.connect(partialGain);
      partialGain.connect(tone);
      oscillator.start(start);
      oscillator.stop(start + duration + 1.2);
      this.scheduled.push(oscillator);
    }
  }

  private scheduleBell(frequency: number, velocity: number, start: number, duration: number, context: AudioContext, destination: AudioNode) {
    const output = context.createGain();
    output.gain.setValueAtTime(0.0001, start);
    output.gain.linearRampToValueAtTime(velocity, start + 0.008);
    output.gain.exponentialRampToValueAtTime(0.0001, start + Math.max(0.5, duration));
    const tone = context.createBiquadFilter();
    tone.type = "highpass";
    tone.frequency.value = 500;
    tone.connect(output);
    output.connect(destination);

    for (const [ratio, level] of [[1, 1], [2.756, 0.22], [5.404, 0.07]] as const) {
      const oscillator = context.createOscillator();
      const partialGain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency * ratio;
      partialGain.gain.value = level;
      oscillator.connect(partialGain);
      partialGain.connect(tone);
      oscillator.start(start);
      oscillator.stop(start + Math.max(duration, 1.8) + 0.3);
      this.scheduled.push(oscillator);
    }
  }

  private schedulePad(frequency: number, velocity: number, start: number, duration: number, context: AudioContext, destination: AudioNode) {
    const output = context.createGain();
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1450;
    filter.Q.value = 0.5;
    output.gain.setValueAtTime(0.0001, start);
    output.gain.linearRampToValueAtTime(velocity, start + 1.1);
    output.gain.setTargetAtTime(Math.max(0.0001, velocity * 0.72), start + 1.1, 0.8);
    output.gain.setTargetAtTime(0.0001, start + duration - 0.6, 0.45);
    filter.connect(output);
    output.connect(destination);

    for (const [ratio, level, detune] of [[1, 0.6, -5], [1.003, 0.4, 5]] as const) {
      const oscillator = context.createOscillator();
      const partialGain = context.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.value = frequency * ratio;
      oscillator.detune.value = detune;
      partialGain.gain.value = level;
      oscillator.connect(partialGain);
      partialGain.connect(filter);
      oscillator.start(start);
      oscillator.stop(start + duration + 1);
      this.scheduled.push(oscillator);
    }
  }
}
