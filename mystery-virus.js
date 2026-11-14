/* =========================================================
   Browser Buddy — Mystery Virus Clean-Up (Full Computer)
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  let streak = 0, round = 0, running = false, timer = null, timeLeft = 45;
  let problems = [], fixed = new Set();
  let windows = [];
  let draggedWindow = null, dragOffset = { x: 0, y: 0 };

  // Problem pool with scattered positions
  const PROBLEM_POOL = [
    { id: "zoom", desc: "Screen zoomed to 300%", fix: "Reset zoom", app: "browser",
      setup: (desktop) => {
        const w = makeWindow("Browser", 40, 30, 300, 180);
        w.innerHTML += '<div style="padding:10px;font-size:1.6rem">HUGE TEXT</div><div style="padding:0 10px;font-size:.8rem;color:#ff6b6b">⚠️ Browser hijacked — homepage changed</div><button class="mv-fixbtn" data-fix="zoom" style="margin:8px 10px">Reset zoom</button>';
        desktop.appendChild(w);
        makeDraggable(w);
      }},
    { id: "audio", desc: "4 tabs playing audio", fix: "Mute all tabs", app: "browser",
      setup: (desktop) => {
        const w = makeWindow("Browser", 360, 50, 280, 170);
        w.innerHTML += '<div style="padding:10px"><div style="color:#ff6b6b;font-size:.8rem;margin:2px 0">🔊 Tab 1: playing audio</div><div style="color:#ff6b6b;font-size:.8rem;margin:2px 0">🔊 Tab 2: playing audio</div><div style="color:#ff6b6b;font-size:.8rem;margin:2px 0">🔊 Tab 3: playing audio</div><div style="color:#ff6b6b;font-size:.8rem;margin:2px 0">🔊 Tab 4: playing audio</div><button class="mv-fixbtn" data-fix="audio" style="margin-top:8px">Mute all</button></div>';
        desktop.appendChild(w);
        makeDraggable(w);
      }},
    { id: "popup", desc: "Fake 'Update Flash' pop-up", fix: "Close pop-up", app: null,
      setup: (desktop) => {
        const pop = document.createElement("div");
        pop.className = "mv-popup";
        pop.style.left = "200px"; pop.style.top = "120px";
        pop.style.cursor = "move";
        pop.innerHTML = '<h4>⚠️ Update Flash now!</h4><p>Your Flash player is out of date. Click to update.</p><button data-fake="popup" style="background:#ff0;color:#000;border:none;border-radius:4px;padding:4px 10px;cursor:pointer;font-weight:700;font-size:.8rem;margin-right:4px">Update</button> <button data-fix="popup" class="real-close" style="background:#c93a3a;color:#fff;border:none;border-radius:4px;padding:4px 10px;cursor:pointer;font-weight:700;font-size:.8rem">✕ Close</button>';
        desktop.appendChild(pop);
        // Make draggable
        let dragging = false, offsetX = 0, offsetY = 0;
        pop.addEventListener("mousedown", (e) => {
          if (e.target.tagName === "BUTTON") return;
          dragging = true;
          const rect = pop.getBoundingClientRect();
          const deskRect = desktop.getBoundingClientRect();
          offsetX = e.clientX - rect.left;
          offsetY = e.clientY - rect.top;
          pop.style.zIndex = "200";
        });
        document.addEventListener("mousemove", (e) => {
          if (!dragging) return;
          const deskRect = desktop.getBoundingClientRect();
          const x = e.clientX - deskRect.left - offsetX;
          const y = e.clientY - deskRect.top - offsetY;
          pop.style.left = Math.max(0, Math.min(deskRect.width - 260, x)) + "px";
          pop.style.top = Math.max(0, Math.min(deskRect.height - 120, y)) + "px";
        });
        document.addEventListener("mouseup", () => {
          if (dragging) { dragging = false; pop.style.zIndex = "100"; }
        });
        pop.querySelector("[data-fake]").addEventListener("click", () => {
          BB.toast("That's a trap! Use the red Close button.", "warn");
          if (typeof Sound !== "undefined") Sound.error();
          // Spawn extra popup
          const extra = document.createElement("div");
          extra.className = "mv-popup";
          extra.style.left = (Math.random() * 200 + 50) + "px";
          extra.style.top = (Math.random() * 100 + 50) + "px";
          extra.innerHTML = '<h4>⚠️ Extra virus!</h4><p>Another pop-up appeared!</p><button class="real-close" data-fix="popup-extra" style="background:#c93a3a;color:#fff;border:none;border-radius:4px;padding:4px 10px;cursor:pointer;font-weight:700;font-size:.8rem">✕ Close</button>';
          desktop.appendChild(extra);
          makeDraggablePopup(extra);
          extra.querySelector("[data-fix]").addEventListener("click", () => fixProblem("popup", extra.querySelector("button")));
        });
        pop.querySelector("[data-fix]").addEventListener("click", () => fixProblem("popup", pop.querySelector("[data-fix]")));
      }},
    { id: "storage", desc: "Hard drive 99% full", fix: "Clear cache", app: "files",
      setup: (desktop) => {
        const w = makeWindow("Files", 280, 80, 300, 180);
        w.innerHTML += '<div style="padding:10px"><div style="font-size:.85rem">💾 Storage: 99% full</div><div class="mv-progress"><div class="mv-progress-fill" style="width:99%"></div></div><div style="font-size:.8rem;color:#ff6b6b;margin:4px 0">⚠️ 50 duplicate files found</div><div style="display:flex;gap:6px;margin-top:8px"><button class="mv-fixbtn" data-fix="storage">Clear cache</button><button style="background:#eef2fb;border:1px solid var(--line);border-radius:6px;padding:6px 10px;cursor:pointer;font-size:.8rem" data-safe="1">View safe files</button></div></div>';
        setTimeout(() => { const b = w.querySelector('[data-safe]'); if (b) b.addEventListener('click', () => { BB.toast("Those files are fine. Clear the cache instead.", "info", 1500); }); }, 0);
        desktop.appendChild(w);
        makeDraggable(w);
      }},
    { id: "wifi", desc: "Wi-Fi turned off", fix: "Turn on Wi-Fi", app: "settings",
      setup: (desktop) => {
        const w = makeWindow("Settings", 50, 150, 280, 160);
        w.innerHTML += '<div style="padding:10px"><div style="font-size:.85rem">📶 Wi-Fi: OFF</div><div style="font-size:.8rem;color:#ff6b6b;margin:4px 0">⚠️ No internet connection</div><button class="mv-fixbtn" data-fix="wifi" style="margin-top:8px">Turn on Wi-Fi</button></div>';
        desktop.appendChild(w);
        makeDraggable(w);
      }},
    { id: "scam", desc: "Scam email asking for password", fix: "Delete email", app: "email",
      setup: (desktop) => {
        const w = makeWindow("Email", 420, 30, 300, 190);
        w.innerHTML += '<div style="padding:10px"><div style="background:#fff3e0;border:1px solid #ffcf8a;border-radius:6px;padding:8px;font-size:.8rem;color:#7a4a00">⚠️ "Verify your account" — suspicious sender: security@amaz0n-verify.com</div><div style="font-size:.8rem;color:#ff6b6b;margin:4px 0">⚠️ Do not click links in this email</div><button class="mv-fixbtn" data-fix="scam" style="margin-top:8px">Delete email</button></div>';
        desktop.appendChild(w);
        makeDraggable(w);
      }},
    { id: "tabs", desc: "12 tabs open — slowing down", fix: "Close extra tabs", app: "browser",
      setup: (desktop) => {
        const w = makeWindow("Browser", 120, 100, 320, 170);
        w.innerHTML += '<div style="padding:10px"><div style="font-size:.85rem">🗂️ 12 tabs open</div><div style="font-size:.8rem;color:#ff6b6b;margin:4px 0">⚠️ Browser using 90% CPU</div><button class="mv-fixbtn" data-fix="tabs" style="margin-top:8px">Close extras</button></div>';
        desktop.appendChild(w);
        makeDraggable(w);
      }},
    { id: "fullscreen", desc: "Stuck in full-screen mode", fix: "Press Esc", app: null,
      setup: (desktop) => {
        const w = makeWindow("System", 300, 140, 260, 150);
        w.innerHTML += '<div style="padding:10px"><div style="font-size:.85rem">⛶ Full-screen mode active</div><div style="font-size:.8rem;color:#ff6b6b;margin:4px 0">⚠️ Can\'t see taskbar</div><button class="mv-fixbtn" data-fix="fullscreen" style="margin-top:8px">Press Esc</button></div>';
        desktop.appendChild(w);
        makeDraggable(w);
      }},
    { id: "virus", desc: "Fake virus warning", fix: "Close scam", app: null,
      setup: (desktop) => {
        const pop = document.createElement("div");
        pop.className = "mv-popup";
        pop.style.left = "350px"; pop.style.top = "90px";
        pop.innerHTML = '<h4>⚠️ VIRUS DETECTED!</h4><p>Your computer is infected with 5 viruses. Call 1-800-555-0199.</p><button data-fix="virus" class="real-close" style="background:#c93a3a;color:#fff;border:none;border-radius:4px;padding:4px 10px;cursor:pointer;font-weight:700;font-size:.8rem">✕ Close</button>';
        desktop.appendChild(pop);
        makeDraggablePopup(pop);
        pop.querySelector("[data-fix]").addEventListener("click", () => fixProblem("virus", pop.querySelector("button")));
      }},
    { id: "browser-slow", desc: "Browser is very slow", fix: "Clear browser data", app: "browser",
      setup: (desktop) => {
        const w = makeWindow("Browser", 180, 20, 300, 170);
        w.innerHTML += '<div style="padding:10px"><div style="font-size:.85rem">🐌 Browser responding slowly</div><div style="font-size:.8rem;color:#ff6b6b;margin:4px 0">⚠️ Too many cached files</div><div style="display:flex;gap:6px;margin-top:8px"><button class="mv-fixbtn" data-fix="browser-slow">Clear browser data</button><button style="background:#eef2fb;border:1px solid var(--line);border-radius:6px;padding:6px 10px;cursor:pointer;font-size:.8rem" data-safe="1">View bookmarks</button></div></div>';
        setTimeout(() => { const b = w.querySelector('[data-safe]'); if (b) b.addEventListener('click', () => { BB.toast("Bookmarks are fine. Clear the cache instead.", "info", 1500); }); }, 0);
        desktop.appendChild(w);
        makeDraggable(w);
      }},
    { id: "email-spam", desc: "Inbox flooded with spam", fix: "Delete spam emails", app: "email",
      setup: (desktop) => {
        const w = makeWindow("Email", 440, 120, 280, 180);
        w.innerHTML += '<div style="padding:10px"><div style="font-size:.85rem">📧 Inbox: 47 unread (38 spam)</div><div style="font-size:.8rem;color:#ff6b6b;margin:4px 0">⚠️ Suspicious senders detected</div><div style="display:flex;gap:6px;margin-top:8px"><button class="mv-fixbtn" data-fix="email-spam">Delete spam emails</button><button style="background:#eef2fb;border:1px solid var(--line);border-radius:6px;padding:6px 10px;cursor:pointer;font-size:.8rem" data-safe="1">Open safe email</button></div></div>';
        setTimeout(() => { const b = w.querySelector('[data-safe]'); if (b) b.addEventListener('click', () => { BB.toast("That email is safe. Focus on the spam.", "info", 1500); }); }, 0);
        desktop.appendChild(w);
        makeDraggable(w);
      }},
  ];

  function makeWindow(title, x, y, w, h) {
    const win = document.createElement("div");
    win.className = "mv-window";
    win.style.left = x + "px";
    win.style.top = y + "px";
    win.style.width = w + "px";
    win.style.zIndex = "5";
    const colors = { Browser: "#3b5bfd", Email: "#178a4c", Files: "#ffb020", Settings: "#9b59b6", System: "#c93a3a" };
    const color = colors[title] || "#56617a";
    win.innerHTML = '<div class="titlebar" style="background:' + color + '"><div class="dots"><span style="background:#ff5f57"></span><span style="background:#ffbd2e"></span><span style="background:#28c840"></span></div><span>' + title + '</span><button class="close" data-close="1">✕</button></div><div class="content"></div>';
    win.querySelector(".close").addEventListener("click", () => { win.remove(); });
    // Make draggable via titlebar
    const titlebar = win.querySelector(".titlebar");
    titlebar.style.cursor = "move";
    titlebar.addEventListener("mousedown", (e) => {
      if (e.target.classList.contains("close")) return;
      draggedWindow = win;
      const rect = win.getBoundingClientRect();
      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;
      win.style.zIndex = "50";
    });
    return win;
  }

  function makeDraggablePopup(pop) {
    pop.style.cursor = "move";
    let dragging = false, offsetX = 0, offsetY = 0;
    pop.addEventListener("mousedown", (e) => {
      if (e.target.tagName === "BUTTON") return;
      dragging = true;
      const rect = pop.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      pop.style.zIndex = "200";
    });
    const moveHandler = (e) => {
      if (!dragging) return;
      const desk = document.querySelector("#mv-desktop");
      const rect = desk.getBoundingClientRect();
      const x = e.clientX - rect.left - offsetX;
      const y = e.clientY - rect.top - offsetY;
      pop.style.left = Math.max(0, Math.min(rect.width - 260, x)) + "px";
      pop.style.top = Math.max(0, Math.min(rect.height - 120, y)) + "px";
    };
    const upHandler = () => {
      if (dragging) { dragging = false; pop.style.zIndex = "100"; }
    };
    document.addEventListener("mousemove", moveHandler);
    document.addEventListener("mouseup", upHandler);
  }

  function makeDraggable(win) {
    // Already handled in makeWindow
  }

  document.addEventListener("mousemove", (e) => {
    if (!draggedWindow) return;
    const desk = document.querySelector("#mv-desktop");
    const rect = desk.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    draggedWindow.style.left = Math.max(0, Math.min(rect.width - 100, x)) + "px";
    draggedWindow.style.top = Math.max(0, Math.min(rect.height - 40, y)) + "px";
  });

  document.addEventListener("mouseup", () => {
    if (draggedWindow) {
      draggedWindow.style.zIndex = "5";
      draggedWindow = null;
    }
  });

  // Taskbar opens apps
  document.querySelectorAll(".mv-taskbar button[data-app]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const app = btn.dataset.app;
      openApp(app);
    });
  });

  function openApp(app) {
    const desktop = $("#mv-desktop");
    const titles = { browser: "Browser", email: "Email", files: "Files", settings: "Settings" };
    const colors = { browser: "#3b5bfd", email: "#178a4c", files: "#ffb020", settings: "#9b59b6" };
    // Check if window already exists
    const existing = Array.from(desktop.querySelectorAll(".mv-window")).find((w) => w.querySelector(".titlebar span")?.textContent === titles[app]);
    if (existing) {
      existing.style.zIndex = "50";
      setTimeout(() => { existing.style.zIndex = "5"; }, 200);
      return;
    }
    const w = makeWindow(titles[app], 60 + Math.random() * 100, 40 + Math.random() * 80, 300, 200);
    const content = w.querySelector(".content");
    if (app === "browser") {
      content.innerHTML = '<div style="padding:10px"><div style="font-size:.85rem">🌐 Browser</div><div style="color:#ff6b6b;font-size:.8rem;margin:4px 0">⚠️ Homepage changed to suspicious site</div><div style="color:#ff6b6b;font-size:.8rem;margin:4px 0">⚠️ 12 tabs open</div><div style="color:#ff6b6b;font-size:.8rem;margin:4px 0">⚠️ Pop-ups enabled</div></div>';
    } else if (app === "email") {
      content.innerHTML = '<div style="padding:10px"><div style="font-size:.85rem">📧 Email</div><div style="color:#ff6b6b;font-size:.8rem;margin:4px 0">⚠️ 47 unread (38 spam)</div><div style="color:#ff6b6b;font-size:.8rem;margin:4px 0">⚠️ Suspicious sender detected</div></div>';
    } else if (app === "files") {
      content.innerHTML = '<div style="padding:10px"><div style="font-size:.85rem">📁 Files</div><div style="color:#ff6b6b;font-size:.8rem;margin:4px 0">⚠️ Storage 99% full</div><div style="color:#ff6b6b;font-size:.8rem;margin:4px 0">⚠️ 50 duplicate files</div></div>';
    } else if (app === "settings") {
      content.innerHTML = '<div style="padding:10px"><div style="font-size:.85rem">⚙️ Settings</div><div style="color:#ff6b6b;font-size:.8rem;margin:4px 0">⚠️ Wi-Fi OFF</div><div style="color:#ff6b6b;font-size:.8rem;margin:4px 0">⚠️ Notifications spamming</div></div>';
    }
    desktop.appendChild(w);
  }

  function generateRound() {
    const count = 3 + Math.floor(Math.random() * 3);
    const shuffled = PROBLEM_POOL.slice().sort(() => Math.random() - 0.5);
    problems = shuffled.slice(0, count);
    fixed = new Set();
    const desktop = $("#mv-desktop");
    desktop.innerHTML = "";
    problems.forEach((p) => {
      if (p.setup) p.setup(desktop);
    });
    // Bind fix buttons
    desktop.querySelectorAll("button[data-fix]").forEach((btn) => {
      btn.addEventListener("click", () => fixProblem(btn.dataset.fix, btn));
    });
    // Update problem list
    const probList = $("#mv-problems");
    probList.innerHTML = problems.map((p) => '<div class="mv-problem" data-prob="' + p.id + '"><span class="desc">' + p.desc + '</span><span style="color:var(--muted);font-size:.8rem">Fix: ' + p.fix + '</span></div>').join("");
    // Update instruction
    $("#mv-instr").textContent = "Fix all " + problems.length + " problems. Open apps from the taskbar. Drag windows to move them.";
  }

  function fixProblem(id, btn) {
    if (fixed.has(id)) return;
    fixed.add(id);
    if (btn) { btn.disabled = true; btn.textContent = "✓ Fixed"; }
    const probEl = document.querySelector('[data-prob="' + id + '"]');
    if (probEl) probEl.classList.add("fixed");
    if (typeof Sound !== "undefined") Sound.success();
    // Remove the associated window/popup after a short delay
    setTimeout(() => {
      // Find and remove the window containing the fix button
      const win = btn ? btn.closest(".mv-window, .mv-popup") : null;
      if (win) win.remove();
    }, 600);
    if (fixed.size >= problems.length) {
      streak++;
      round++;
      $("#mv-streak").textContent = streak;
      $("#mv-round").textContent = round + 1;
      BB.toast("✓ Computer fixed! Streak: " + streak, "good", 1500);
      clearInterval(timer);
      setTimeout(() => {
        if (running) { generateRound(); startTimer(); }
      }, 1200);
    }
  }

  function startTimer() {
    timeLeft = Math.max(20, 45 - Math.floor(streak / 3) * 5);
    $("#mv-time").textContent = timeLeft;
    $("#mv-timer").classList.remove("urgent");
    clearInterval(timer);
    timer = setInterval(() => {
      timeLeft--;
      $("#mv-time").textContent = timeLeft;
      if (timeLeft <= 10) $("#mv-timer").classList.add("urgent");
      if (timeLeft <= 0) {
        clearInterval(timer);
        endGame();
      }
    }, 1000);
    // Update clock
    const now = new Date();
    $("#mv-clock").textContent = now.getHours() + ":" + String(now.getMinutes()).padStart(2, "0");
  }

  function endGame() {
    running = false;
    clearInterval(timer);
    const over = $("#mv-over");
    over.style.display = "block";
    let msg = "Good effort!";
    if (streak >= 10) msg = "Incredible! You're a repair master.";
    else if (streak >= 5) msg = "Nice run! Keep practicing.";
    else if (streak >= 2) msg = "Good start. Try again!";
    over.innerHTML = '<div class="big">🦠</div><h2>Game Over!</h2><p>You fixed <strong>' + streak + '</strong> computers in a row.</p><p>' + msg + '</p><div class="game-actions"><button class="btn btn-primary btn-big" id="mv-replay">Play again</button></div>';
    $("#mv-replay").addEventListener("click", startGame);
    if (typeof Sound !== "undefined") { Sound.complete(); Sound.confetti(); }
  }

  function startGame() {
    streak = 0; round = 0; running = true;
    $("#mv-streak").textContent = "0";
    $("#mv-round").textContent = "1";
    $("#mv-over").style.display = "none";
    generateRound();
    startTimer();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.createElement("button");
    btn.className = "btn btn-primary btn-big";
    btn.textContent = "Start shift";
    btn.addEventListener("click", startGame);
    document.querySelector("main").appendChild(btn);
  });
})();
