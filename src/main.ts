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
      <p class="eyebrow">COMPOSITION WORKSPACE / 003</p>
      <h1>Somewhere quiet,<br><em>between the stars.</em></h1>
      <p class="intro-copy">An original ambient soundscape: slowly changing harmony, a delicate plucked motif and warm layers that drift in and out of focus.</p>
    </section>

    <section class="studio">
      <div class="studio-heading">
        <div>
          <p class="eyebrow">CURRENT STUDY</p>
          <h2>${firstComposition.title}</h2>
          <p class="score-meta">${firstComposition.subtitle}</p>
        </div>
        <span class="study-number">NO. 03</span>
      </div>

      <div class="score-card">
        <div class="score-topline"><span>EVOLVING AMBIENT ARRANGEMENT</span><span>${firstComposition.bars} BARS / ${firstComposition.bpm} BPM · 4/4</span></div>
        <div class="staff" aria-label="Six evolving sections in the ambient composition">
          <div class="bar"><span class="chord">I · ARRIVE</span><span class="note n1">●</span><span class="note n3">●</span></div>
          <div class="bar"><span class="chord">II · DRIFT</span><span class="note n2">●</span><span class="note n4">●</span></div>
          <div class="bar"><span class="chord">III · OPEN</span><span class="note n1">●</span><span class="note n5">●</span></div>
          <div class="bar"><span class="chord">IV · BREATHE</span><span class="note n2">●</span><span class="note n3">●</span></div>
        </div>
        <div class="tracks">
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
      <p class="listening-note">A slow 48-bar composition with six evolving sections. Listen for the recurring motif, the gradual opening of the texture, and the final D-major chord fading into the room. Every note and sound is generated locally with Web Audio API.</p>
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
    status.textContent = "Playing · Dreamcatcher — A Quiet Place";
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
