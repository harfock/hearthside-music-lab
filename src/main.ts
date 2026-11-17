import "./style.css";
import { MusicEngine } from "./audio/engine";
import { firstComposition, secondComposition, thirdComposition, fourthComposition } from "./music/score";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Application root not found");

const engine = new MusicEngine();
const compositions = [firstComposition, secondComposition, thirdComposition, fourthComposition];
const compositionDetails = [
  { mood: "Ambient · Dreamlike · 54 BPM", label: "EVOLVING AMBIENT ARRANGEMENT", instruments: [["Soft plucked strings", "SPARSE ORIGINAL MOTIF"], ["Glass harmonics", "OCCASIONAL DISTANT LIGHT"], ["Warm evolving pads", "LONG, BREATHING CHORDS"]], note: "A slow ambient composition with a recurring motif, a gradual opening of texture, and a final D-major chord fading into the room." },
  { mood: "Cinematic · Gentle · 54 BPM", label: "CINEMATIC THEMATIC ARRANGEMENT", instruments: [["Harp-like arpeggios", "GENTLE FORWARD MOTION"], ["Flute-like lead", "ORIGINAL SINGABLE THEME"], ["Warm string ensemble", "GRADUAL ORCHESTRAL BUILD"]], note: "An original cinematic theme with harp-like arpeggios, a flute-like lead and layered strings." },
  { mood: "Singing bowl · Still · 42 BPM", label: "SLOW SINGING-BOWL SOUNDscape", instruments: [["Medium singing bowl", "LONG, SOFT RESONANCE"], ["Warm harmonic bed", "SLOW CHORD CHANGES"], ["Low gentle drone", "QUIET FOUNDATION"]], note: "A restrained reading soundscape: one softly struck medium-register bowl tone every few bars, long resonance, and almost motionless harmony." },
  { mood: "Singing bowl · Spacious · 40 BPM", label: "LAYERED BOWL AND STRING SOUNDscape", instruments: [["Medium singing bowl", "GENTLE, SPACED STRIKES"], ["Soft string cloud", "SLOW SUSTAINED CHORDS"], ["Low gentle drone", "NO RHYTHMIC PULSE"]], note: "A second reading soundscape with more frequent but still widely spaced bowl tones, warm strings, a narrow register and no dramatic build." }
];
let selectedComposition = compositions[selectedIndex];

app.innerHTML = `
  <main class="shell">
    <header class="topbar">
      <a class="brand" href="#" aria-label="Hearthside Music Lab home">
        <span class="brand-mark">♪</span>
        <span><strong>HEARTHSIDE</strong><small>MUSIC LAB</small></span>
      </a>
      <span class="local-tag"><i></i> LOCAL AUDIO · NO DOWNLOADS</span>
    </header>

    <section class="intro">
      <p class="eyebrow">COMPOSITION WORKSPACE / 004</p>
      <h1>Music for<br><em>imagined worlds.</em></h1>
      <p class="intro-copy">Four original sound worlds, including two new slow reading soundscapes, synthesised entirely in your browser.</p>
    </section>

    <section class="library">
      <p class="eyebrow">THE COMPOSITION COLLECTION</p>
      <div class="composition-list">
        ${compositions.map((composition, index) => `
          <button class="composition-option ${index === 0 ? "selected" : ""}" data-composition="${index}" type="button" aria-pressed="${index === 0}">
            <span class="option-number">0${index + 1}</span>
            <span class="option-copy"><strong>${composition.title}</strong><small>${compositionDetails[index].mood}</small></span>
            <span class="option-state">${index === 0 ? "SELECTED" : "LISTEN"}</span>
          </button>
        `).join("")}
      </div>
    </section>

    <section class="studio">
      <div class="studio-heading">
        <div>
          <p class="eyebrow">SELECTED COMPOSITION</p>
          <h2 id="composition-title">${firstComposition.title}</h2>
          <p class="score-meta" id="composition-meta">${firstComposition.subtitle}</p>
        </div>
        <span class="study-number" id="composition-number">NO. 01</span>
      </div>

      <div class="score-card">
        <div class="score-topline"><span id="arrangement-label">EVOLVING AMBIENT ARRANGEMENT</span><span id="composition-length">${firstComposition.bars} BARS / ${firstComposition.bpm} BPM · 4/4</span></div>
        <div class="staff" aria-label="A musical score illustration with a rising melodic line">
          <div class="bar"><span class="chord">I · BEGIN</span><span class="note n1">●</span><span class="note n3">●</span></div>
          <div class="bar"><span class="chord">II · LIFT</span><span class="note n2">●</span><span class="note n4">●</span></div>
          <div class="bar"><span class="chord">III · OPEN</span><span class="note n1">●</span><span class="note n5">●</span></div>
          <div class="bar"><span class="chord">IV · RETURN</span><span class="note n2">●</span><span class="note n3">●</span></div>
        </div>
        <div class="tracks" id="instrument-list">
          <div><span class="track-dot piano"></span><span>Soft plucked strings</span><small>SPARSE ORIGINAL MOTIF</small></div>
          <div><span class="track-dot bell"></span><span>Glass harmonics</span><small>OCCASIONAL DISTANT LIGHT</small></div>
          <div><span class="track-dot pad"></span><span>Warm evolving pads</span><small>LONG, BREATHING CHORDS</small></div>
        </div>
      </div>

      <div class="player">
        <button class="play-button" id="play" type="button"><span class="play-icon">▶</span><span>Play composition</span></button>
        <button class="stop-button" id="stop" type="button" disabled>Stop</button>
        <div class="player-status" id="status" role="status">Ready when you are</div>
      </div>
      <p class="listening-note" id="listening-note">A slow 48-bar composition with six evolving sections. Listen for the recurring motif, the gradual opening of the texture, and the final D-major chord fading into the room. Every note and sound is generated locally with Web Audio API.</p>
    </section>

    <footer><span>HEARTHSIDE MUSIC LAB</span><span>ORIGINAL SCORES · SYNTHESISED LOCALLY</span></footer>
  </main>
`;

const playButton = document.querySelector<HTMLButtonElement>("#play")!;
const stopButton = document.querySelector<HTMLButtonElement>("#stop")!;
const status = document.querySelector<HTMLDivElement>("#status")!;
const title = document.querySelector<HTMLHeadingElement>("#composition-title")!;
const meta = document.querySelector<HTMLParagraphElement>("#composition-meta")!;
const number = document.querySelector<HTMLSpanElement>("#composition-number")!;
const length = document.querySelector<HTMLSpanElement>("#composition-length")!;
const arrangement = document.querySelector<HTMLSpanElement>("#arrangement-label")!;
const instruments = document.querySelector<HTMLDivElement>("#instrument-list")!;
const listeningNote = document.querySelector<HTMLParagraphElement>("#listening-note")!;
const compositionOptions = [...document.querySelectorAll<HTMLButtonElement>("[data-composition]")];

function selectTrack(index: number) {
  engine.stop();
  playButton.disabled = false;
  stopButton.disabled = true;
  selectedComposition = compositions[index];
  compositionOptions.forEach((option, optionIndex) => {
    const selected = optionIndex === index;
    option.classList.toggle("selected", selected);
    option.setAttribute("aria-pressed", String(selected));
    option.querySelector<HTMLElement>(".option-state")!.textContent = selected ? "SELECTED" : "LISTEN";
  });
  const details = compositionDetails[index];
  title.textContent = selectedComposition.title;
  meta.textContent = selectedComposition.subtitle;
  number.textContent = `NO. 0${index + 1}`;
  length.textContent = `${selectedComposition.bars} BARS / ${selectedComposition.bpm} BPM · 4/4`;
  arrangement.textContent = details.label;
  instruments.innerHTML = details.instruments.map(([name, caption], i) =>
    `<div><span class="track-dot ${["piano", "bell", "pad"][i]}"></span><span>${name}</span><small>${caption}</small></div>`
  ).join("");
  listeningNote.textContent = details.note;
  status.textContent = "Ready when you are";
}

compositionOptions.forEach((option) => {
  option.addEventListener("click", () => selectTrack(Number(option.dataset.composition)));
});

playButton.addEventListener("click", async () => {
  playButton.disabled = true;
  status.textContent = "Preparing audio…";
  try {
    const playingTitle = selectedComposition.title;
    await engine.play(selectedComposition, () => {
      playButton.disabled = false;
      stopButton.disabled = true;
      status.textContent = "Composition finished";
    });
    stopButton.disabled = false;
    status.textContent = `Playing · ${playingTitle}`;
  } catch (error) {
    playButton.disabled = false;
    status.textContent = error instanceof Error ? error.message : "Audio could not start";
  }
});

stopButton.addEventListener("click", () => {
  engine.stop();
  playButton.disabled = false;
  stopButton.disabled = true;
  status.textContent = "Stopped";
});
