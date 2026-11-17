export type NoteEvent = {
  beat: number;
  duration: number;
  midi: number;
  velocity: number;
  voice: "piano" | "bell" | "pad";
};

export type Composition = {
  title: string;
  subtitle: string;
  bpm: number;
  beatsPerBar: number;
  bars: number;
  events: NoteEvent[];
};

const piano: NoteEvent[] = [
  // Bar 1 — Cmaj9, melody enters gently.
  { beat: 0, duration: 3.5, midi: 48, velocity: 0.38, voice: "piano" },
  { beat: 0, duration: 3.5, midi: 55, velocity: 0.25, voice: "piano" },
  { beat: 0, duration: 3.5, midi: 59, velocity: 0.23, voice: "piano" },
  { beat: 0, duration: 3.5, midi: 62, velocity: 0.22, voice: "piano" },
  { beat: 0, duration: 3.5, midi: 64, velocity: 0.24, voice: "piano" },
  { beat: 0, duration: 1.5, midi: 76, velocity: 0.34, voice: "piano" },
  { beat: 1.5, duration: 0.75, midi: 79, velocity: 0.25, voice: "piano" },
  { beat: 2.5, duration: 1.1, midi: 76, velocity: 0.28, voice: "piano" },

  // Bar 2 — Am7, melody answers and settles.
  { beat: 4, duration: 3.5, midi: 45, velocity: 0.34, voice: "piano" },
  { beat: 4, duration: 3.5, midi: 52, velocity: 0.23, voice: "piano" },
  { beat: 4, duration: 3.5, midi: 55, velocity: 0.22, voice: "piano" },
  { beat: 4, duration: 3.5, midi: 59, velocity: 0.22, voice: "piano" },
  { beat: 4, duration: 1.4, midi: 81, velocity: 0.29, voice: "piano" },
  { beat: 5.5, duration: 0.8, midi: 79, velocity: 0.24, voice: "piano" },
  { beat: 6.5, duration: 1.0, midi: 76, velocity: 0.26, voice: "piano" },

  // Bar 3 — Fmaj7, gentle lift.
  { beat: 8, duration: 3.5, midi: 41, velocity: 0.34, voice: "piano" },
  { beat: 8, duration: 3.5, midi: 53, velocity: 0.22, voice: "piano" },
  { beat: 8, duration: 3.5, midi: 57, velocity: 0.22, voice: "piano" },
  { beat: 8, duration: 3.5, midi: 60, velocity: 0.22, voice: "piano" },
  { beat: 8, duration: 3.5, midi: 64, velocity: 0.2, voice: "piano" },
  { beat: 8, duration: 1.4, midi: 77, velocity: 0.28, voice: "piano" },
  { beat: 9.5, duration: 0.8, midi: 76, velocity: 0.23, voice: "piano" },
  { beat: 10.5, duration: 1.0, midi: 72, velocity: 0.25, voice: "piano" },

  // Bar 4 — G6 resolving to Cmaj9.
  { beat: 12, duration: 2.0, midi: 43, velocity: 0.32, voice: "piano" },
  { beat: 12, duration: 2.0, midi: 50, velocity: 0.2, voice: "piano" },
  { beat: 12, duration: 2.0, midi: 55, velocity: 0.2, voice: "piano" },
  { beat: 12, duration: 2.0, midi: 59, velocity: 0.2, voice: "piano" },
  { beat: 12, duration: 1.0, midi: 74, velocity: 0.27, voice: "piano" },
  { beat: 13.25, duration: 0.7, midi: 71, velocity: 0.22, voice: "piano" },
  { beat: 14, duration: 1.7, midi: 72, velocity: 0.3, voice: "piano" },
  { beat: 14, duration: 1.7, midi: 48, velocity: 0.28, voice: "piano" },
  { beat: 14, duration: 1.7, midi: 55, velocity: 0.18, voice: "piano" },
  { beat: 14, duration: 1.7, midi: 59, velocity: 0.18, voice: "piano" },
  { beat: 14, duration: 1.7, midi: 64, velocity: 0.18, voice: "piano" }
];

const bells: NoteEvent[] = [
  { beat: 3.5, duration: 1.6, midi: 84, velocity: 0.12, voice: "bell" },
  { beat: 7.25, duration: 1.8, midi: 83, velocity: 0.1, voice: "bell" },
  { beat: 11.5, duration: 1.8, midi: 81, velocity: 0.1, voice: "bell" },
  { beat: 15.5, duration: 2.0, midi: 84, velocity: 0.09, voice: "bell" }
];

const pads: NoteEvent[] = [
  { beat: 0, duration: 7.8, midi: 60, velocity: 0.075, voice: "pad" },
  { beat: 0, duration: 7.8, midi: 64, velocity: 0.055, voice: "pad" },
  { beat: 0, duration: 7.8, midi: 67, velocity: 0.05, voice: "pad" },
  { beat: 8, duration: 7.8, midi: 57, velocity: 0.07, voice: "pad" },
  { beat: 8, duration: 7.8, midi: 60, velocity: 0.05, voice: "pad" },
  { beat: 8, duration: 7.8, midi: 64, velocity: 0.05, voice: "pad" }
];

export const firstComposition: Composition = {
  title: "A Quiet Welcome",
  subtitle: "Original four-bar study · C major · 4/4 · Cmaj9 – Am7 – Fmaj7 – G6",
  bpm:  sixtyEight,
  beatsPerBar: 4,
  bars: 4,
  events: [...piano, ...bells, ...pads]
};

const sixtyEight = 68;
