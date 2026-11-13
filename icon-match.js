/* =========================================================
   Browser Buddy — Icon Match & Mystery Button
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const ICONS = [
    { glyph: "☰", name: "Hamburger menu", desc: "Opens a list of options or pages." },
    { glyph: "⋮", name: "Three dots (more)", desc: "Shows more actions." },
    { glyph: "⚙️", name: "Settings / gear", desc: "Opens settings." },
    { glyph: "🔍", name: "Search", desc: "Lets you type what you're looking for." },
    { glyph: "🏠", name: "Home", desc: "Takes you back to the main page." },
    { glyph: "←", name: "Back arrow", desc: "Goes to the previous page." },
    { glyph: "↻", name: "Refresh", desc: "Reloads the current page." },
    { glyph: "＋", name: "New tab", desc: "Opens a fresh page." },
    { glyph: "⭐", name: "Bookmark", desc: "Saves this page." },
    { glyph: "↗️", name: "Share", desc: "Sends this page to someone." },
    { glyph: "📋", name: "Copy", desc: "Copies text to clipboard." },
    { glyph: "🗑️", name: "Delete / trash", desc: "Moves something to the trash." },
    { glyph: "↩️", name: "Reply", desc: "Writes a response to an email." },
    { glyph: "📎", name: "Attach", desc: "Adds a file to an email." },
    { glyph: "🔒", name: "Lock / secure", desc: "Connection is private and safe." },
    { glyph: "👁️", name: "Show / hide", desc: "Shows or hides a password." },
    { glyph: "🔔", name: "Notifications", desc: "Alerts from an app." },
    { glyph: "🔇", name: "Mute", desc: "Turns off microphone." },
    { glyph: "📞", name: "End call", desc: "Leaves the video call." },
    { glyph: "⬇️", name: "Download", desc: "Saves a file to your device." },
  ];

  let mode = "practice", score = 0, streak = 0, bestStreak = 0, round = 0, total = 10;
  let timer = null, timeLeft = 8, running = false, answered = false;
  let current = null;

  function shuffle(a) { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; }

  function newQuestion() {
    answered = false;
    current = ICONS[Math.floor(Math.random() * ICONS.length)];
    const distractors = shuffle(ICONS.filter((x) => x.name !== current.name)).slice(0, 3);
    const opts = shuffle([current, ...distractors]);
    $("#im-glyph").textContent = current.glyph;
    $("#im-question").textContent = "What does this icon do?";
    $("#im-options").innerHTML = opts.map((o) => '<button class="im-opt" data-name="' + o.name + '">' + o.name + "</button>").join("");
    $$(".im-opt", $("#im-options")).forEach((b) => {
      b.addEventListener("click", () => answer(b.dataset.name));
    });
    $("#im-feedback").textContent = "";
    $("#im-feedback").className = "id-quiz-feedback";
    const nb = $("#im-next");
    if (nb) nb.style.display = "none";
    $("#im-round").textContent = (round + 1) + " / " + total;
    if (mode === "challenge") {
      timeLeft = 8;
      $("#im-time").textContent = timeLeft;
      $("#im-timer").style.display = "flex";
      clearInterval(timer);
      timer = setInterval(() => {
        timeLeft--;
        $("#im-time").textContent = timeLeft;
        if (timeLeft <= 3) $("#im-timer").classList.add("urgent");
        if (timeLeft <= 0) { clearInterval(timer); if (!answered) answer(null); }
      }, 1000);
    } else {
      $("#im-timer").style.display = "none";
    }
  }

  function answer(picked) {
    if (answered) return;
    answered = true;
    clearInterval(timer);
    const correct = picked === current.name;
    if (correct) {
      score++;
      streak++;
      if (streak > bestStreak) bestStreak = streak;
      if (typeof Sound !== "undefined") Sound.success();
      $("#im-feedback").textContent = "✓ Correct!";
      $("#im-feedback").className = "id-quiz-feedback good";
    } else {
      streak = 0;
      if (typeof Sound !== "undefined") Sound.error();
      $("#im-feedback").textContent = "✗ It's: " + current.name + " — " + current.desc;
      $("#im-feedback").className = "id-quiz-feedback bad";
    }
    $$(".im-opt", $("#im-options")).forEach((b) => {
      b.classList.add("disabled");
      if (b.dataset.name === current.name) b.classList.add("correct");
      else if (b.dataset.name === picked) b.classList.add("wrong");
    });
    $("#im-score").textContent = score;
    $("#im-streak").textContent = streak;
    if (round < total - 1) {
      let btn = $("#im-next");
      if (!btn) {
        btn = document.createElement("button");
        btn.className = "btn btn-primary";
        btn.id = "im-next";
        btn.textContent = "Next →";
        btn.style.marginTop = "12px";
        btn.addEventListener("click", nextRound);
        $("#im-feedback").parentNode.appendChild(btn);
      }
      btn.style.display = "inline-flex";
    } else {
      setTimeout(endGame, 1200);
    }
  }

  function nextRound() {
    round++;
    if (round >= total) { endGame(); return; }
    newQuestion();
  }

  function endGame() {
    if (typeof Sound !== "undefined") { Sound.complete(); Sound.confetti(); }
    running = false;
    clearInterval(timer);
    if (typeof Sound !== "undefined") { Sound.complete(); Sound.confetti(); }
    const over = $("#im-over");
    over.style.display = "block";
    const pct = Math.round((score / total) * 100);
    let msg = "Good start — keep practicing.";
    if (pct >= 90) msg = "Excellent! You know your icons.";
    else if (pct >= 70) msg = "Nice work. A few more rounds.";
    else if (pct >= 50) msg = "Halfway. Try again to build speed.";
    over.innerHTML = '<div class="big">🎉</div><h2>Done!</h2><p>You got <strong>' + score + ' of ' + total + '</strong> right (' + pct + '%).</p><p>Best streak: <strong>' + bestStreak + '</strong></p><p>' + msg + '</p><div class="game-actions"><button class="btn btn-primary btn-big" id="im-replay">Play again</button></div>';
    $("#im-replay").addEventListener("click", startGame);
  }

  function startGame() {
    mode = document.querySelector(".mode-btn.active").dataset.mode;
    score = 0; streak = 0; bestStreak = 0; round = 0;
    $("#im-score").textContent = "0";
    $("#im-streak").textContent = "0";
    $("#im-over").style.display = "none";
    running = true;
    newQuestion();
  }

  document.addEventListener("DOMContentLoaded", () => {
    $$(".mode-btn").forEach((b) => {
      b.addEventListener("click", () => {
        $$(".mode-btn").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
      });
    });
    const startBtn = document.createElement("button");
    startBtn.className = "btn btn-primary btn-big";
    startBtn.textContent = "Start game";
    startBtn.addEventListener("click", startGame);
    const ga = document.createElement("div");
    ga.className = "game-actions";
    ga.appendChild(startBtn);
    document.querySelector("main").appendChild(ga);
  });
})();
