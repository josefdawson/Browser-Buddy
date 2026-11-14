/* =========================================================
   Browser Buddy — Tech Support Career Mode
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  const CALLERS = [
    { name: "Grandma Rose", emoji: "👵", problem: "My browser is zoomed in and there are pop-ups everywhere!" },
    { name: "Uncle Bob", emoji: "👨", problem: "The page won't load and there's a virus warning!" },
    { name: "Sarah", emoji: "👧", problem: "I have 30 tabs open and the computer is slow!" },
    { name: "Dad", emoji: "👨", problem: "I can't find my downloaded file and storage is full!" },
    { name: "Friend", emoji: "👩", problem: "The text is too small and I'm stuck in full-screen!" },
    { name: "Neighbor Tom", emoji: "👴", problem: "Wi-Fi is off and there are scam emails!" },
  ];

  const PROBLEM_SETS = [
    [
      { desc: "Screen zoomed to 300%", options: [
        { text: "Reset zoom to 100%", correct: true },
        { text: "Buy a bigger monitor", correct: false, virus: false },
        { text: "Close the browser", correct: false, virus: false },
        { text: "Click 'Fix zoom now' (suspicious link)", correct: false, virus: true },
        { text: "Restart the computer", correct: false, virus: false },
        { text: "Ignore it", correct: false, virus: false },
      ]},
      { desc: "3 pop-ups blocking the screen", options: [
        { text: "Close all pop-ups", correct: true },
        { text: "Click 'Claim prize' on the pop-up", correct: false, virus: true },
        { text: "Minimize the pop-ups", correct: false, virus: false },
        { text: "Wait for them to go away", correct: false, virus: false },
        { text: "Restart the browser", correct: false, virus: false },
        { text: "Ignore them", correct: false, virus: false },
      ]},
      { desc: "Page won't load (stuck spinning)", options: [
        { text: "Refresh page", correct: true },
        { text: "Click 'Speed up your browser' (ad)", correct: false, virus: true },
        { text: "Type the URL again", correct: false, virus: false },
        { text: "Wait longer", correct: false, virus: false },
        { text: "Clear all cookies", correct: false, virus: false },
        { text: "Close the tab", correct: false, virus: false },
      ]},
      { desc: "12 tabs open — slowing down", options: [
        { text: "Close extra tabs", correct: true },
        { text: "Open more tabs", correct: false, virus: false },
        { text: "Restart the browser", correct: false, virus: false },
        { text: "Buy more RAM", correct: false, virus: false },
        { text: "Ignore it", correct: false, virus: false },
        { text: "Close the browser entirely", correct: false, virus: false },
      ]},
    ],
    [
      { desc: "Fake virus warning on screen", options: [
        { text: "Close the scam pop-up", correct: true },
        { text: "Call the number on screen", correct: false, virus: true },
        { text: "Click 'Scan now'", correct: false, virus: true },
        { text: "Restart the computer", correct: false, virus: false },
        { text: "Ignore it", correct: false, virus: false },
        { text: "Run a real antivirus scan", correct: false, virus: false },
      ]},
      { desc: "Wi-Fi is turned off", options: [
        { text: "Turn on Wi-Fi", correct: true },
        { text: "Restart the router", correct: false, virus: false },
        { text: "Buy a new router", correct: false, virus: false },
        { text: "Use mobile data", correct: false, virus: false },
        { text: "Call the internet company", correct: false, virus: false },
        { text: "Ignore it", correct: false, virus: false },
      ]},
      { desc: "Scam email in inbox", options: [
        { text: "Delete scam email", correct: true },
        { text: "Click the link in the email", correct: false, virus: true },
        { text: "Reply asking if real", correct: false, virus: false },
        { text: "Forward to friends", correct: false, virus: false },
        { text: "Mark as spam", correct: false, virus: false },
        { text: "Ignore it", correct: false, virus: false },
      ]},
      { desc: "Browser showing 'Page not found'", options: [
        { text: "Check the URL", correct: true },
        { text: "Click 'Fix now' (suspicious)", correct: false, virus: true },
        { text: "Restart the browser", correct: false, virus: false },
        { text: "Clear cache", correct: false, virus: false },
        { text: "Reinstall browser", correct: false, virus: false },
        { text: "Ignore it", correct: false, virus: false },
      ]},
    ],
  ];

  let round = 0, score = 0, streak = 0, running = false;
  let timer = null, patience = 100, problems = [], fixed = new Set();
  let currentCaller = null, viruses = 0, mistakes = 0;

  function generateRound() {
    currentCaller = CALLERS[Math.floor(Math.random() * CALLERS.length)];
    const set = PROBLEM_SETS[Math.floor(Math.random() * PROBLEM_SETS.length)].map((p) => ({ ...p, options: p.options.map((o) => ({ ...o })) }));
    const stage = $("#ts-stage");
    stage.innerHTML = "";
    $("#ts-caller").innerHTML = currentCaller.emoji + " <strong>" + currentCaller.name + ":</strong> \"" + currentCaller.problem + "\"";
    $("#ts-instr").textContent = "Fix all " + set.length + " problems. Pick the correct fix for each. Beware of traps!";
    problems = set;
    fixed = new Set();
    viruses = 0;
    mistakes = 0;
    const screen = document.createElement("div");
    screen.style.cssText = "background:#f7f9fd;border:2px solid var(--line);border-radius:8px;padding:12px;min-height:200px";
    screen.innerHTML = '<div style="font-size:.85rem;color:var(--muted);margin-bottom:8px">🖥️ ' + currentCaller.name + "'s computer screen:</div>";
    problems.forEach((p) => {
      const el = document.createElement("div");
      el.className = "ts-problem";
      el.style.background = "#fff";
      const shuffled = p.options.slice().sort(() => Math.random() - 0.5);
      const optsHtml = shuffled.map((o) => '<button data-fix="' + p.id + '" data-correct="' + o.correct + '" data-virus="' + (o.virus ? "1" : "0") + '" style="display:block;width:100%;text-align:left;margin:4px 0;padding:8px 12px;border:1px solid #3a4468;border-radius:6px;cursor:pointer;font-size:.85rem;background:#2a2a3e;color:#e8ecf7">' + o.text + '</button>').join("");
      el.innerHTML = '<span class="desc" style="font-weight:600;display:block;margin-bottom:6px">' + p.desc + '</span>' + optsHtml;
      el.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => handleFix(p, btn, el));
      });
      screen.appendChild(el);
    });
    const status = document.createElement("div");
    status.style.cssText = "margin-top:8px;padding:8px;background:#eef2fb;border-radius:6px;font-size:.8rem;color:var(--muted)";
    status.textContent = "Status: " + problems.length + " issue(s) detected. 0 fixed.";
    screen.appendChild(status);
    stage.appendChild(screen);

    const doneBtn = document.createElement("button");
    doneBtn.className = "btn btn-primary btn-big";
    doneBtn.style.marginTop = "12px";
    doneBtn.textContent = "Done — I fixed everything";
    doneBtn.addEventListener("click", finishRound);
    stage.appendChild(doneBtn);
  }

  function handleFix(problem, btn, el) {
    if (btn.disabled) return;
    const isCorrect = btn.dataset.correct === "true";
    const isVirus = btn.dataset.virus === "1";
    el.querySelectorAll("button").forEach((b) => (b.disabled = true));
    if (isCorrect) {
      btn.style.background = "#e3f6ec";
      btn.style.borderColor = "var(--good)";
      btn.textContent = "✓ " + btn.textContent;
      fixed.add(problem.id);
      if (typeof Sound !== "undefined") Sound.success();
      const status = el.parentElement.querySelector("div:last-child");
      if (status) status.textContent = "Status: " + (problems.length - fixed.size) + " issue(s) remaining. " + fixed.size + " fixed.";
    } else {
      btn.style.background = "#fdeaea";
      btn.style.borderColor = "var(--bad)";
      btn.textContent = "✗ " + btn.textContent;
      mistakes++;
      if (isVirus) {
        viruses++;
        if (typeof Sound !== "undefined") Sound.error();
        BB.toast("You downloaded a virus! The computer is worse now.", "warn", 2000);
      } else {
        if (typeof Sound !== "undefined") Sound.error();
        BB.toast("Wrong fix. Try a different option.", "warn", 1500);
      }
    }
  }

  function finishRound() {
    running = false;
    clearInterval(timer);
    const unfixed = problems.filter((p) => !fixed.has(p.id));
    const hasMistakes = mistakes > 0 || viruses > 0 || unfixed.length > 0;
    const over = $("#ts-over");
    over.style.display = "block";
    let msg = "";
    if (hasMistakes) {
      msg = currentCaller.name + " says: \"You missed " + unfixed.length + " problem(s) and made " + mistakes + " mistake(s)" + (viruses > 0 ? " (including " + viruses + " virus" + (viruses > 1 ? "es" : "") + ")" : "") + ". The computer is " + (viruses > 0 ? "worse now!" : "not fully fixed.") + "\"";
    } else {
      msg = currentCaller.name + " says: \"Thank you! My computer is working perfectly now.\"";
      score++;
      streak++;
    }
    $("#ts-score").textContent = score;
    $("#ts-streak").textContent = streak;
    let perfMsg = "Good effort!";
    if (!hasMistakes) {
      if (score >= 10) perfMsg = "Incredible! You're a tech support pro.";
      else if (score >= 5) perfMsg = "Nice work. Keep practicing.";
      else perfMsg = "Good job fixing that computer!";
    } else {
      perfMsg = "Review the mistakes and try again.";
    }
    over.innerHTML = '<div class="big">' + (hasMistakes ? "⚠️" : "🎉") + '</div><h2>' + (hasMistakes ? "Not quite!" : "All fixed!") + '</h2><p>' + msg + '</p><p>' + perfMsg + '</p><div class="game-actions"><button class="btn btn-primary btn-big" id="ts-replay">Next customer</button></div>';
    $("#ts-replay").addEventListener("click", () => {
      over.style.display = "none";
      round++;
      $("#ts-round").textContent = round + 1;
      generateRound();
      startTimer();
    });
    if (typeof Sound !== "undefined") {
      if (hasMistakes) Sound.error();
      else { Sound.complete(); Sound.confetti(); }
    }
  }

  function startTimer() {
    patience = 100;
    $("#ts-patience").style.width = "100%";
    $("#ts-patience").classList.remove("urgent");
    clearInterval(timer);
    timer = setInterval(() => {
      patience -= 2;
      $("#ts-patience").style.width = Math.max(0, patience) + "%";
      if (patience <= 30) $("#ts-patience").classList.add("urgent");
      if (patience <= 0) {
        clearInterval(timer);
        finishRound();
      }
    }, 1000);
  }

  function startGame() {
    const btn = document.querySelector("#ts-startbtn");
    if (btn) btn.style.display = "none";
    round = 0; score = 0; streak = 0; running = true; viruses = 0; mistakes = 0;
    $("#ts-score").textContent = "0";
    $("#ts-round").textContent = "1";
    $("#ts-streak").textContent = "0";
    $("#ts-over").style.display = "none";
    $("#ts-stage").innerHTML = "";
    generateRound();
    startTimer();
  }

  window.startGame = startGame;
  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector("#ts-startbtn");
    if (btn) btn.addEventListener("click", startGame);
  });
})();
