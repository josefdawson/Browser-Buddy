/* =========================================================
   Browser Buddy — Notification & Sound Control
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  const TASKS = [
    { text: "Mute the 'Family Group Chat' for 8 hours.", target: "mute-family", check: (ctx) => ctx.mutedFamily },
    { text: "Turn off notifications for the spammy game app.", target: "block-game", check: (ctx) => ctx.blockedGame },
    { text: "Turn off Do Not Disturb so you don't miss an important call.", target: "dnd-off", check: (ctx) => !ctx.dnd },
    { text: "Mute the 'Work Chat' permanently.", target: "mute-work", check: (ctx) => ctx.mutedWork },
    { text: "Turn notifications back on for the Calendar app.", target: "allow-calendar", check: (ctx) => ctx.calendarOn },
  ];

  const ITEMS = [
    { id: "family", name: "Family Group Chat", icon: "👨‍👩‍👧", type: "chat", muted: false },
    { id: "work", name: "Work Chat", icon: "💼", type: "chat", muted: false },
    { id: "game", name: "Puzzle Game", icon: "🎮", type: "app", notif: true },
    { id: "calendar", name: "Calendar", icon: "📅", type: "app", notif: false },
  ];

  let round = 0, score = 0, total = TASKS.length;
  let ctx = { mutedFamily: false, blockedGame: false, dnd: true, mutedWork: false, calendarOn: false };

  function render() {
    const list = $("#nc-list");
    list.innerHTML = "";
    ITEMS.forEach((item) => {
      const el = document.createElement("div");
      el.style.cssText = "display:flex;align-items:center;gap:10px;background:#f6f8fd;border-radius:10px;padding:10px 12px";
      let status = "";
      if (item.type === "chat") status = item.muted ? "🔇 Muted" : "🔊 On";
      else status = item.notif ? "🔔 On" : "🔕 Off";
      el.innerHTML = '<span style="font-size:1.2rem">' + item.icon + '</span><span style="flex:1;font-weight:600">' + item.name + '</span><span style="color:var(--muted);font-size:.85rem">' + status + '</span>';
      const btn = document.createElement("button");
      btn.className = "btn btn-ghost";
      btn.style.padding = "6px 12px";
      btn.style.fontSize = ".8rem";
      if (item.type === "chat") {
        btn.textContent = item.muted ? "Unmute" : "Mute";
        btn.addEventListener("click", () => {
          item.muted = !item.muted;
          if (item.id === "family" && item.muted) ctx.mutedFamily = true;
          if (item.id === "work" && item.muted) ctx.mutedWork = true;
          render();
          check();
        });
      } else {
        btn.textContent = item.notif ? "Turn off" : "Turn on";
        btn.addEventListener("click", () => {
          item.notif = !item.notif;
          if (item.id === "game" && !item.notif) ctx.blockedGame = true;
          if (item.id === "calendar" && item.notif) ctx.calendarOn = true;
          render();
          check();
        });
      }
      el.appendChild(btn);
      list.appendChild(el);
    });
    // DND toggle
    const dnd = document.createElement("div");
    dnd.style.cssText = "display:flex;align-items:center;gap:10px;background:#f6f8fd;border-radius:10px;padding:10px 12px";
    dnd.innerHTML = '<span style="font-size:1.2rem">🌙</span><span style="flex:1;font-weight:600">Do Not Disturb</span><span style="color:var(--muted);font-size:.85rem">' + (ctx.dnd ? "On" : "Off") + '</span>';
    const dndBtn = document.createElement("button");
    dndBtn.className = "btn btn-ghost";
    dndBtn.style.padding = "6px 12px";
    dndBtn.style.fontSize = ".8rem";
    dndBtn.textContent = ctx.dnd ? "Turn off" : "Turn on";
    dndBtn.addEventListener("click", () => {
      ctx.dnd = !ctx.dnd;
      render();
      check();
    });
    dnd.appendChild(dndBtn);
    list.appendChild(dnd);
  }

  function check() {
    const t = TASKS[round];
    if (t.check(ctx)) {
      score++;
      BB.toast("✓ Done!", "good", 1500);
      round++;
      if (round >= total) { endGame(); return; }
      $("#nc-round").textContent = (round + 1) + " / " + total;
      $("#nc-instr").textContent = TASKS[round].text;
      $("#nc-score").textContent = score;
    }
  }

  function endGame() {
    const over = $("#nc-over");
    over.style.display = "block";
    over.innerHTML = '<div class="big">🎉</div><h2>Done!</h2><p>Completed <strong>' + score + ' of ' + total + '</strong>.</p><div class="game-actions"><button class="btn btn-primary btn-big" id="nc-replay">Play again</button></div>';
    $("#nc-replay").addEventListener("click", () => location.reload());
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("#nc-instr").textContent = TASKS[0].text;
    const btn = document.createElement("button");
    btn.className = "btn btn-primary btn-big";
    btn.textContent = "Start game";
    btn.addEventListener("click", () => { btn.style.display = "none"; render(); });
    document.querySelector("main").appendChild(btn);
  });
})();
