export type NoteEvent = {
  beat: number;
  duration: number;
  midi: number;
  velocity: number;
  timingOffset?: number;
  voice: "pluck" | "pad" | "bass" | "bell" | "strings" | "flute";
};

export type Composition = {
  title: string;
  subtitle: string;
  bpm: number;
  beatsPerBar: number;
  bars: number;
  events: NoteEvent[];
};

type Chord = {
  bass: number;
  pad: readonly [number, number, number];
  plucks: readonly [number, number, number, number];
  name: string;
};

// A slow, open D-major progression with shared tones and gentle bass motion.
const harmony: readonly Chord[] = [
  { name: "Dmaj9", bass: 38, pad: [62, 66, 69], plucks: [69, 74, 76, 81] },
  { name: "A/C#", bass: 37, pad: [61, 64, 69], plucks: [69, 73, 76, 81] },
  { name: "Bm7", bass: 35, pad: [59, 62, 66], plucks: [66, 71, 74, 78] },
  { name: "Gmaj9", bass: 31, pad: [59, 62, 66], plucks: [67, 71, 74, 78] },
  { name: "D/F#", bass: 30, pad: [57, 62, 66], plucks: [66, 69, 74, 78] },
  { name: "Em9", bass: 28, pad: [55, 59, 64], plucks: [64, 69, 71, 76] },
  { name: "Gmaj7", bass: 31, pad: [55, 59, 62], plucks: [67, 71, 74, 78] },
  { name: "Asus4", bass: 33, pad: [57, 61, 64], plucks: [69, 73, 76, 81] }
];

type PhraseNote = readonly [beat: number, midi: number, duration: number, velocity: number];

// An eight-bar motif: spacious, mostly stepwise, and deliberately unresolved
// until the final bar. It is varied by arrangement, never randomised.
const motif: readonly (readonly PhraseNote[])[] = [
  [[0.5, 81, 1.35, 0.15], [2.65, 78, 0.85, 0.12]],
  [[1.0, 76, 1.8, 0.13]],
  [[0.5, 78, 1.2, 0.14], [2.55, 81, 0.95, 0.12]],
  [[1.25, 83, 1.9, 0.15]],
  [[0.5, 81, 1.25, 0.14], [2.65, 78, 0.8, 0.11]],
  [[1.0, 76, 1.8, 0.13]],
  [[0.5, 74, 1.2, 0.13], [2.55, 78, 0.9, 0.11]],
  [[0.75, 81, 2.45, 0.15]]
];

const events: NoteEvent[] = [];
const bars = 48;

for (let bar = 0; bar < bars; bar += 1) {
  const cycle = Math.floor(bar / 8);
  const phraseBar = bar % 8;
  const chord = harmony[phraseBar];
  const start = bar * 4;
  const isOpening = cycle === 0;
  const isMiddle = cycle === 2 || cycle === 4;
  const isOutro = cycle === 5;

  // Slow, overlapping harmonic bed. The last phrase thins towards the end.
  chord.pad.forEach((midi, index) => {
    events.push({
      beat: start,
      duration: 4.15,
      midi: midi + (cycle === 4 && index === 2 ? 12 : 0),
      velocity: (isOpening ? 0.026 : 0.034) * (isOutro ? 0.72 : 1),
      voice: "pad"
    });
  });

  // Soft bass anchors every other bar, with a little more movement in the middle.
  if (phraseBar % 2 === 0 || isMiddle) {
    events.push({
      beat: start,
      duration: 3.65,
      midi: chord.bass,
      velocity: isOpening ? 0.105 : 0.13,
      voice: "bass"
    });
  }

  // Sparse broken-chord notes create a quiet sense of motion without a beat.
  if (phraseBar % 2 === 0 || isMiddle) {
    const order = phraseBar % 4 === 0 ? [0, 2, 1] : [1, 3, 2];
    order.forEach((toneIndex, index) => {
      if (isOutro && phraseBar > 3 && index === 2) return;
      events.push({
        beat: start + [0.55, 2.0, 3.15][index],
        duration: [1.25, 1.05, 1.45][index],
        midi: chord.plucks[toneIndex],
        velocity: [0.075, 0.062, 0.052][index] * (isOpening ? 0.78 : 1),
        timingOffset: [0.012, -0.018, 0.02][index],
        voice: "pluck"
      });
    });
  }

  // The recurring motif changes register and density across the six sections.
  const phrase = motif[phraseBar];
  phrase.forEach(([beat, midi, duration, velocity], noteIndex) => {
    if (cycle === 3 && phraseBar % 2 === 1) return;
    const octaveLift = (cycle === 2 && noteIndex === 0) || cycle === 4 ? 12 : 0;
    const closingDrop = isOutro && phraseBar >= 5 ? -12 : 0;
    events.push({
      beat: start + beat,
      duration: duration * (isOutro ? 1.18 : 1),
      midi: midi + octaveLift + closingDrop,
      velocity: velocity * (isOpening ? 0.72 : isMiddle ? 1.08 : 0.92),
      timingOffset: noteIndex === 1 ? 0.018 : -0.012,
      voice: "pluck"
    });
  });

  // Occasional high glass tones, reserved for phrase transitions.
  if ((phraseBar === 3 || phraseBar === 7) && cycle > 0 && cycle < 5) {
    events.push({
      beat: start + (phraseBar === 7 ? 3.25 : 3.45),
      duration: 2.6,
      midi: phraseBar === 7 ? 93 : 90,
      velocity: cycle === 2 || cycle === 4 ? 0.052 : 0.035,
      timingOffset: 0.025,
      voice: "bell"
    });
  }
}

// A final, long D-major sonority lets the ambience settle naturally.
events.push(
  { beat: bars * 4, duration: 7.5, midi: 62, velocity: 0.035, voice: "pad" },
  { beat: bars * 4, duration: 7.5, midi: 66, velocity: 0.028, voice: "pad" },
  { beat: bars * 4, duration: 7.5, midi: 69, velocity: 0.024, voice: "pad" },
  { beat: bars * 4, duration: 6.8, midi: 38, velocity: 0.075, voice: "bass" },
  { beat: bars * 4 + 0.6, duration: 4.2, midi: 74, velocity: 0.09, voice: "pluck" }
);

export const firstComposition: Composition = {
  title: "A Quiet Place Between Stars",
  subtitle: "Original ambient composition · D major · 4/4 · Dmaj9 – A/C# – Bm7 – Gmaj9",
  bpm: 72,
  beatsPerBar: 4,
  bars,
  events
};


type CinematicChord = {
  bass: number;
  tones: readonly [number, number, number, number];
  harp: readonly [number, number, number, number];
};

const cinematicHarmony: readonly CinematicChord[] = [
  { bass: 43, tones: [55, 59, 62, 69], harp: [67, 71, 74, 79] },
  { bass: 41, tones: [53, 57, 62, 67], harp: [65, 69, 74, 77] },
  { bass: 40, tones: [52, 55, 59, 64], harp: [64, 67, 71, 76] },
  { bass: 36, tones: [48, 55, 60, 64], harp: [60, 64, 67, 72] },
  { bass: 35, tones: [47, 55, 59, 62], harp: [62, 67, 71, 74] },
  { bass: 45, tones: [57, 60, 64, 69], harp: [64, 69, 72, 76] },
  { bass: 48, tones: [60, 64, 67, 71], harp: [67, 72, 76, 79] },
  { bass: 38, tones: [50, 57, 62, 67], harp: [66, 69, 74, 78] }
];

type CinematicNote = readonly [beat: number, midi: number, duration: number, velocity: number];

// A newly written eight-bar theme: broad rising arcs, a held summit,
// then a gentle descent. It is not a transcription of the film melody.
const skyTheme: readonly (readonly CinematicNote[])[] = [
  [[0, 74, 1.65, 0.12], [2, 79, 1.7, 0.14], [3.5, 81, 0.45, 0.10]],
  [[0, 79, 1.3, 0.13], [1.5, 76, 2.1, 0.12]],
  [[0, 74, 1.2, 0.12], [1.5, 76, 1.2, 0.13], [3, 79, 0.8, 0.14]],
  [[0, 81, 2.6, 0.15], [3, 79, 0.8, 0.11]],
  [[0, 78, 1.5, 0.12], [2, 81, 1.7, 0.15]],
  [[0, 83, 2.7, 0.16], [3, 81, 0.8, 0.12]],
  [[0, 79, 1.2, 0.13], [1.5, 76, 1.2, 0.12], [3, 74, 0.8, 0.11]],
  [[0, 76, 1.6, 0.12], [2, 74, 1.7, 0.10]]
];

const skyEvents: NoteEvent[] = [];
const skyBars = 48;

for (let bar = 0; bar < skyBars; bar += 1) {
  const section = Math.floor(bar / 8);
  const phraseBar = bar % 8;
  const chord = cinematicHarmony[phraseBar];
  const start = bar * 4;
  const opening = section === 0;
  const climax = section === 3 || section === 4;
  const ending = section === 5;

  // String ensemble enters quietly, then broadens in the central sections.
  chord.tones.forEach((midi, index) => {
    skyEvents.push({
      beat: start,
      duration: 4.35,
      midi: midi + (climax && index === 3 ? 12 : 0),
      velocity: (opening ? 0.018 : climax ? 0.042 : 0.03) * (ending ? 0.68 : 1),
      voice: "strings"
    });
  });

  // Harp-like broken chords provide forward motion without a drum beat.
  const harpOrder = phraseBar % 2 === 0 ? [0, 1, 2, 3] : [1, 2, 3, 2];
  harpOrder.forEach((toneIndex, index) => {
    if (ending && phraseBar > 4 && index > 1) return;
    skyEvents.push({
      beat: start + index * 0.82 + (index % 2 ? 0.035 : 0),
      duration: 1.05 + (index === 3 ? 0.45 : 0),
      midi: chord.harp[toneIndex],
      velocity: [0.055, 0.046, 0.05, 0.04][index] * (opening ? 0.78 : 1),
      timingOffset: [0.012, -0.01, 0.018, -0.014][index],
      voice: "pluck"
    });
  });

  // The bass enters after the opening phrase and grows towards the summit.
  if (section > 0 || phraseBar % 2 === 0) {
    skyEvents.push({
      beat: start,
      duration: 3.7,
      midi: chord.bass,
      velocity: (climax ? 0.16 : 0.115) * (ending ? 0.65 : 1),
      voice: "bass"
    });
  }

  // The lead theme is stated, lifted an octave, then brought home.
  skyTheme[phraseBar].forEach(([beat, midi, duration, velocity], noteIndex) => {
    if (section === 1 && phraseBar % 3 === 1) return;
    const lift = section === 2 || section === 3 ? 12 : section === 4 && noteIndex === 0 ? 12 : 0;
    const soften = ending ? -12 : 0;
    skyEvents.push({
      beat: start + beat,
      duration: duration * (ending ? 1.18 : 1),
      midi: midi + lift + soften,
      velocity: velocity * (opening ? 0.72 : climax ? 1.12 : ending ? 0.72 : 0.92),
      timingOffset: noteIndex === 0 ? -0.018 : 0.012,
      voice: "flute"
    });
  });

  // A few high chimes mark the wide-open sections, never every bar.
  if ((phraseBar === 3 || phraseBar === 7) && (section === 2 || section === 3 || section === 4)) {
    skyEvents.push({
      beat: start + 3.35,
      duration: 2.4,
      midi: phraseBar === 7 ? 91 : 88,
      velocity: section === 3 ? 0.042 : 0.026,
      voice: "bell"
    });
  }
}

// A final open G sonority with the melody resting above it.
skyEvents.push(
  { beat: skyBars * 4, duration: 8, midi: 55, velocity: 0.028, voice: "strings" },
  { beat: skyBars * 4, duration: 8, midi: 59, velocity: 0.026, voice: "strings" },
  { beat: skyBars * 4, duration: 8, midi: 62, velocity: 0.024, voice: "strings" },
  { beat: skyBars * 4, duration: 7, midi: 43, velocity: 0.07, voice: "bass" },
  { beat: skyBars * 4 + 0.5, duration: 4.8, midi: 79, velocity: 0.075, voice: "flute" }
);

export const secondComposition: Composition = {
  title: "Where the Sky Opens",
  subtitle: "Original cinematic theme · G major · 4/4 · Gadd9 – Fmaj7 – Em7 – Cmaj7",
  bpm: 96,
  beatsPerBar: 4,
  bars: skyBars,
  events: skyEvents
};
