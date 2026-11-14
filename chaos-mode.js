/* =========================================================
   Browser Buddy — Chaos Mode (Endless Shuffle)
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  const TASKS = [
    { type: "popup", text: "Close the pop-up (click the real ×).", render: (area) => {
      area.innerHTML = '<div style="position:relative;background:#f7f9fd;border:2px solid var(--line);border-radius:12px;min-height:180px;padding:20px"><div style="position:absolute;top:20px;left:30px;background:#fff;border:2px solid var(--line);border-radius:10px;padding:12px;width:200px"><button style="position:absolute;top:4px;right:4px;background:#eef2fb;border:none;border-radius:6px;padding:2px 6px;cursor:pointer;font-weight:700" data-fake="1">Close ✕</button><button style="position:absolute;top:-8px;right:-8px;background:#c93a3a;color:#fff;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;font-weight:700" data-real="1">×</button><h4 style="margin:0 0 4px">🎉 You won!</h4><p style="color:var(--muted);font-size:.8rem;margin:0">Claim your prize.</p></div></div>';
      area.querySelector("[data-real]").addEventListener("click", () => pass());
      area.querySelector("[data-fake]").addEventListener("click", () => { spawnExtra(area); fail(); });
    }},
    { type: "cookie", text: "Reject the cookie banner.", render: (area) => {
      area.innerHTML = '<div style="background:#fff;border:2px solid var(--line);border-radius:10px;padding:14px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap"><div style="flex:1;font-size:.9rem">This site uses cookies to track you.</div><div style="display:flex;gap:8px"><button class="btn btn-primary" data-act="accept" style="padding:6px 12px;font-size:.85rem">Accept all</button><button class="btn btn-ghost" data-act="reject" style="padding:6px 12px;font-size:.85rem">Reject all</button></div></div>';
      area.querySelector('[data-act="accept"]').addEventListener("click", () => fail());
      area.querySelector('[data-act="reject"]').addEventListener("click", () => pass());
    }},
    { type: "download", text: "Find the real download link.", render: (area) => {
      area.innerHTML = '<div style="background:#f7f9fd;border:2px solid var(--line);border-radius:12px;padding:16px"><div style="background:#fff;border:2px solid #ffb020;border-radius:10px;padding:12px;margin:8px 0;cursor:pointer" data-fake="1"><div style="font-size:1.1rem;font-weight:700;color:#c93a3a">⬇ DOWNLOAD NOW!</div><div style="font-size:.8rem;color:var(--muted)">Fast • Free • Safe</div></div><div style="background:#fff;border:2px solid #ffb020;border-radius:10px;padding:12px;margin:8px 0;cursor:pointer" data-fake="1"><div style="font-size:1.1rem;font-weight:700;color:#c93a3a">⬇ GET IT FREE</div></div><div style="background:#f0f4fc;border:1px dashed #9bb0d0;border-radius:10px;padding:10px 14px;display:inline-block;cursor:pointer;font-size:.9rem" data-real="1">📄 Download version 4.2 (6 MB)</div></div>';
      area.querySelectorAll("[data-fake]").forEach((el) => el.addEventListener("click", () => fail()));
      area.querySelector("[data-real]").addEventListener("click", () => pass());
    }},
    { type: "zoom", text: "Fix the zoom (text is tiny).", render: (area) => {
      area.innerHTML = '<div style="background:#f7f9fd;border:2px solid var(--line);border-radius:12px;padding:16px"><p style="font-size:0.4rem">This text is way too small to read.</p><div style="display:flex;gap:8px;margin-top:10px"><button class="btn btn-ghost" data-act="zin" style="padding:6px 12px;font-size:.85rem">A+</button><button class="btn btn-ghost" data-act="zout" style="padding:6px 12px;font-size:.85rem">A-</button><button class="btn btn-primary" data-act="reset" style="padding:6px 12px;font-size:.85rem">Reset 100%</button></div></div>';
      area.querySelector('[data-act="zin"]').addEventListener("click", () => fail());
      area.querySelector('[data-act="zout"]').addEventListener("click", () => fail());
      area.querySelector('[data-act="reset"]').addEventListener("click", () => pass());
    }},
    { type: "perm", text: "Block the notification request.", render: (area) => {
      area.innerHTML = '<div style="background:#fff;border:2px solid var(--line);border-radius:12px;padding:16px;max-width:320px;margin:0 auto;text-align:center"><div style="font-size:2rem">🔔</div><h4 style="margin:8px 0 4px">example.com wants to</h4><p style="color:var(--muted);font-size:.9rem;margin:0 0 10px">Show notifications</p><div style="display:flex;gap:8px;justify-content:center"><button class="btn btn-ghost" data-act="allow" style="padding:6px 12px;font-size:.85rem">Allow</button><button class="btn btn-primary" data-act="block" style="padding:6px 12px;font-size:.85rem">Block</button></div></div>';
      area.querySelector('[data-act="allow"]').addEventListener("click", () => fail());
      area.querySelector('[data-act="block"]').addEventListener("click", () => pass());
    }},
    { type: "icon", text: "Click the icon that means 'Settings'.", render: (area) => {
      const opts = shuffle([{ g: "⚙️", ok: true }, { g: "🔍", ok: false }, { g: "🏠", ok: false }, { g: "🗑️", ok: false }]);
      area.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:320px;margin:0 auto">' + opts.map((o) => '<button class="btn btn-ghost" data-ok="' + o.ok + '" style="font-size:2rem;padding:16px">' + o.g + '</button>').join("") + "</div>";
      area.querySelectorAll("button").forEach((b) => {
        b.addEventListener("click", () => { if (b.dataset.ok === "true") pass(); else fail(); });
      });
    }},
  ];

  function shuffle(a) { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; }

  let lives = 3, score = 0, streak = 0, bestStreak = 0, running = false, timer = null, timeLeft = 10, spawnExtraCount = 0;

  function updateHud() {
    $("#cm-lives").textContent = "❤️".repeat(lives) + "🖤".repeat(Math.max(0, 3 - lives));
    $("#cm-score").textContent = score;
    $("#cm-streak").textContent = streak;
    $("#cm-time").textContent = timeLeft;
    if (timeLeft <= 3) $("#cm-timer").classList.add("urgent");
    else $("#cm-timer").classList.remove("urgent");
  }

  function spawnExtra(area) {
    spawnExtraCount++;
    // spawn an extra popup
    const pop = document.createElement("div");
    pop.style.cssText = "position:absolute;top:" + (Math.random()*60+20) + "px;left:" + (Math.random()*60+20) + "px;background:#fff;border:2px solid var(--line);border-radius:8px;padding:8px;width:160px;z-index:10";
    pop.innerHTML = '<button style="position:absolute;top:2px;right:4px;background:#eef2fb;border:none;border-radius:4px;padding:1px 4px;cursor:pointer;font-weight:700;font-size:.7rem" data-fake="1">✕</button><p style="margin:0;font-size:.8rem">Extra pop-up!</p>';
    pop.querySelector("[data-fake]").addEventListener("click", () => { trapsHit(); pop.remove(); });
    area.appendChild(pop);
  }

  function trapsHit() {
    traps++;
    fail();
  }

  let traps = 0;

  function pass() {
    if (!running) return;
    score++;
    streak++;
    if (streak > bestStreak) bestStreak = streak;
    if (typeof Sound !== "undefined") Sound.success();
    BB.toast("✓ Nice!", "good", 800);
    nextTask();
  }

  function fail() {
    if (!running) return;
    lives--;
    streak = 0;
    if (typeof Sound !== "undefined") Sound.error();
    BB.toast("✗ Wrong! Lost a life.", "warn", 1200);
    if (lives <= 0) { endGame(); return; }
    updateHud();
    nextTask();
  }

  function nextTask() {
    clearInterval(timer);
    const task = TASKS[Math.floor(Math.random() * TASKS.length)];
    $("#cm-instr").textContent = task.text;
    const area = $("#cm-area");
    area.innerHTML = "";
    task.render(area);
    timeLeft = Math.max(3, 10 - Math.floor(score / 5));
    updateHud();
    timer = setInterval(() => {
      timeLeft--;
      updateHud();
      if (timeLeft <= 0) { fail(); }
    }, 1000);
  }

  function startGame() {
    lives = 3; score = 0; streak = 0; bestStreak = 0; traps = 0; running = true;
    $("#cm-over").style.display = "none";
    updateHud();
    nextTask();
  }

  function endGame() {
    running = false;
    clearInterval(timer);
    const over = $("#cm-over");
    over.style.display = "block";
    let msg = "Good effort!";
    if (score >= 20) msg = "Incredible! You're a chaos survivor.";
    else if (score >= 10) msg = "Nice run! Keep practicing.";
    else if (score >= 5) msg = "Good start. Try again!";
    over.innerHTML = '<div class="big">🌀</div><h2>Game Over!</h2><p>You scored <strong>' + score + '</strong> with a best streak of <strong>' + bestStreak + '</strong>.</p><p>' + msg + '</p><div class="game-actions"><button class="btn btn-primary btn-big" id="cm-replay">Play again</button></div>';
    $("#cm-replay").addEventListener("click", startGame);
    if (typeof Sound !== "undefined") { Sound.complete(); Sound.confetti(); }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.createElement("button");
    btn.className = "btn btn-primary btn-big";
    btn.textContent = "Start Chaos Mode";
    btn.addEventListener("click", startGame);
    document.querySelector("main").appendChild(btn);
  });
})();
