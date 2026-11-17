export type NoteEvent = {
  beat: number;
  duration: number;
  midi: number;
  velocity: number;
  // Small, authored timing deviations create a gentle human breath.
  timingOffset?: number;
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

type ChordBar = {
  bass: number;
  arpeggio: readonly [number, number, number];
  pad: readonly [number, number];
};

// The harmony and every melodic note are written explicitly.
// Each bar is three quarter-note beats: a gentle, lilting waltz.
const harmony: ChordBar[] = [
  { bass: 50, arpeggio: [66, 69, 76], pad: [62, 69] }, // Dadd9
  { bass: 49, arpeggio: [64, 69, 76], pad: [61, 69] }, // A/C#
  { bass: 47, arpeggio: [62, 66, 73], pad: [59, 66] }, // Bm7
  { bass: 43, arpeggio: [59, 62, 66], pad: [59, 66] }, // Gmaj7
  { bass: 42, arpeggio: [62, 66, 74], pad: [57, 66] }, // D/F#
  { bass: 40, arpeggio: [59, 62, 71], pad: [55, 64] }, // Em7
  { bass: 45, arpeggio: [62, 64, 71], pad: [57, 64] }, // Asus4
  { bass: 45, arpeggio: [61, 64, 69], pad: [55, 64] }, // A7
  { bass: 47, arpeggio: [62, 66, 73], pad: [59, 66] }, // Bm7
  { bass: 45, arpeggio: [61, 66, 73], pad: [57, 66] }, // F#m/A
  { bass: 43, arpeggio: [62, 66, 69], pad: [59, 69] }, // Gmaj9
  { bass: 42, arpeggio: [62, 66, 74], pad: [57, 66] }, // D/F#
  { bass: 40, arpeggio: [62, 67, 74], pad: [59, 67] }, // Em9
  { bass: 45, arpeggio: [62, 67, 74], pad: [59, 67] }, // G/A
  { bass: 45, arpeggio: [61, 64, 71], pad: [55, 64] }, // A7
  { bass: 50, arpeggio: [66, 69, 76], pad: [62, 69] }  // Dadd9
];

type MelodyNote = readonly [
  beat: number,
  midi: number,
  duration: number,
  velocity: number,
  timingOffset: number
];

// Four related phrases: the opening theme, a lifted variation, a wider
// middle passage, and a quiet return to the home key.
const melody: readonly MelodyNote[][] = [
  // Phrase I — a small rising question, then a warm answer.
  [
    [0, 78, 0.72, 0.30, 0],
    [0.75, 81, 0.45, 0.25, 0.015],
    [1.5, 86, 1.15, 0.34, 0.025]
  ],
  [
    [0, 85, 0.72, 0.30, -0.01],
    [0.75, 81, 0.48, 0.25, 0],
    [1.5, 76, 1.2, 0.29, 0.02]
  ],
  [
    [0, 78, 0.55, 0.27, 0],
    [0.75, 81, 0.55, 0.28, 0.012],
    [1.5, 83, 0.75, 0.31, 0.025],
    [2.25, 81, 0.5, 0.22, -0.01]
  ],
  [
    [0, 79, 0.75, 0.28, 0],
    [0.75, 78, 0.5, 0.24, 0.015],
    [1.5, 74, 0.75, 0.26, 0.025],
    [2.25, 71, 0.55, 0.21, -0.01]
  ],

  // Phrase II — the same musical thought opens into a brighter register.
  [
    [0, 81, 0.65, 0.29, 0],
    [0.75, 86, 0.55, 0.32, 0.015],
    [1.5, 88, 0.9, 0.34, 0.025],
    [2.5, 86, 0.4, 0.22, -0.012]
  ],
  [
    [0, 83, 0.7, 0.29, 0],
    [0.75, 79, 0.5, 0.24, 0.015],
    [1.5, 78, 0.75, 0.26, 0.02],
    [2.25, 76, 0.55, 0.22, -0.012]
  ],
  [
    [0, 76, 0.55, 0.23, 0],
    [0.75, 81, 0.55, 0.26, 0.02],
    [1.5, 85, 0.8, 0.31, 0.025],
    [2.25, 83, 0.5, 0.23, -0.01]
  ],
  [
    [0, 81, 0.7, 0.28, 0],
    [0.75, 79, 0.5, 0.24, 0.015],
    [1.5, 76, 0.75, 0.25, 0.02],
    [2.25, 73, 0.55, 0.21, -0.015]
  ],

  // Phrase III — a more open, gently rising middle passage.
  [
    [0, 78, 0.7, 0.27, 0],
    [0.75, 83, 0.5, 0.25, 0.015],
    [1.5, 86, 0.85, 0.33, 0.025],
    [2.25, 85, 0.5, 0.23, -0.01]
  ],
  [
    [0, 81, 0.55, 0.26, 0],
    [0.75, 85, 0.55, 0.29, 0.015],
    [1.5, 88, 0.9, 0.34, 0.025],
    [2.5, 85, 0.4, 0.23, -0.01]
  ],
  [
    [0, 83, 0.7, 0.29, 0],
    [0.75, 81, 0.5, 0.25, 0.015],
    [1.5, 79, 0.8, 0.29, 0.02],
    [2.35, 74, 0.48, 0.21, -0.01]
  ],
  [
    [0, 78, 0.7, 0.27, 0],
    [0.75, 81, 0.5, 0.26, 0.015],
    [1.5, 86, 0.75, 0.34, 0.025],
    [2.25, 90, 0.55, 0.31, 0.02]
  ],

  // Phrase IV — the theme returns, then settles into a long D-major ending.
  [
    [0, 88, 0.65, 0.30, 0],
    [0.75, 86, 0.5, 0.26, 0.015],
    [1.5, 83, 0.75, 0.28, 0.02],
    [2.25, 79, 0.55, 0.23, -0.01]
  ],
  [
    [0, 81, 0.68, 0.26, 0],
    [0.75, 83, 0.5, 0.26, 0.015],
    [1.5, 86, 0.9, 0.33, 0.025],
    [2.5, 83, 0.4, 0.22, -0.01]
  ],
  [
    [0, 81, 0.65, 0.28, 0],
    [0.75, 78, 0.55, 0.24, 0.015],
    [1.5, 76, 0.75, 0.26, 0.02],
    [2.25, 73, 0.55, 0.21, -0.01]
  ],
  [
    [0, 74, 0.75, 0.29, 0],
    [0.75, 78, 0.5, 0.25, 0.015],
    [1.5, 81, 0.75, 0.28, 0.02],
    [2.25, 86, 1.25, 0.32, 0.025]
  ]
];

const accompaniment: NoteEvent[] = harmony.flatMap((chord, bar) => {
  const start = bar * 3;
  const [first, second, third] = chord.arpeggio;
  const upperPattern: readonly number[] =
    bar % 4 === 3 ? [third, first, second] : [second, third, first];

  return [
    {
      beat: start,
      duration: 0.72,
      midi: chord.bass,
      velocity: bar % 4 === 0 ? 0.18 : 0.155,
      voice: "piano"
    },
    ...upperPattern.map((midi, index) => ({
      beat: start + [0.52, 1.5, 2.48][index],
      duration: 0.44,
      midi,
      velocity: [0.105, 0.12, 0.095][index],
      timingOffset: index === 2 ? -0.008 : 0,
      voice: "piano" as const
    }))
  ];
});

const melodyEvents: NoteEvent[] = melody.flatMap((barNotes, bar) =>
  barNotes.map(([beat, midi, duration, velocity, timingOffset]) => ({
    beat: bar * 3 + beat,
    duration,
    midi,
    velocity,
    timingOffset,
    voice: "piano" as const
  }))
);

// Bell notes answer only at phrase edges, leaving the melody room to breathe.
const bellNotes: readonly (readonly [number, number, number, number])[] = [
  [1, 2.52, 93, 0.075],
  [3, 2.58, 95, 0.08],
  [5, 2.52, 98, 0.085],
  [7, 2.58, 93, 0.07],
  [9, 2.52, 98, 0.08],
  [11, 2.58, 100, 0.075],
  [13, 2.52, 93, 0.07],
  [15, 2.7, 98, 0.085]
];

const bells: NoteEvent[] = bellNotes.map(([bar, beat, midi, velocity]) => ({
  beat: bar * 3 + beat,
  duration: 1.45,
  midi,
  velocity,
  timingOffset: 0.018,
  voice: "bell"
}));

const pads: NoteEvent[] = harmony.flatMap((chord, bar) =>
  chord.pad.map((midi, index) => ({
    beat: bar * 3,
    duration: 3.15,
    midi,
    velocity: index === 0 ? 0.028 : 0.021,
    voice: "pad" as const
  }))
);

export const firstComposition: Composition = {
  title: "Lanterns Over the Hills",
  subtitle: "Original 16-bar waltz · D major · 3/4 · Dadd9 – A/C# – Bm7 – Gmaj7",
  bpm: 86,
  beatsPerBar: 3,
  bars: 16,
  events: [...accompaniment, ...melodyEvents, ...bells, ...pads]
};
