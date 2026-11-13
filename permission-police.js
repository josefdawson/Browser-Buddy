/* =========================================================
   Browser Buddy — Permission Police
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  const SCENARIOS = [
    { app: "RecipeBlog", icon: "🍳", perm: "Location", need: false, reason: "A recipe site doesn't need your location." },
    { app: "Map App", icon: "🗺️", perm: "Location", need: true, reason: "Maps need your location to show where you are." },
    { app: "Calculator", icon: "🧮", perm: "Contacts", need: false, reason: "A calculator has no reason to read your contacts." },
    { app: "Camera App", icon: "📷", perm: "Camera", need: true, reason: "A camera app needs the camera to take photos." },
    { app: "Flashlight", icon: "🔦", perm: "Microphone", need: false, reason: "A flashlight doesn't need your microphone." },
    { app: "Voice Recorder", icon: "🎙️", perm: "Microphone", need: true, reason: "A recorder needs the microphone to record." },
    { app: "Wallpaper App", icon: "🖼️", perm: "Files & Photos", need: false, reason: "Wallpapers don't need access to your files." },
    { app: "Photo Editor", icon: "✂️", perm: "Files & Photos", need: true, reason: "A photo editor needs to read your photos." },
    { app: "Weather App", icon: "🌤️", perm: "Location", need: true, reason: "Weather needs your location for local forecasts." },
    { app: "Torch App", icon: "🔦", perm: "Location", need: false, reason: "A torch doesn't need your location." },
  ];

  let mode = "practice", score = 0, round = 0, total = 8, timer = null, timeLeft = 10, running = false, answered = false, order = [];

  function shuffle(a) { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; }

  function newRound() {
    answered = false;
    const s = SCENARIOS[order[round]];
    $("#pp-card").innerHTML =
      '<div class="ico">' + s.icon + "</div>" +
      "<h3>" + s.app + "</h3>" +
      "<p>wants to access your <strong>" + s.perm + "</strong></p>" +
      '<div class="pp-actions">' +
      '<button class="allow" data-act="allow">Allow</button>' +
      '<button class="block" data-act="block">Block</button>' +
      "</div>";
    $("#pp-card").querySelectorAll("[data-act]").forEach((b) => {
      b.addEventListener("click", () => answer(b.dataset.act === "allow", s));
    });
    $("#pp-feedback").textContent = "";
    $("#pp-feedback").className = "id-quiz-feedback";
    $("#pp-round").textContent = (round + 1) + " / " + total;
    if (mode === "challenge") {
      timeLeft = 10;
      $("#pp-time").textContent = timeLeft;
      $("#pp-timer").style.display = "flex";
      clearInterval(timer);
      timer = setInterval(() => {
        timeLeft--;
        $("#pp-time").textContent = timeLeft;
        if (timeLeft <= 3) $("#pp-timer").classList.add("urgent");
        if (timeLeft <= 0) { clearInterval(timer); if (!answered) answer(null, s); }
      }, 1000);
    } else {
      $("#pp-timer").style.display = "none";
    }
  }

  function answer(allowed, s) {
    if (answered) return;
    answered = true;
    clearInterval(timer);
    const correct = allowed === null ? false : (allowed === s.need);
    // if allowed is null (timeout), treat as wrong
    if (allowed === null) {
      // no pick
    }
    if (correct) {
      score++;
      if (typeof Sound !== "undefined") Sound.success();
      $("#pp-feedback").textContent = "✓ Correct! " + s.reason;
      $("#pp-feedback").className = "id-quiz-feedback good";
    } else {
      if (typeof Sound !== "undefined") Sound.error();
      $("#pp-feedback").textContent = "✗ " + (allowed === null ? "Time's up! " : "Wrong. ") + s.reason;
      $("#pp-feedback").className = "id-quiz-feedback bad";
    }
    $("#pp-score").textContent = score;
    const btns = $("#pp-card").querySelectorAll("[data-act]");
    btns.forEach((b) => (b.disabled = true));
    if (round < total - 1) {
      setTimeout(() => { round++; newRound(); }, 1500);
    } else {
      setTimeout(endGame, 1500);
    }
  }

  function endGame() {
    if (typeof Sound !== "undefined") { Sound.complete(); Sound.confetti(); }
    running = false;
    clearInterval(timer);
    const over = $("#pp-over");
    over.style.display = "block";
    const pct = Math.round((score / total) * 100);
    let msg = "Good start — keep practicing.";
    if (pct >= 90) msg = "Excellent! You're a privacy pro.";
    else if (pct >= 70) msg = "Nice work. A few more rounds.";
    else if (pct >= 50) msg = "Halfway. Think about what each app really needs.";
    over.innerHTML = '<div class="big">🎉</div><h2>Done!</h2><p>You got <strong>' + score + ' of ' + total + '</strong> right (' + pct + '%).</p><p>' + msg + '</p><div class="game-actions"><button class="btn btn-primary btn-big" id="pp-replay">Play again</button></div>';
    $("#pp-replay").addEventListener("click", startGame);
  }

  function startGame() {
    mode = document.querySelector(".mode-btn.active").dataset.mode;
    score = 0; round = 0;
    $("#pp-score").textContent = "0";
    $("#pp-over").style.display = "none";
    order = shuffle(SCENARIOS.map((_, i) => i)).slice(0, total);
    running = true;
    newRound();
  }

  document.addEventListener("DOMContentLoaded", () => {
    Array.from(document.querySelectorAll(".mode-btn")).forEach((b) => {
      b.addEventListener("click", () => {
        Array.from(document.querySelectorAll(".mode-btn")).forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
      });
    });
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
