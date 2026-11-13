/* =========================================================
   Browser Buddy — Tab Chaos Organizer
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const TABS = [
    { id: 1, title: "Grandma's Recipes", icon: "🥧", noisy: false, pinned: false },
    { id: 2, title: "Inbox (3 new)", icon: "📧", noisy: false, pinned: false },
    { id: 3, title: "Video playing", icon: "🎬", noisy: true, pinned: false },
    { id: 4, title: "News Today", icon: "📰", noisy: false, pinned: false },
    { id: 5, title: "Weather", icon: "🌤️", noisy: false, pinned: false },
    { id: 6, title: "Shopping", icon: "🛒", noisy: false, pinned: false },
    { id: 7, title: "Bank login", icon: "🏦", noisy: false, pinned: false },
    { id: 8, title: "Photo album", icon: "📸", noisy: false, pinned: false },
    { id: 9, title: "Recipe 2", icon: "🥧", noisy: false, pinned: false },
    { id: 10, title: "Email draft", icon: "📧", noisy: false, pinned: false },
    { id: 11, title: "Social feed", icon: "💬", noisy: false, pinned: false },
    { id: 12, title: "Calendar", icon: "📅", noisy: false, pinned: false },
  ];

  const MISSIONS = [
    { text: "Mute the noisy tab (the one playing video).", check: (tabs) => tabs.find(t => t.noisy)?.muted },
    { text: "Pin the email tab (Inbox).", check: (tabs) => tabs.find(t => t.id === 2)?.pinned },
    { text: "Close the duplicate recipe tab (Recipe 2).", check: (tabs) => !tabs.find(t => t.id === 9) },
    { text: "Reopen the tab you just closed by mistake (Recipe 2).", check: (tabs, ctx) => ctx.reopened },
    { text: "Close all tabs except the pinned one and Inbox.", check: (tabs) => tabs.length === 2 && tabs.every(t => t.id === 2 || t.pinned) },
    { text: "Mute is done. Final: pin the Inbox tab too.", check: (tabs) => tabs.find(t => t.id === 2)?.pinned },
  ];

  let mode = "practice", score = 0, idx = 0, running = false;
  let tabs = [], closedHistory = [], reopened = false;
  let timer = null, timeLeft = 45;

  function resetTabs() {
    tabs = TABS.map(t => ({ ...t, muted: false, pinned: false }));
    closedHistory = [];
    reopened = false;
  }

  function renderTabs() {
    const wrap = $("#tc-tabs");
    wrap.innerHTML = "";
    tabs.forEach((t) => {
      const el = document.createElement("div");
      el.className = "tc-tab" + (t.pinned ? " pinned" : "") + (t.muted ? " muted" : "");
      el.innerHTML =
        '<span class="ico">' + t.icon + "</span>" +
        '<span class="title">' + t.title + "</span>" +
        (t.noisy && !t.muted ? '<span class="badge">🔊</span>' : "") +
        '<span style="display:flex;gap:6px">' +
        '<button data-act="mute" data-id="' + t.id + '" title="Mute/unmute">🔇</button>' +
        '<button data-act="pin" data-id="' + t.id + '" title="Pin/unpin">📌</button>' +
        '<button data-act="close" data-id="' + t.id + '" title="Close">✕</button>' +
        "</span>";
      wrap.appendChild(el);
    });
    // reopen button
    if (closedHistory.length > 0) {
      const rb = document.createElement("button");
      rb.className = "btn btn-ghost";
      rb.style.marginTop = "8px";
      rb.textContent = "↩ Reopen closed tab";
      rb.addEventListener("click", () => {
        const last = closedHistory.pop();
        tabs.push(last);
        reopened = true;
        renderTabs();
        checkMission();
      });
      wrap.appendChild(rb);
    }
  }

  function checkMission() {
    const m = MISSIONS[idx];
    if (!m) return;
    const ctx = { reopened };
    if (m.check(tabs, ctx)) {
      score++;
      $("#tc-score").textContent = score;
      BB.toast("✓ Mission complete!", "good", 1500);
      idx++;
      if (idx >= MISSIONS.length) { endGame(); return; }
      $("#tc-round").textContent = (idx + 1) + " / " + MISSIONS.length;
      $("#tc-instr").textContent = MISSIONS[idx].text;
    }
  }

  function startGame() {
    mode = document.querySelector(".mode-btn.active").dataset.mode;
    resetTabs();
    score = 0; idx = 0; running = true; timeLeft = 45;
    $("#tc-score").textContent = "0";
    $("#tc-round").textContent = "1 / " + MISSIONS.length;
    $("#tc-instr").textContent = MISSIONS[0].text;
    $("#tc-timer").style.display = mode === "challenge" ? "flex" : "none";
    $("#tc-over").style.display = "none";
    renderTabs();
    if (mode === "challenge") {
      timer = setInterval(() => {
        timeLeft--;
        $("#tc-time").textContent = timeLeft;
        if (timeLeft <= 10) $("#tc-timer").classList.add("urgent");
        if (timeLeft <= 0) endGame();
      }, 1000);
    }
  }

  function endGame() {
    if (typeof Sound !== "undefined") { Sound.complete(); Sound.confetti(); }
    running = false;
    clearInterval(timer);
    const over = $("#tc-over");
    over.style.display = "block";
    const pct = Math.round((score / MISSIONS.length) * 100);
    over.innerHTML = '<div class="big">🎉</div><h2>Done!</h2><p>Completed <strong>' + score + ' of ' + MISSIONS.length + '</strong> missions (' + pct + '%).</p><div class="game-actions"><button class="btn btn-primary btn-big" id="tc-replay">Play again</button></div>';
    $("#tc-replay").addEventListener("click", startGame);
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const id = parseInt(btn.dataset.id, 10);
    const act = btn.dataset.act;
    const t = tabs.find((x) => x.id === id);
    if (!t) return;
    if (act === "mute") { t.muted = !t.muted; }
    else if (act === "pin") { t.pinned = !t.pinned; }
    else if (act === "close") {
      tabs = tabs.filter((x) => x.id !== id);
      closedHistory.push(t);
    }
    renderTabs();
    checkMission();
  });

  document.addEventListener("DOMContentLoaded", () => {
    $$(".mode-btn").forEach((b) => {
      b.addEventListener("click", () => {
        $$(".mode-btn").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
      });
    });
    $("#tc-start").addEventListener("click", startGame);
  });
})();
