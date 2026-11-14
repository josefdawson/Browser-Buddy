/* =========================================================
   Browser Buddy — Scam Generator (Procedural)
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  const SENDERS = [
    { name: "PayPaI Security", email: "security@paypai-verify.com", scam: true },
    { name: "Amaz0n Support", email: "support@amaz0n-update.com", scam: true },
    { name: "Netflix Billing", email: "billing@netfIix.com", scam: true },
    { name: "Your Bank", email: "alerts@yourbank-secure.com", scam: true },
    { name: "Apple ID", email: "appleid@apple-support.com", scam: true },
    { name: "Google Security", email: "no-reply@google-verify.com", scam: true },
    { name: "Mom", email: "mom@example.com", scam: false },
    { name: "Work HR", email: "hr@company.com", scam: false },
    { name: "Newsletter", email: "news@trusted-site.com", scam: false },
    { name: "Friend Sarah", email: "sarah@example.com", scam: false },
  ];

  const HOOKS = [
    { text: "Your account has been suspended. Verify now.", scam: true },
    { text: "You won a free iPad! Claim your prize.", scam: true },
    { text: "Your package is delayed. Update shipping info.", scam: true },
    { text: "Unusual login detected. Reset password.", scam: true },
    { text: "Your subscription expires today. Renew now.", scam: true },
    { text: "Meeting notes from today's call.", scam: false },
    { text: "Photos from the weekend trip.", scam: false },
    { text: "Reminder: dentist appointment Thursday.", scam: false },
    { text: "Your monthly statement is ready.", scam: false },
    { text: "Happy birthday! 🎂", scam: false },
  ];

  const LINKS = [
    { text: "http://secure-login-update.xyz/verify", scam: true },
    { text: "http://account-verify-now.com/reset", scam: true },
    { text: "http://claim-prize-today.net", scam: true },
    { text: "https://amazon.com/orders", scam: false },
    { text: "https://google.com/account", scam: false },
    { text: "https://company.com/portal", scam: false },
  ];

  const LAYOUTS = ["email", "popup", "banner"];

  let score = 0, streak = 0, bestStreak = 0, round = 0;

  function generate() {
    // Decide first: scam or safe (50/50)
    const isScam = Math.random() < 0.5;
    const scamSenders = SENDERS.filter((s) => s.scam);
    const safeSenders = SENDERS.filter((s) => !s.scam);
    const scamHooks = HOOKS.filter((h) => h.scam);
    const safeHooks = HOOKS.filter((h) => !h.scam);
    const scamLinks = LINKS.filter((l) => l.scam);
    const safeLinks = LINKS.filter((l) => !l.scam);

    const sender = isScam
      ? scamSenders[Math.floor(Math.random() * scamSenders.length)]
      : safeSenders[Math.floor(Math.random() * safeSenders.length)];
    const hook = isScam
      ? scamHooks[Math.floor(Math.random() * scamHooks.length)]
      : safeHooks[Math.floor(Math.random() * safeHooks.length)];
    const link = isScam
      ? scamLinks[Math.floor(Math.random() * scamLinks.length)]
      : safeLinks[Math.floor(Math.random() * safeLinks.length)];
    const layout = LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)];
    return { sender, hook, link, layout, isScam };
  }

  let current = null;

  function renderScenario() {
    const s = generate();
    current = s;
    $("#sg-round").textContent = ++round;
    const scene = $("#sg-scene");
    if (s.layout === "email") {
      scene.innerHTML = '<div class="sg-email">' +
        '<div class="from">From: ' + s.sender.name + " &lt;" + s.sender.email + "&gt;</div>" +
        '<div class="subject">Subject: ' + s.hook.text + '</div>' +
        '<div class="body">Dear user, ' + s.hook.text + ' Please click the link below to proceed.</div>' +
        '<div class="link">' + s.link.text + '</div>' +
        '</div>';
    } else if (s.layout === "popup") {
      scene.innerHTML = '<div class="sg-popup">' +
        "<h3>⚠️ " + s.hook.text + "</h3>" +
        "<p>" + s.sender.name + " — " + s.sender.email + "</p>" +
        '<div class="bigbtn">Click here now</div>' +
        '<p style="font-size:.8rem;color:var(--muted);margin-top:8px">' + s.link.text + '</p>' +
        '</div>';
    } else {
      scene.innerHTML = '<div class="sg-popup" style="background:#1a2233;color:#fff">' +
        "<h3 style='color:#fff'>" + s.hook.text + "</h3>" +
        "<p style='color:#aab3cc'>" + s.sender.name + "</p>" +
        '<div class="bigbtn" style="background:#ffb020;color:#000">Act now!</div>' +
        '</div>';
    }
    $("#sg-feedback").textContent = "";
    $("#sg-feedback").className = "id-quiz-feedback";
  }

  function answer(isScamGuess) {
    if (!current) return;
    const correct = isScamGuess === current.isScam;
    if (correct) {
      score++;
      streak++;
      if (streak > bestStreak) bestStreak = streak;
      $("#sg-score").textContent = score;
      $("#sg-streak").textContent = streak;
      $("#sg-feedback").textContent = "✓ Correct! " + (current.isScam ? "This was a scam." : "This was safe.");
      $("#sg-feedback").className = "id-quiz-feedback good";
      if (typeof Sound !== "undefined") Sound.success();
    } else {
      streak = 0;
      $("#sg-streak").textContent = "0";
      $("#sg-feedback").textContent = "✗ Wrong. " + (current.isScam ? "This was actually a scam." : "This was actually safe.");
      $("#sg-feedback").className = "id-quiz-feedback bad";
      if (typeof Sound !== "undefined") Sound.error();
    }
    setTimeout(renderScenario, 1800);
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("#sg-scam").addEventListener("click", () => answer(true));
    $("#sg-safe").addEventListener("click", () => answer(false));
    const btn = document.createElement("button");
    btn.className = "btn btn-primary btn-big";
    btn.textContent = "Start generating";
    btn.addEventListener("click", () => { btn.style.display = "none"; renderScenario(); });
    document.querySelector("main").appendChild(btn);
  });
})();
