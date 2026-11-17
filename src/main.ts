import "./style.css";
import { MusicEngine } from "./audio/engine";
import { firstComposition, secondComposition } from "./music/score";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Application root not found");

const engine = new MusicEngine();
let selectedComposition = firstComposition;

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
      <p class="intro-copy">Two original sound worlds, composed note by note and synthesised entirely in your browser.</p>
    </section>

    <section class="library">
      <p class="eyebrow">THE COMPOSITION COLLECTION</p>
      <div class="composition-list">
        <button class="composition-option selected" id="select-one" type="button" aria-pressed="true">
          <span class="option-number">01</span>
          <span class="option-copy"><strong>A Quiet Place Between Stars</strong><small>Ambient · Dreamlike · 72 BPM</small></span>
          <span class="option-state">SELECTED</span>
        </button>
        <button class="composition-option" id="select-two" type="button" aria-pressed="false">
          <span class="option-number">02</span>
          <span class="option-copy"><strong>Where the Sky Opens</strong><small>Cinematic · Soaring · 96 BPM</small></span>
          <span class="option-state">LISTEN</span>
        </button>
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
const selectOne = document.querySelector<HTMLButtonElement>("#select-one")!;
const selectTwo = document.querySelector<HTMLButtonElement>("#select-two")!;

function selectTrack(which: 1 | 2) {
  engine.stop();
  playButton.disabled = false;
  stopButton.disabled = true;
  selectedComposition = which === 1 ? firstComposition : secondComposition;
  selectOne.classList.toggle("selected", which === 1);
  selectTwo.classList.toggle("selected", which === 2);
  selectOne.setAttribute("aria-pressed", String(which === 1));
  selectTwo.setAttribute("aria-pressed", String(which === 2));
  title.textContent = selectedComposition.title;
  meta.textContent = selectedComposition.subtitle;
  number.textContent = `NO. 0${which}`;
  length.textContent = `${selectedComposition.bars} BARS / ${selectedComposition.bpm} BPM · 4/4`;
  arrangement.textContent = which === 1 ? "EVOLVING AMBIENT ARRANGEMENT" : "CINEMATIC THEMATIC ARRANGEMENT";
  instruments.innerHTML = which === 1
    ? `<div><span class="track-dot piano"></span><span>Soft plucked strings</span><small>SPARSE ORIGINAL MOTIF</small></div><div><span class="track-dot bell"></span><span>Glass harmonics</span><small>OCCASIONAL DISTANT LIGHT</small></div><div><span class="track-dot pad"></span><span>Warm evolving pads</span><small>LONG, BREATHING CHORDS</small></div>`
    : `<div><span class="track-dot piano"></span><span>Harp-like arpeggios</span><small>GENTLE FORWARD MOTION</small></div><div><span class="track-dot bell"></span><span>Flute-like lead</span><small>ORIGINAL SINGABLE THEME</small></div><div><span class="track-dot pad"></span><span>Warm string ensemble</span><small>GRADUAL ORCHESTRAL BUILD</small></div>`;
  listeningNote.textContent = which === 1
    ? "A slow 48-bar ambient composition with six evolving sections. Listen for the recurring motif, the gradual opening of the texture, and the final D-major chord fading into the room."
    : "A 48-bar cinematic theme that begins intimately, lets its melody rise into a broad central statement, then gently returns home. Harp-like arpeggios, a flute-like lead and layered strings are synthesised locally.";
  status.textContent = "Ready when you are";
}

selectOne.addEventListener("click", () => selectTrack(1));
selectTwo.addEventListener("click", () => selectTrack(2));

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
