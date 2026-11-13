/* =========================================================
   Browser Buddy — Pop-Up Whack-a-Mole
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const POPUP_TYPES = [
    { title: "🍪 Cookie notice", body: "We use cookies to track you." },
    { title: "🎉 You won a prize!", body: "Claim your reward now." },
    { title: "📰 Newsletter", body: "Sign up for daily deals." },
    { title: "⚠️ System warning", body: "Your computer may be at risk." },
    { title: "🔔 Allow notifications?", body: "example.com wants to send alerts." },
  ];

  let mode = "practice";
  let score = 0, missed = 0, traps = 0;
  let timer = null, timeLeft = 30, running = false;
  let spawnInterval = null;

  function updateHud() {
    $("#pw-score").textContent = score;
    $("#pw-missed").textContent = missed;
    $("#pw-traps").textContent = traps;
    $("#pw-time").textContent = timeLeft;
  }

  function spawnPopup() {
    if (!running) return;
    const stage = $("#pw-stage");
    const rect = stage.getBoundingClientRect();
    const isTrap = Math.random() < 0.4;
    const type = POPUP_TYPES[Math.floor(Math.random() * POPUP_TYPES.length)];
    const pop = document.createElement("div");
    pop.className = "pw-popup";
    pop.style.left = Math.random() * (rect.width - 220) + "px";
    pop.style.top = Math.random() * (rect.height - 140) + "px";
    pop.innerHTML =
      "<button class='fake-close' data-fake='1'>Close ✕</button>" +
      "<button class='real-close' data-real='1'>×</button>" +
      "<h4>" + type.title + "</h4><p>" + type.body + "</p>";
    stage.appendChild(pop);

    pop.querySelector("[data-real]").addEventListener("click", (e) => {
      e.stopPropagation();
      score++;
      pop.remove();
      updateHud();
    });
    pop.querySelector("[data-fake]").addEventListener("click", (e) => {
      e.stopPropagation();
      traps++;
      // spawn two more popups
      spawnPopup();
      spawnPopup();
      pop.remove();
      updateHud();
      BB.toast("That was a trap! More pop-ups appeared.", "warn", 1500);
    });

    // auto-remove after a while (counts as missed)
    setTimeout(() => {
      if (pop.parentNode) {
        missed++;
        pop.remove();
        updateHud();
      }
    }, mode === "challenge" ? 3000 : 5000);
  }

  function startGame() {
    score = 0; missed = 0; traps = 0; timeLeft = 30;
    running = true;
    $("#pw-stage").innerHTML = "";
    $("#pw-over").style.display = "none";
    updateHud();
    $("#pw-timer").style.display = mode === "challenge" ? "flex" : "none";

    spawnPopup();
    spawnInterval = setInterval(() => {
      if (running) spawnPopup();
    }, mode === "challenge" ? 1200 : 2000);

    if (mode === "challenge") {
      timer = setInterval(() => {
        timeLeft--;
        updateHud();
        if (timeLeft <= 10) $("#pw-timer").classList.add("urgent");
        if (timeLeft <= 0) endGame();
      }, 1000);
    }
  }

  function endGame() {
    if (typeof Sound !== "undefined") { Sound.complete(); Sound.confetti(); }
    running = false;
    clearInterval(spawnInterval);
    clearInterval(timer);
    $("#pw-stage").innerHTML = "";
    const over = $("#pw-over");
    over.style.display = "block";
    let msg = "Good practice!";
    if (mode === "challenge") {
      if (score >= 15) msg = "Lightning fast! You're a pop-up pro.";
      else if (score >= 8) msg = "Nice work. Keep practicing.";
      else msg = "Keep at it — you'll get faster.";
    }
    over.innerHTML =
      '<div class="big">🎯</div><h2>Game over!</h2>' +
      "<p>You closed <strong>" + score + "</strong> pop-ups.</p>" +
      "<p>Traps hit: " + traps + " · Missed: " + missed + "</p>" +
      "<p>" + msg + "</p>" +
      '<div class="game-actions"><button class="btn btn-primary btn-big" id="pw-replay">Play again</button></div>';
    $("#pw-replay").addEventListener("click", startGame);
  }

  document.addEventListener("DOMContentLoaded", () => {
    $$(".mode-btn").forEach((b) => {
      b.addEventListener("click", () => {
        $$(".mode-btn").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        mode = b.dataset.mode;
      });
    });
    $("#pw-start").addEventListener("click", startGame);
  });
})();
