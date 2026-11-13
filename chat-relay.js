/* =========================================================
   Browser Buddy — Chat App Relay
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  const MISSIONS = [
    { text: "Reply directly to Mom's message.", target: "reply-mom" },
    { text: "Forward the photo to Uncle Bob.", target: "forward-photo" },
    { text: "Delete the message you sent by mistake.", target: "delete-mine" },
    { text: "React with a heart to Sarah's message.", target: "react-sarah" },
    { text: "Delete a message for everyone.", target: "delete-everyone" },
  ];

  let round = 0, score = 0, total = MISSIONS.length;

  const messages = [
    { id: "mom", from: "Mom", text: "Don't forget dinner at 6!", mine: false },
    { id: "me1", from: "Me", text: "Oops wrong chat", mine: true },
    { id: "sarah", from: "Sarah", text: "Happy birthday! 🎂", mine: false },
    { id: "photo", from: "Mom", text: "Look at this photo!", mine: false, hasPhoto: true },
    { id: "bob", from: "Uncle Bob", text: "Thanks!", mine: false },
  ];

  function renderChat() {
    const chat = $("#cr-chat");
    chat.innerHTML = messages.map((m) => {
      let actions = "";
      if (m.id === "mom") actions = '<button data-act="reply-mom">↩ Reply</button>';
      if (m.id === "photo") actions = '<button data-act="forward-photo">➡️ Forward</button>';
      if (m.id === "me1") actions = '<button data-act="delete-mine">🗑 Delete for me</button> <button data-act="delete-everyone">🗑 Delete for everyone</button>';
      if (m.id === "sarah") actions = '<button data-act="react-sarah">❤️ React</button>';
      return '<div style="margin:8px 0;padding:8px 10px;border-radius:8px;background:' + (m.mine ? '#e8edff' : '#fff') + ';border:1px solid var(--line)">' +
        '<strong>' + m.from + ':</strong> ' + m.text + (m.hasPhoto ? ' 📷' : '') +
        (actions ? '<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">' + actions + '</div>' : '') +
        '</div>';
    }).join("");
    chat.querySelectorAll("[data-act]").forEach((b) => {
      b.addEventListener("click", () => {
        const target = MISSIONS[round].target;
        if (b.dataset.act === target) {
          score++;
          $("#cr-score").textContent = score;
          BB.toast("✓ Done!", "good", 1500);
          round++;
          if (round >= total) { endGame(); return; }
          $("#cr-round").textContent = (round + 1) + " / " + total;
          $("#cr-instr").textContent = MISSIONS[round].text;
        } else {
          BB.toast("Not that action. Try again.", "warn");
        }
      });
    });
  }

  function endGame() {
    const over = $("#cr-over");
    over.style.display = "block";
    over.innerHTML = '<div class="big">🎉</div><h2>Done!</h2><p>Completed <strong>' + score + ' of ' + total + '</strong>.</p><div class="game-actions"><button class="btn btn-primary btn-big" id="cr-replay">Play again</button></div>';
    $("#cr-replay").addEventListener("click", () => { over.style.display = "none"; score = 0; round = 0; $("#cr-score").textContent = "0"; $("#cr-round").textContent = "1 / " + total; $("#cr-instr").textContent = MISSIONS[0].text; renderChat(); });
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("#cr-instr").textContent = MISSIONS[0].text;
    const btn = document.createElement("button");
    btn.className = "btn btn-primary btn-big";
    btn.textContent = "Start game";
    btn.addEventListener("click", () => { btn.style.display = "none"; renderChat(); });
    document.querySelector("main").appendChild(btn);
  });
})();
