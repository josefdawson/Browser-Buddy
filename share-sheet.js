/* =========================================================
   Browser Buddy — Share Sheet Master
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  const ROUNDS = [
    { content: "📷 A photo of your dog", task: "Send this photo to Mom via chat.", answer: "chat" },
    { content: "📰 A news article", task: "Copy the link to share later.", answer: "copy" },
    { content: "🎵 A song you like", task: "Save this to your device.", answer: "save" },
    { content: "📄 A document", task: "Send via email.", answer: "email" },
    { content: "🎬 A funny video", task: "Share to social media.", answer: "social" },
    { content: "📍 A location", task: "Copy the link.", answer: "copy" },
  ];

  const OPTIONS = [
    { id: "copy", label: "Copy Link", icon: "📋" },
    { id: "chat", label: "Send via Chat", icon: "💬" },
    { id: "email", label: "Send via Email", icon: "📧" },
    { id: "save", label: "Save to Device", icon: "⬇️" },
    { id: "social", label: "Share to Social", icon: "📣" },
  ];

  let round = 0, score = 0, total = ROUNDS.length;

  function loadRound() {
    const r = ROUNDS[round];
    $("#ss-instr").textContent = r.task;
    $("#ss-round").textContent = (round + 1) + " / " + total;
    $("#ss-content").innerHTML = "<div style='font-size:2rem'>" + r.content.split(" ")[0] + "</div><p>" + r.content.slice(2) + "</p>";
    $("#ss-sheet").style.display = "none";
    $("#ss-sheet").innerHTML = "";
    // show share button
    const shareBtn = document.createElement("button");
    shareBtn.className = "btn btn-primary";
    shareBtn.textContent = "📤 Share";
    shareBtn.style.marginTop = "8px";
    shareBtn.addEventListener("click", () => {
      const sheet = $("#ss-sheet");
      sheet.style.display = "block";
      sheet.innerHTML = "<p style='font-weight:600;margin:0 0 8px'>Share via:</p>" +
        OPTIONS.map((o) => '<button class="btn btn-ghost" data-opt="' + o.id + '" style="margin:4px">' + o.icon + " " + o.label + "</button>").join("");
      sheet.querySelectorAll("[data-opt]").forEach((b) => {
        b.addEventListener("click", () => {
          if (b.dataset.opt === r.answer) {
            score++;
            $("#ss-score").textContent = score;
            BB.toast("✓ Correct!", "good", 1500);
            round++;
            if (round >= total) { endGame(); return; }
            $("#ss-round").textContent = (round + 1) + " / " + total;
            loadRound();
          } else {
            BB.toast("That's not the best way. Try again.", "warn");
          }
        });
      });
    });
    $("#ss-content").appendChild(shareBtn);
  }

  function endGame() {
    const over = $("#ss-over");
    over.style.display = "block";
    const pct = Math.round((score / total) * 100);
    over.innerHTML = '<div class="big">🎉</div><h2>Done!</h2><p>You got <strong>' + score + ' of ' + total + '</strong> right (' + pct + '%).</p><div class="game-actions"><button class="btn btn-primary btn-big" id="ss-replay">Play again</button></div>';
    $("#ss-replay").addEventListener("click", () => { over.style.display = "none"; score = 0; round = 0; $("#ss-score").textContent = "0"; $("#ss-round").textContent = "1 / " + total; loadRound(); });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.createElement("button");
    btn.className = "btn btn-primary btn-big";
    btn.textContent = "Start game";
    btn.addEventListener("click", () => { btn.style.display = "none"; loadRound(); });
    document.querySelector("main").appendChild(btn);
  });
})();
