/* =========================================================
   Browser Buddy — Scam or Safe? game
   ========================================================= */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Scenarios ---------- */
  // Each: { title, context, scene (html), correctId, explanation, redFlags }
  const SCENARIOS = [
    {
      title: "Download page",
      context: "You want to download a free PDF reader. Which button is the real one?",
      correctId: "real",
      explanation: "The real download is the small, plain link. The big flashy buttons are ads that often install junk.",
      redFlags: [
        "Big green 'Download Now!' buttons are usually ads.",
        "Real download links are often small text, not giant buttons.",
        "Check the web address — ads often lead somewhere else.",
      ],
      scene: `
        <div class="dl-page">
          <h3>Free PDF Reader</h3>
          <p>Read any PDF file on your computer.</p>
          <div class="dl-ad scam-option" data-option-id="ad1" data-safety="trap">
            <div><div class="big">⬇ DOWNLOAD NOW!</div><div class="sub">Fast • Free • Safe</div></div>
            <button class="scam-option" style="pointer-events:none">Download</button>
          </div>
          <div class="dl-ad scam-option" data-option-id="ad2" data-safety="trap">
            <div><div class="big">⬇ GET IT FREE</div><div class="sub">No signup needed</div></div>
            <button class="scam-option" style="pointer-events:none">Download</button>
          </div>
          <div class="dl-real scam-option" data-option-id="real" data-safety="safe">
            📄 <a href="#" onclick="return false;">Download version 4.2 (6 MB)</a> — official site
          </div>
        </div>`,
    },
    {
      title: "Cookie banner",
      context: "A website shows this banner. What's the safest choice?",
      correctId: "reject",
      explanation: "Choosing 'Reject all' (or 'Essential only') keeps your data private. 'Accept all' lets them track you.",
      redFlags: [
        "'Accept all' is usually the big, colourful button — by design.",
        "'Manage preferences' hides the reject option.",
        "You can almost always reject non-essential cookies.",
      ],
      scene: `
        <div class="cookie-banner">
          <div class="msg">This site uses cookies to track you and show ads. <a href="#" onclick="return false;">Learn more</a></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="cookie-btn scam-option" data-option-id="accept" data-safety="trap">Accept all</button>
            <button class="cookie-btn scam-option" data-option-id="manage" data-safety="risky">Manage preferences</button>
            <button class="cookie-btn scam-option" data-option-id="reject" data-safety="safe">Reject all</button>
          </div>
        </div>`,
    },
    {
      title: "Virus warning",
      context: "This pop-up appears while you browse. What should you do?",
      correctId: "close",
      explanation: "Real security software never shows pop-ups inside a web page. Close the tab and don't click anything.",
      redFlags: [
        "Web pages can't scan your computer for viruses.",
        "The 'Call this number' trick is a classic scam.",
        "Never call a number shown in a browser pop-up.",
      ],
      scene: `
        <div class="fake-virus">
          <h3>⚠️ VIRUS DETECTED!</h3>
          <p>Your computer is infected with 5 viruses. Your data is at risk.</p>
          <div class="bigbtn scam-option" data-option-id="call" data-safety="trap">Call Support: 1-800-555-0199</div>
          <div style="margin-top:12px">
            <button class="cookie-btn scam-option" data-option-id="close" data-safety="safe" style="background:#fff;color:#8b0000">Close this page</button>
          </div>
        </div>`,
    },
    {
      title: "Permission request",
      context: "A wallpaper app asks for this permission. What do you pick?",
      correctId: "deny",
      explanation: "A wallpaper app has no reason to read your files or location. Deny it.",
      redFlags: [
        "Apps ask for more than they need.",
        "'Allow' to 'files and media' for a wallpaper app is suspicious.",
        "You can change permissions later in settings.",
      ],
      scene: `
        <div class="perm-popup">
          <div class="ico">🖼️</div>
          <h4>Pretty Wallpapers</h4>
          <p>Allow this app to access your files, photos, and location?</p>
          <div class="perm-actions">
            <button class="scam-option" data-option-id="allow" data-safety="trap">Allow</button>
            <button class="scam-option" data-option-id="deny" data-safety="safe">Deny</button>
          </div>
        </div>`,
    },
    {
      title: "Login page",
      context: "You're about to sign in. Is this page safe?",
      correctId: "check",
      explanation: "The address bar shows a fake domain. Never type your password there. Check the real address first.",
      redFlags: [
        "The address is 'secure-login-paypal.com' — not paypal.com.",
        "Real sites use their own domain, not a long fake one.",
        "When in doubt, type the address yourself.",
      ],
      scene: `
        <div class="login-fake">
          <div class="url scam-option" data-option-id="check" data-safety="safe">🔒 secure-login-paypal.com/signin</div>
          <input type="text" placeholder="Email" readonly>
          <input type="password" placeholder="Password" readonly>
          <button class="signin scam-option" data-option-id="signin" data-safety="trap">Sign in</button>
        </div>`,
    },
    {
      title: "Notification request",
      context: "A news site asks this. What do you choose?",
      correctId: "block",
      explanation: "Sites that ask to 'Allow notifications' often spam you later. Block them.",
      redFlags: [
        "Notifications from websites are rarely useful.",
        "'Allow' lets them send pop-ups even when you're not on the site.",
        "You can always allow later if you really want them.",
      ],
      scene: `
        <div class="notif-popup">
          <h4>example-news.com wants to</h4>
          <p>Show notifications</p>
          <div class="notif-actions">
            <button class="scam-option" data-option-id="allow" data-safety="trap">Allow</button>
            <button class="scam-option" data-option-id="block" data-safety="safe">Block</button>
          </div>
        </div>`,
    },
    {
      title: "Browser update",
      context: "This appears while you read a blog. What's the safest action?",
      correctId: "ignore",
      explanation: "Browsers update themselves. A web page asking you to 'update' is almost always a trap.",
      redFlags: [
        "Real browser updates never come from a web page.",
        "The 'update now' button usually downloads malware.",
        "Close the tab and ignore it.",
      ],
      scene: `
        <div class="update-ad">
          <h3>⚠️ Your browser is out of date!</h3>
          <p>Update now to stay safe and fast.</p>
          <div class="bigbtn scam-option" data-option-id="update" data-safety="trap">Update now</div>
          <div style="margin-top:12px">
            <button class="cookie-btn scam-option" data-option-id="ignore" data-safety="safe" style="background:#fff;color:#1a2233">Close this page</button>
          </div>
        </div>`,
    },
    {
      title: "You won a prize!",
      context: "This page pops up. What do you do?",
      correctId: "close",
      explanation: "You didn't enter any contest. 'Claim prize' leads to a scam that asks for money or card details.",
      redFlags: [
        "You can't win a contest you didn't enter.",
        "They want your card details 'to ship the prize'.",
        "The countdown timer is there to rush you.",
      ],
      scene: `
        <div class="win-page">
          <h3>🎉 Congratulations! You won an iPhone!</h3>
          <p>Claim your prize in the next 2:00 minutes or it expires.</p>
          <div class="bigbtn scam-option" data-option-id="claim" data-safety="trap">Claim prize now</div>
          <div style="margin-top:12px">
            <button class="cookie-btn scam-option" data-option-id="close" data-safety="safe" style="background:rgba(255,255,255,.2);color:#fff;border-color:#fff">Close this page</button>
          </div>
        </div>`,
    },
  ];

  /* ---------- State ---------- */
  let order = [];
  let idx = 0;
  let score = 0;
  let streak = 0;
  let bestStreak = 0;
  let answered = false;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startGame() {
    order = shuffle(SCENARIOS.map((_, i) => i));
    idx = 0;
    score = 0;
    streak = 0;
    bestStreak = 0;
    renderHud();
    loadRound();
  }

  function loadRound() {
    answered = false;
    const s = SCENARIOS[order[idx]];
    $("#scam-title").textContent = s.title;
    $("#scam-context").innerHTML = "<strong>Scenario:</strong> " + s.context;
    $("#scam-scene").innerHTML = s.scene;
    $("#scam-feedback").innerHTML = "";
    $("#scam-feedback").className = "scam-feedback";
    $("#scam-round").textContent = (idx + 1) + " / " + SCENARIOS.length;

    // bind clicks
    $$(".scam-option", $("#scam-scene")).forEach((el) => {
      el.addEventListener("click", () => handlePick(el.dataset.optionId, s));
    });
  }

  function handlePick(pickedId, s) {
    if (answered) return;
    answered = true;
    const correct = pickedId === s.correctId;
    if (correct) {
      score++;
      streak++;
      if (streak > bestStreak) bestStreak = streak;
      BB.toast("✓ Safe choice!", "good", 1500);
    } else {
      streak = 0;
      BB.toast("Not the safest one.", "warn", 1800);
    }

    // highlight
    $$(".scam-option", $("#scam-scene")).forEach((el) => {
      el.classList.add("disabled");
      if (el.dataset.optionId === s.correctId) el.classList.add("reveal-safe");
      if (el.dataset.optionId === pickedId && !correct) el.classList.add("bad-pick");
      if (el.dataset.optionId === pickedId && correct) el.classList.add("safe-pick");
    });

    const fb = $("#scam-feedback");
    fb.className = "scam-feedback " + (correct ? "good" : "bad");
    fb.innerHTML =
      "<div>" + (correct ? "✓ Great! You picked the safest option." : "✗ That one was risky.") + "</div>" +
      '<div class="explain">' + s.explanation + "</div>" +
      '<ul class="redflags">' + s.redFlags.map((r) => "<li>🚩 " + r + "</li>").join("") + "</ul>";

    $("#scam-next").style.display = "inline-flex";

    renderHud();
  }

  function renderHud() {
    $("#scam-score").textContent = score;
    $("#scam-streak").textContent = streak;
    $("#scam-best").textContent = bestStreak;
    $("#scam-round").textContent = (idx + 1) + " / " + SCENARIOS.length;
  }

  function nextRound() {
    idx++;
    if (idx >= SCENARIOS.length) {
      showOver();
      return;
    }
    $("#scam-next").style.display = "none";
    loadRound();
  }

  function showOver() {
    $("#scam-card").style.display = "none";
    const over = $("#scam-over");
    over.style.display = "block";
    const pct = Math.round((score / SCENARIOS.length) * 100);
    let msg = "Good start — keep practicing.";
    if (pct >= 90) msg = "Excellent! You're a scam-spotting pro.";
    else if (pct >= 70) msg = "Nice work. A few more rounds and you'll be great.";
    else if (pct >= 50) msg = "Halfway there. Try again to build the habit.";
    $("#scam-over").innerHTML =
      '<div class="big">🎉</div>' +
      "<h2>You finished!</h2>" +
      "<p>You got <strong>" + score + " of " + SCENARIOS.length + "</strong> right (" + pct + "%).</p>" +
      "<p>" + msg + "</p>" +
      "<p>Best streak: <strong>" + bestStreak + "</strong></p>" +
      '<div class="scam-actions"><button class="btn btn-primary btn-big" id="scam-replay">Play again</button></div>';
    $("#scam-replay").addEventListener("click", () => {
      $("#scam-over").style.display = "none";
      $("#scam-card").style.display = "block";
      startGame();
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    $("#scam-next").addEventListener("click", nextRound);
    startGame();
  });
})();
