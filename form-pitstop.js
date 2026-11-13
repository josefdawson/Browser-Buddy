/* =========================================================
   Browser Buddy — Form & Password Pitstop
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  let timer = null, timeLeft = 60, running = false;

  function startGame() {
    timeLeft = 60; running = true;
    $("#fp-time").textContent = timeLeft;
    $("#fp-over").style.display = "none";
    // reset form
    $("#fp-name").value = "";
    $("#fp-pw").value = "";
    $("#fp-pw").type = "password";
    $("#fp-country").value = "";
    $("#fp-year").value = "";
    $("#fp-terms").checked = false;
    $("#fp-news").checked = false;
    document.querySelectorAll('input[name="contact"]').forEach((r) => (r.checked = false));
    timer = setInterval(() => {
      timeLeft--;
      $("#fp-time").textContent = timeLeft;
      if (timeLeft <= 10) document.querySelector(".game-stat").classList.add("urgent");
      if (timeLeft <= 0) endGame(false);
    }, 1000);
  }

  $("#fp-pwtoggle").addEventListener("click", () => {
    const pw = $("#fp-pw");
    pw.type = pw.type === "password" ? "text" : "password";
    $("#fp-pwtoggle").textContent = pw.type === "password" ? "👁️" : "🙈";
  });

  $("#fp-submit").addEventListener("click", () => {
    if (!running) { startGame(); return; }
    const name = $("#fp-name").value.trim();
    const pw = $("#fp-pw").value;
    const country = $("#fp-country").value;
    const year = $("#fp-year").value;
    const terms = $("#fp-terms").checked;
    const contact = document.querySelector('input[name="contact"]:checked');

    let errors = [];
    if (name.length < 2) errors.push("Enter your full name.");
    if (pw.length < 8) errors.push("Password must be at least 8 characters.");
    if (!country) errors.push("Select a country.");
    if (!year) errors.push("Select a birth year.");
    if (!terms) errors.push("You must agree to the terms.");
    if (!contact) errors.push("Choose a contact method.");

    if (errors.length > 0) {
      BB.toast("Fix: " + errors[0], "warn", 2500);
      return;
    }
    // success
    clearInterval(timer);
    running = false;
    const score = timeLeft * 10 + 500;
    $("#fp-score").textContent = score;
    const over = $("#fp-over");
    over.style.display = "block";
    over.innerHTML = '<div class="big">🎉</div><h2>Form submitted!</h2><p>Time left: ' + timeLeft + 's · Score: ' + score + '</p><p>Great job navigating the form.</p><div class="game-actions"><button class="btn btn-primary btn-big" id="fp-replay">Play again</button></div>';
    $("#fp-replay").addEventListener("click", startGame);
    BB.toast("✓ Submitted!", "good", 1500);
  });

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.createElement("button");
    btn.className = "btn btn-primary btn-big";
    btn.textContent = "Start game";
    btn.addEventListener("click", startGame);
    const ga = document.createElement("div");
    ga.className = "game-actions";
    ga.appendChild(btn);
    document.querySelector("main").appendChild(ga);
  });
})();
