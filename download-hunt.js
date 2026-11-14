/* =========================================================
   Browser Buddy — Real Download Button Hunt
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  const ROUNDS = [
    { name: "Free PDF Reader", real: "Download version 4.2 (6 MB)", ext: ".pdf", url: "pdfreader.example.com/download" },
    { name: "Photo Editor", real: "Download installer (12 MB)", ext: ".exe", url: "photoedit.example.com/files" },
    { name: "Music Player", real: "Get musicplayer.zip", ext: ".zip", url: "music.example.com/get" },
    { name: "Video Converter", real: "Download (8 MB .mp4)", ext: ".mp4", url: "videoconv.example.com/dl" },
    { name: "Note Taking App", real: "noteapp.dmg (Mac)", ext: ".dmg", url: "notes.example.com/download" },
    { name: "Game Launcher", real: "launcher-setup.exe", ext: ".exe", url: "games.example.com/launcher" },
    { name: "Spreadsheet Tool", real: "sheets.ods (4 MB)", ext: ".ods", url: "sheets.example.com/files" },
    { name: "Chat App", real: "chatapp.apk (Android)", ext: ".apk", url: "chat.example.com/android" },
  ];

  const FAKE_LABELS = [
    "⬇ DOWNLOAD NOW!", "⬇ GET IT FREE", "⬇ CLICK HERE TO DOWNLOAD",
    "⬇ DOWNLOAD FAST", "⬇ START DOWNLOAD", "⬇ GET INSTANT ACCESS",
  ];

  let mode = "practice", score = 0, streak = 0, bestStreak = 0, idx = 0, running = false;
  let timer = null, timeLeft = 20;

  function renderRound() {
    const r = ROUNDS[idx];
    const page = $("#dh-page");
    let html = "<h3>" + r.name + "</h3><p>Download the file for this app.</p>";
    // 5 fake big buttons
    for (let i = 0; i < 5; i++) {
      const label = FAKE_LABELS[Math.floor(Math.random() * FAKE_LABELS.length)];
      html += '<div class="dh-ad" data-fake="1"><div class="big">' + label + "</div><div class='sub'>Fast • Free • Safe • No signup</div></div>";
    }
    // real link (small, plain)
    html += '<div class="dh-real" data-real="1">📄 ' + r.real + " — official site (" + r.url + ")</div>";
    page.innerHTML = html;

    page.querySelectorAll("[data-fake]").forEach((el) => {
      el.addEventListener("click", () => {
        streak = 0;
        BB.toast("That was an ad trap! Try again.", "warn", 1800);
        updateHud();
        renderRound();
      });
    });
    page.querySelector("[data-real]").addEventListener("click", () => {
      score++;
      streak++;
      if (streak > bestStreak) bestStreak = streak;
      BB.toast("✓ Correct! That's the real download link.", "good", 1500);
      updateHud();
      idx++;
      if (idx >= ROUNDS.length) { endGame(); return; }
      $("#dh-round").textContent = (idx + 1) + " / " + ROUNDS.length;
      renderRound();
    });
  }

  function updateHud() {
    $("#dh-score").textContent = score;
    $("#dh-streak").textContent = streak;
    $("#dh-round").textContent = (idx + 1) + " / " + ROUNDS.length;
    $("#dh-time").textContent = timeLeft;
  }

  function startGame() {
    mode = document.querySelector(".mode-btn.active").dataset.mode;
    score = 0; streak = 0; bestStreak = 0; idx = 0; timeLeft = 20; running = true;
    $("#dh-over").style.display = "none";
    $("#dh-timer").style.display = mode === "challenge" ? "flex" : "none";
    updateHud();
    renderRound();
    if (mode === "challenge") {
      timer = setInterval(() => {
        timeLeft--;
        updateHud();
        if (timeLeft <= 5) $("#dh-timer").classList.add("urgent");
        if (timeLeft <= 0) endGame();
      }, 1000);
    }
  }

  function endGame() {
    if (typeof Sound !== "undefined") { Sound.complete(); Sound.confetti(); }
        running = false;
    clearInterval(timer);
    const over = $("#dh-over");
    over.style.display = "block";
    const pct = Math.round((score / ROUNDS.length) * 100);
    over.innerHTML = '<div class="big">🎉</div><h2>Done!</h2><p>You found <strong>' + score + ' of ' + ROUNDS.length + '</strong> real links (' + pct + '%).</p><p>Best streak: <strong>' + bestStreak + '</strong></p><div class="game-actions"><button class="btn btn-primary btn-big" id="dh-replay">Play again</button></div>';
    $("#dh-replay").addEventListener("click", startGame);
  }

  document.addEventListener("DOMContentLoaded", () => {
    Array.from(document.querySelectorAll(".mode-btn")).forEach((b) => {
      b.addEventListener("click", () => {
        Array.from(document.querySelectorAll(".mode-btn")).forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
      });
    });
    $("#dh-start") && $("#dh-start").addEventListener("click", startGame);
    // add start button dynamically if missing
    if (!$("#dh-start")) {
      const btn = document.createElement("button");
      btn.className = "btn btn-primary btn-big";
      btn.id = "dh-start";
      btn.textContent = "Start game";
      btn.addEventListener("click", startGame);
      document.querySelector(".game-actions")?.appendChild(btn) || document.querySelector("main").appendChild(btn);
    }
  });
})();
