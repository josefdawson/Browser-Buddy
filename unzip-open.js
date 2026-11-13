/* =========================================================
   Browser Buddy — Unzip & Open
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  const STEPS = [
    { text: "Download the party_photos.zip file.", action: "download" },
    { text: "Find party_photos.zip in your Downloads folder.", action: "find" },
    { text: "Tap 'Extract' to unzip the folder.", action: "extract" },
    { text: "Open one of the photos inside.", action: "open" },
  ];

  let step = 0, downloaded = false, found = false, extracted = false, opened = false;

  function render() {
    const area = $("#uz-area");
    $("#uz-step").textContent = (step + 1) + " / " + STEPS.length;
    $("#uz-instr").textContent = STEPS[step].text;
    area.innerHTML = "";

    if (step === 0) {
      area.innerHTML = '<button class="fake-link" id="uz-dl">⬇ Download party_photos.zip</button>';
      $("#uz-dl").addEventListener("click", () => { downloaded = true; BB.toast("Downloaded!", "good", 1200); advance(); });
    } else if (step === 1) {
      area.innerHTML = '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<button class="fake-link" data-f="wrong1">📄 notes.txt</button>' +
        '<button class="fake-link" data-f="zip">📦 party_photos.zip</button>' +
        '<button class="fake-link" data-f="wrong2">🎵 song.mp3</button></div>';
      area.querySelectorAll("[data-f]").forEach((b) => {
        b.addEventListener("click", () => {
          if (b.dataset.f === "zip") { found = true; BB.toast("✓ Found it!", "good", 1200); advance(); }
          else BB.toast("That's not the zip file. Look for party_photos.zip.", "warn");
        });
      });
    } else if (step === 2) {
      area.innerHTML = '<div style="background:#fff;border:2px solid var(--line);border-radius:10px;padding:14px">' +
        '<p><strong>party_photos.zip</strong></p>' +
        '<button class="btn btn-primary" id="uz-extract">📦 Extract / Unzip</button>' +
        '<button class="btn btn-ghost" id="uz-openzip">Open (without extracting)</button></div>';
      $("#uz-extract").addEventListener("click", () => { extracted = true; BB.toast("✓ Extracted!", "good", 1200); advance(); });
      $("#uz-openzip").addEventListener("click", () => BB.toast("That just shows the zip contents. Use Extract first.", "warn"));
    } else if (step === 3) {
      area.innerHTML = '<p>The folder "party_photos" contains:</p>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<button class="fake-link" data-p="p1">🖼️ photo1.jpg</button>' +
        '<button class="fake-link" data-p="p2">🖼️ photo2.jpg</button>' +
        '<button class="fake-link" data-p="p3">📄 readme.txt</button></div>';
      area.querySelectorAll("[data-p]").forEach((b) => {
        b.addEventListener("click", () => {
          if (b.dataset.p.startsWith("p")) {
            opened = true;
            BB.toast("✓ Opened the photo!", "good", 1200);
            endGame();
          } else {
            BB.toast("That's a text file. Open a photo.", "warn");
          }
        });
      });
    }
  }

  function advance() {
    step++;
    if (step >= STEPS.length) { endGame(); return; }
    render();
  }

  function endGame() {
    const over = $("#uz-over");
    over.style.display = "block";
    over.innerHTML = '<div class="big">🎉</div><h2>Done!</h2><p>You extracted and opened the photos.</p><div class="game-actions"><button class="btn btn-primary btn-big" id="uz-replay">Play again</button></div>';
    $("#uz-replay").addEventListener("click", () => location.reload());
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.createElement("button");
    btn.className = "btn btn-primary btn-big";
    btn.textContent = "Start game";
    btn.addEventListener("click", () => { btn.style.display = "none"; render(); });
    document.querySelector("main").appendChild(btn);
  });
})();
