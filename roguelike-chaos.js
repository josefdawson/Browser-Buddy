/* =========================================================
   Browser Buddy — Roguelike Chaos Mode
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  const UPGRADES = [
    { id: "time", name: "+2 seconds on all timers", apply: (g) => { g.timeBonus += 2; } },
    { id: "shake", name: "Fake buttons shake slightly", apply: (g) => { g.shake = true; } },
    { id: "slow", name: "Pop-ups spawn slower", apply: (g) => { g.spawnSlow = true; } },
    { id: "lives", name: "+1 life", apply: (g) => { g.lives = Math.min(5, g.lives + 1); } },
    { id: "score", name: "Double score for next 5 tasks", apply: (g) => { g.doubleScore = 5; } },
  ];

  const CURSES = [
    { id: "flip", name: "Screen is upside down", apply: (g) => { g.flipped = true; } },
    { id: "giant", name: "Mouse cursor is giant", apply: (g) => { g.giantCursor = true; } },
    { id: "fast", name: "Pop-ups spawn twice as fast", apply: (g) => { g.fastSpawn = true; } },
    { id: "short", name: "Timer starts at 5s", apply: (g) => { g.shortTimer = true; } },
    { id: "decoy", name: "Extra decoy buttons", apply: (g) => { g.extraDecoys = true; } },
  ];

  const TASK_POOL = [
    { type: "popup", text: "Close the pop-up (click the real ×).", render: (stage, g) => {
      stage.innerHTML = '<div style="position:relative;min-height:160px;padding:20px"><div style="position:absolute;top:20px;left:30px;background:#fff;border:2px solid var(--line);border-radius:10px;padding:12px;width:200px' + (g.shake ? ';animation:shake .5s infinite' : '') + '"><button style="position:absolute;top:4px;right:4px;background:#eef2fb;border:none;border-radius:6px;padding:2px 6px;cursor:pointer;font-weight:700;font-size:.8rem" data-fake="1">Close ✕</button><button style="position:absolute;top:-8px;right:-8px;background:#c93a3a;color:#fff;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;font-weight:700;font-size:.8rem" data-real="1">×</button><h4 style="margin:0 0 4px;font-size:.9rem">🎉 You won!</h4><p style="color:var(--muted);font-size:.8rem;margin:0">Claim prize.</p></div></div>';
      stage.querySelector("[data-real]").addEventListener("click", () => pass());
      stage.querySelector("[data-fake]").addEventListener("click", () => fail());
    }},
    { type: "cookie", text: "Reject the cookie banner.", render: (stage) => {
      stage.innerHTML = '<div style="background:#fff;border:2px solid var(--line);border-radius:10px;padding:14px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap"><div style="flex:1;font-size:.9rem">This site uses cookies.</div><div style="display:flex;gap:8px"><button class="btn btn-primary" data-act="accept" style="padding:6px 12px;font-size:.85rem">Accept all</button><button class="btn btn-ghost" data-act="reject" style="padding:6px 12px;font-size:.85rem">Reject all</button></div></div>';
      stage.querySelector('[data-act="accept"]').addEventListener("click", () => fail());
      stage.querySelector('[data-act="reject"]').addEventListener("click", () => pass());
    }},
    { type: "download", text: "Find the real download link.", render: (stage) => {
      stage.innerHTML = '<div style="background:#f7f9fd;border:2px solid var(--line);border-radius:12px;padding:16px"><div style="background:#fff;border:2px solid #ffb020;border-radius:10px;padding:12px;margin:8px 0;cursor:pointer" data-fake="1"><div style="font-size:1.1rem;font-weight:700;color:#c93a3a">⬇ DOWNLOAD NOW!</div></div><div style="background:#f0f4fc;border:1px dashed #9bb0d0;border-radius:10px;padding:10px 14px;display:inline-block;cursor:pointer;font-size:.9rem" data-real="1">📄 Download file.pdf</div></div>';
      stage.querySelectorAll("[data-fake]").forEach((el) => el.addEventListener("click", () => fail()));
      stage.querySelector("[data-real]").addEventListener("click", () => pass());
    }},
  ];

  // shake animation CSS
  const style = document.createElement("style");
  style.textContent = "@keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }";
  document.head.appendChild(style);

  let g = null; // game state
  let timer = null;

  function freshGame() {
    return { wave: 1, score: 0, lives: 3, streak: 0, bestStreak: 0, timeBonus: 0, shake: false, spawnSlow: false, fastSpawn: false, shortTimer: false, extraDecoys: false, flipped: false, giantCursor: false, doubleScore: 0, tasksInWave: 0, tasksPerWave: 5, upgrades: [], curses: [] };
  }

  function updateHud() {
    $("#rl-wave").textContent = g.wave;
    $("#rl-score").textContent = g.score;
    $("#rl-lives").textContent = "❤️".repeat(g.lives) + "🖤".repeat(Math.max(0, 3 - g.lives));
    $("#rl-time").textContent = g.timeLeft;
    $("#rl-timer").classList.toggle("urgent", g.timeLeft <= 3);
    // mods
    const mods = $("#rl-mods");
    mods.innerHTML = g.upgrades.map((u) => '<span class="rl-mod rl-upgrade">⬆ ' + u + '</span>').join("") +
      g.curses.map((c) => '<span class="rl-mod rl-curse">⬇ ' + c + '</span>').join("");
    // stage classes
    const stage = $("#rl-stage");
    stage.classList.toggle("flipped", g.flipped);
    stage.classList.toggle("giant-cursor", g.giantCursor);
  }

  function nextTask() {
    clearInterval(timer);
    const task = TASK_POOL[Math.floor(Math.random() * TASK_POOL.length)];
    $("#rl-instr").textContent = task.text;
    const stage = $("#rl-stage");
    stage.innerHTML = "";
    task.render(stage, g);
    // timer
    let base = g.shortTimer ? 5 : 8;
    g.timeLeft = base + g.timeBonus;
    updateHud();
    timer = setInterval(() => {
      g.timeLeft--;
      updateHud();
      if (g.timeLeft <= 0) { fail(); }
    }, 1000);
  }

  function pass() {
    g.score += g.doubleScore > 0 ? 2 : 1;
    if (g.doubleScore > 0) g.doubleScore--;
    g.streak++;
    if (g.streak > g.bestStreak) g.bestStreak = g.streak;
    g.tasksInWave++;
    if (typeof Sound !== "undefined") Sound.success();
    BB.toast("✓ Nice!", "good", 800);
    if (g.tasksInWave >= g.tasksPerWave) {
      // pick upgrade
      showPick();
    } else {
      nextTask();
    }
  }

  function fail() {
    g.lives--;
    g.streak = 0;
    if (typeof Sound !== "undefined") Sound.error();
    BB.toast("✗ Wrong! Lost a life.", "warn", 1200);
    if (g.lives <= 0) { endGame(); return; }
    updateHud();
    nextTask();
  }

  function showPick() {
    clearInterval(timer);
    const pick = $("#rl-pick");
    pick.style.display = "block";
    const up = UPGRADES[Math.floor(Math.random() * UPGRADES.length)];
    const curse = CURSES[Math.floor(Math.random() * CURSES.length)];
    pick.innerHTML = '<h3 style="margin:0 0 8px">Wave ' + g.wave + ' complete! Pick an upgrade:</h3>' +
      '<div class="rl-pick"><button data-pick="upgrade">⬆ ' + up.name + '</button><button data-pick="skip">Skip (no upgrade, no curse)</button></div>' +
      '<p style="color:var(--muted);font-size:.85rem">Choosing an upgrade adds a curse: <strong>' + curse.name + '</strong></p>';
    pick.querySelector('[data-pick="upgrade"]').addEventListener("click", () => {
      up.apply(g);
      g.upgrades.push(up.name);
      curse.apply(g);
      g.curses.push(curse.name);
      g.wave++;
      g.tasksInWave = 0;
      pick.style.display = "none";
      updateHud();
      nextTask();
    });
    pick.querySelector('[data-pick="skip"]').addEventListener("click", () => {
      g.wave++;
      g.tasksInWave = 0;
      pick.style.display = "none";
      updateHud();
      nextTask();
    });
  }

  function endGame() {
    clearInterval(timer);
    const over = $("#rl-over");
    over.style.display = "block";
    let msg = "Good run!";
    if (g.wave >= 25) msg = "Incredible! You're a roguelike master.";
    else if (g.wave >= 10) msg = "Great run! Keep going.";
    else if (g.wave >= 5) msg = "Nice! You're learning.";
    over.innerHTML = '<div class="big">🌀</div><h2>Game Over!</h2><p>You reached <strong>Wave ' + g.wave + '</strong> with a score of <strong>' + g.score + '</strong>.</p><p>Best streak: ' + g.bestStreak + '</p><p>' + msg + '</p><div class="game-actions"><button class="btn btn-primary btn-big" id="rl-replay">Play again</button></div>';
    $("#rl-replay").addEventListener("click", startGame);
    if (typeof Sound !== "undefined") { Sound.complete(); Sound.confetti(); }
  }

  function startGame() {
    g = freshGame();
    $("#rl-over").style.display = "none";
    $("#rl-pick").style.display = "none";
    updateHud();
    nextTask();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.createElement("button");
    btn.className = "btn btn-primary btn-big";
    btn.textContent = "Start Roguelike";
    btn.addEventListener("click", startGame);
    document.querySelector("main").appendChild(btn);
  });
})();
