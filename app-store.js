/* =========================================================
   Browser Buddy — App Store Safety Check
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  const ROUNDS = [
    { search: "Flashlight", real: { name: "Flashlight", dev: "Google LLC", rating: "4.5", downloads: "10M+", sponsored: false },
      fakes: [
        { name: "Flashlight Pro", dev: "FlashApp Inc", rating: "4.8", downloads: "50K", sponsored: true },
        { name: "Super Flashlight", dev: "BrightDev", rating: "4.7", downloads: "100K", sponsored: false },
        { name: "Flash Light Free", dev: "LightApps", rating: "4.6", downloads: "200K", sponsored: false },
        { name: "Flashlight HD", dev: "HD Apps", rating: "4.9", downloads: "1M", sponsored: false },
      ]},
    { search: "Weather", real: { name: "Weather", dev: "Google LLC", rating: "4.3", downloads: "50M+", sponsored: false },
      fakes: [
        { name: "Weather Pro", dev: "WeatherSoft", rating: "4.9", downloads: "10K", sponsored: true },
        { name: "Weather Forecast", dev: "SkyApps", rating: "4.8", downloads: "500K", sponsored: false },
        { name: "Weather Live", dev: "LiveWeather", rating: "4.7", downloads: "1M", sponsored: false },
        { name: "Weather Radar", dev: "RadarInc", rating: "4.6", downloads: "2M", sponsored: false },
      ]},
    { search: "PDF Reader", real: { name: "Adobe Acrobat Reader", dev: "Adobe", rating: "4.2", downloads: "100M+", sponsored: false },
      fakes: [
        { name: "PDF Reader Free", dev: "PDFSoft", rating: "4.9", downloads: "5K", sponsored: true },
        { name: "PDF Viewer Pro", dev: "ViewApps", rating: "4.8", downloads: "50K", sponsored: false },
        { name: "PDF Reader", dev: "ReaderInc", rating: "4.7", downloads: "100K", sponsored: false },
        { name: "PDF Scanner", dev: "ScanApps", rating: "4.6", downloads: "500K", sponsored: false },
      ]},
    { search: "Calculator", real: { name: "Calculator", dev: "Google LLC", rating: "4.1", downloads: "100M+", sponsored: false },
      fakes: [
        { name: "Calculator Pro", dev: "CalcSoft", rating: "4.9", downloads: "10K", sponsored: true },
        { name: "Scientific Calc", dev: "MathApps", rating: "4.8", downloads: "100K", sponsored: false },
        { name: "Calculator Plus", dev: "PlusApps", rating: "4.7", downloads: "500K", sponsored: false },
        { name: "Calc Free", dev: "FreeCalc", rating: "4.6", downloads: "1M", sponsored: false },
      ]},
    { search: "Notes", real: { name: "Google Keep", dev: "Google LLC", rating: "4.3", downloads: "100M+", sponsored: false },
      fakes: [
        { name: "Notes Pro", dev: "NoteSoft", rating: "4.9", downloads: "5K", sponsored: true },
        { name: "Quick Notes", dev: "QuickApps", rating: "4.8", downloads: "50K", sponsored: false },
        { name: "Note Pad", dev: "PadApps", rating: "4.7", downloads: "100K", sponsored: false },
        { name: "Notes Free", dev: "FreeNotes", rating: "4.6", downloads: "1M", sponsored: false },
      ]},
  ];

  let round = 0, score = 0, total = ROUNDS.length;

  function renderRound() {
    const r = ROUNDS[round];
    $("#as-instr").textContent = "Search: " + r.search + ". Which app is the real, safe one?";
    $("#as-round").textContent = (round + 1) + " / " + total;
    const all = [r.real, ...r.fakes].sort(() => Math.random() - 0.5);
    const list = $("#as-list");
    list.innerHTML = "";
    all.forEach((app) => {
      const el = document.createElement("div");
      el.style.cssText = "background:#f6f8fd;border:2px solid var(--line);border-radius:10px;padding:12px;cursor:pointer;display:flex;align-items:center;gap:12px";
      el.innerHTML =
        '<div style="font-size:1.5rem">📱</div>' +
        '<div style="flex:1"><strong>' + app.name + '</strong><br><span style="color:var(--muted);font-size:.85rem">' + app.dev + " · ⭐ " + app.rating + " · " + app.downloads + (app.sponsored ? ' · <span style="color:#c93a3a;font-weight:700">Sponsored</span>' : "") + "</span></div>";
      el.addEventListener("click", () => {
        if (app === r.real) {
          score++;
          $("#as-score").textContent = score;
          BB.toast("✓ Correct! That's the real app.", "good", 1500);
          round++;
          if (round >= total) { endGame(); return; }
          $("#as-round").textContent = (round + 1) + " / " + total;
          renderRound();
        } else {
          BB.toast("That looks like a clone. Check the developer name and download count.", "warn");
        }
      });
      list.appendChild(el);
    });
  }

  function endGame() {
    const over = $("#as-over");
    over.style.display = "block";
    const pct = Math.round((score / total) * 100);
    over.innerHTML = '<div class="big">🎉</div><h2>Done!</h2><p>You picked <strong>' + score + ' of ' + total + '</strong> real apps (' + pct + '%).</p><div class="game-actions"><button class="btn btn-primary btn-big" id="as-replay">Play again</button></div>';
    $("#as-replay").addEventListener("click", () => { over.style.display = "none"; score = 0; round = 0; $("#as-score").textContent = "0"; $("#as-round").textContent = "1 / " + total; renderRound(); });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.createElement("button");
    btn.className = "btn btn-primary btn-big";
    btn.textContent = "Start game";
    btn.addEventListener("click", () => { btn.style.display = "none"; renderRound(); });
    document.querySelector("main").appendChild(btn);
  });
})();
