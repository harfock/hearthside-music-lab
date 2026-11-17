import "./style.css";
import { MusicEngine } from "./audio/engine";
import { firstComposition } from "./music/score";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Application root not found");

const engine = new MusicEngine();

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
      <p class="eyebrow">COMPOSITION WORKSPACE / 001</p>
      <h1>Music, written<br><em>with intention.</em></h1>
      <p class="intro-copy">A small laboratory for original compositions, deliberate harmony and carefully shaped browser instruments.</p>
    </section>

    <section class="studio">
      <div class="studio-heading">
        <div>
          <p class="eyebrow">CURRENT STUDY</p>
          <h2>${firstComposition.title}</h2>
          <p class="score-meta">${firstComposition.subtitle}</p>
        </div>
        <span class="study-number">NO. 01</span>
      </div>

      <div class="score-card">
        <div class="score-topline"><span>ARRANGEMENT</span><span>4 BARS / ${firstComposition.bpm} BPM</span></div>
        <div class="staff" aria-label="Four-bar composition overview">
          <div class="bar"><span class="chord">Cmaj9</span><span class="note n1">●</span><span class="note n2">●</span><span class="note n3">●</span><span class="note n4">●</span></div>
          <div class="bar"><span class="chord">Am7</span><span class="note n2">●</span><span class="note n4">●</span><span class="note n5">●</span></div>
          <div class="bar"><span class="chord">Fmaj7</span><span class="note n1">●</span><span class="note n3">●</span><span class="note n5">●</span></div>
          <div class="bar"><span class="chord">G6 → C</span><span class="note n2">●</span><span class="note n3">●</span><span class="note n4">●</span></div>
        </div>
        <div class="tracks">
          <div><span class="track-dot piano"></span><span>Felt-inspired piano</span><small>MELODY + HARMONY</small></div>
          <div><span class="track-dot bell"></span><span>Soft bell</span><small>SPARSE ACCENTS</small></div>
          <div><span class="track-dot pad"></span><span>Warm pad</span><small>HARMONIC BED</small></div>
        </div>
      </div>

      <div class="player">
        <button class="play-button" id="play" type="button"><span class="play-icon">▶</span><span>Play composition</span></button>
        <button class="stop-button" id="stop" type="button" disabled>Stop</button>
        <div class="player-status" id="status" role="status">Ready when you are</div>
      </div>
      <p class="listening-note">Listen for the chord movement, melody phrasing and how the three instrument layers support one another. This is a first sound-design study, not a finished instrument emulation.</p>
    </section>

    <footer><span>HEARTHSIDE MUSIC LAB</span><span>ORIGINAL SCORE · SYNTHESISED LOCALLY</span></footer>
  </main>
`;

const playButton = document.querySelector<HTMLButtonElement>("#play")!;
const stopButton = document.querySelector<HTMLButtonElement>("#stop")!;
const status = document.querySelector<HTMLDivElement>("#status")!;

playButton.addEventListener("click", async () => {
  playButton.disabled = true;
  status.textContent = "Preparing audio…";
  try {
    await engine.play(firstComposition, () => {
      playButton.disabled = false;
      stopButton.disabled = true;
      status.textContent = "Composition finished";
    });
    stopButton.disabled = false;
    status.textContent = "Playing · A Quiet Welcome";
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
