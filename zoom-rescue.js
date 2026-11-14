/* =========================================================
   Browser Buddy — Zoom & Fit Rescue
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  const SCENARIOS = [
    { instr: "The text is tiny (30% zoom). Make it normal (100%).", zoom: 0.3, fix: "zoom-in", target: 1.0 },
    { instr: "The text is huge (400% zoom). Make it normal (100%).", zoom: 4.0, fix: "zoom-out", target: 1.0 },
    { instr: "The page is in full-screen mode. Exit it (press Esc).", zoom: 1.0, fullscreen: true, fix: "esc", target: 1.0 },
    { instr: "The text is small (50% zoom). Reset to 100% with one button.", zoom: 0.5, fix: "reset", target: 1.0 },
    { instr: "The page is zoomed to 200%. Zoom out to 100%.", zoom: 2.0, fix: "zoom-out", target: 1.0 },
    { instr: "Everything is tiny (40% zoom). Zoom in to 100%.", zoom: 0.4, fix: "zoom-in", target: 1.0 },
  ];

  let score = 0, round = 0, total = SCENARIOS.length, zoom = 1.0, fullscreen = false;

  function render() {
    const content = $("#zr-content");
    content.style.fontSize = Math.round(zoom * 100) + "%";
    content.innerHTML = "<h2>Sample Article</h2><p>This is a paragraph of text. You need to fix the zoom to read it comfortably. The quick brown fox jumps over the lazy dog.</p>";
    if (fullscreen) {
      content.style.background = "#1a2233";
      content.style.color = "#fff";
      content.style.padding = "40px";
      content.style.minHeight = "300px";
    } else {
      content.style.background = "";
      content.style.color = "";
      content.style.padding = "20px";
    }
  }

  function loadRound() {
    const s = SCENARIOS[round];
    zoom = s.zoom;
    fullscreen = !!s.fullscreen;
    $("#zr-instr").textContent = s.instr;
    $("#zr-round").textContent = (round + 1) + " / " + total;
    const actions = $("#zr-actions");
    actions.innerHTML = "";
    // provide buttons
    const mkBtn = (label, act) => {
      const b = document.createElement("button");
      b.className = "btn btn-ghost";
      b.textContent = label;
      b.addEventListener("click", () => doAction(act));
      return b;
    };
    actions.appendChild(mkBtn("Zoom in (+)", "zoom-in"));
    actions.appendChild(mkBtn("Zoom out (−)", "zoom-out"));
    actions.appendChild(mkBtn("Reset (100%)", "reset"));
    if (s.fullscreen) actions.appendChild(mkBtn("Exit full-screen (Esc)", "esc"));
    render();
  }

  function doAction(act) {
    if (act === "zoom-in") zoom = Math.min(4, Math.round((zoom + 0.25) * 100) / 100);
    else if (act === "zoom-out") zoom = Math.max(0.25, Math.round((zoom - 0.25) * 100) / 100);
    else if (act === "reset") zoom = 1.0;
    else if (act === "esc") fullscreen = false;
    render();
    check();
  }

  // keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { fullscreen = false; render(); check(); }
    if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=")) { e.preventDefault(); doAction("zoom-in"); }
    if ((e.ctrlKey || e.metaKey) && e.key === "-") { e.preventDefault(); doAction("zoom-out"); }
    if ((e.ctrlKey || e.metaKey) && e.key === "0") { e.preventDefault(); doAction("reset"); }
    if (e.key === "F11") { e.preventDefault(); fullscreen = !fullscreen; render(); check(); }
  });

  function check() {
    const s = SCENARIOS[round];
    let ok = Math.abs(zoom - 1.0) < 0.01 && !fullscreen;
    if (ok) {
      score++;
      $("#zr-score").textContent = score;
      BB.toast("✓ Fixed!", "good", 1200);
      round++;
      if (round >= total) { endGame(); return; }
      $("#zr-round").textContent = (round + 1) + " / " + total;
      loadRound();
    }
  }

  function endGame() {
    if (typeof Sound !== "undefined") { Sound.complete(); Sound.confetti(); }
        const over = $("#zr-over");
    over.style.display = "block";
    const pct = Math.round((score / total) * 100);
    let msg = "Good start.";
    if (pct >= 90) msg = "Excellent! You can fix any zoom problem.";
    else if (pct >= 70) msg = "Nice work.";
    else if (pct >= 50) msg = "Halfway. Remember Ctrl+0 resets zoom.";
    over.innerHTML = '<div class="big">🎉</div><h2>Done!</h2><p>You fixed <strong>' + score + ' of ' + total + '</strong> (' + pct + '%).</p><p>' + msg + '</p><div class="game-actions"><button class="btn btn-primary btn-big" id="zr-replay">Play again</button></div>';
    $("#zr-replay").addEventListener("click", () => {
      over.style.display = "none";
      score = 0; round = 0;
      $("#zr-score").textContent = "0";
      loadRound();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.createElement("button");
    btn.className = "btn btn-primary btn-big";
    btn.textContent = "Start game";
    btn.addEventListener("click", () => {
      btn.style.display = "none";
      loadRound();
    });
    const ga = document.createElement("div");
    ga.className = "game-actions";
    ga.appendChild(btn);
    document.querySelector("main").appendChild(ga);
  });
})();
