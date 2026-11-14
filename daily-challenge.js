/* =========================================================
   Browser Buddy — Daily Tech Challenge
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  const SCENARIOS = [
    { type: "phishing", title: "Phishing email", desc: "You got an email: 'Your account will be closed in 24 hours. Click here to verify.' The sender is 'security@amaz0n-verify.com'.", question: "What should you do?", options: ["Click the link to verify", "Delete the email — it's a scam", "Reply asking if it's real"], correct: 1 },
    { type: "download", title: "Messy download page", desc: "A download page has 4 giant green 'DOWNLOAD NOW' buttons and one small plain link 'installer.exe (2 MB)'.", question: "Which do you click?", options: ["The biggest green button", "The small plain link", "All of them to be safe"], correct: 1 },
    { type: "cookie", title: "Cookie banner", desc: "A site shows 'Accept all' in bright green and 'Reject' in grey tiny text.", question: "What's the privacy-friendly choice?", options: ["Accept all", "Reject all", "Ignore the banner"], correct: 1 },
    { type: "permission", title: "Permission request", desc: "A calculator app asks for access to your Contacts.", question: "Allow or Block?", options: ["Allow — it might need it", "Block — calculators don't need contacts"], correct: 1 },
    { type: "scam", title: "Prize pop-up", desc: "A pop-up says 'You won an iPhone! Claim in 2 minutes.' with a countdown timer.", question: "What do you do?", options: ["Claim the prize quickly", "Close the page — it's a scam", "Enter your card details"], correct: 1 },
    { type: "zoom", title: "Broken zoom", desc: "A page loads with text at 30% zoom — too small to read.", question: "How do you fix it?", options: ["Press Ctrl+0", "Buy a bigger monitor", "Close the browser"], correct: 0 },
    { type: "tab", title: "Tab chaos", desc: "You have 10 tabs open and the browser is slow.", question: "What helps most?", options: ["Open more tabs", "Close tabs you're not using", "Restart the computer"], correct: 1 },
    { type: "password", title: "Weak password", desc: "Someone suggests using 'password123' for a new account.", question: "Is this safe?", options: ["Yes, it's easy to remember", "No, use a long unique password"], correct: 1 },
  ];

  // Seeded daily: pick scenario based on date
  function todayKey() {
    const d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }

  function dailyIndex() {
    const key = todayKey();
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    return hash % SCENARIOS.length;
  }

  function getStreak() {
    try { return parseInt(localStorage.getItem("bb-daily-streak") || "0", 10); } catch (e) { return 0; }
  }
  function setStreak(n) { try { localStorage.setItem("bb-daily-streak", String(n)); } catch (e) {} }
  function getLastDate() { try { return localStorage.getItem("bb-daily-last"); } catch (e) { return null; } }
  function setLastDate(d) { try { localStorage.setItem("bb-daily-last", d); } catch (e) {} }
  function isCompletedToday() { return getLastDate() === todayKey(); }

  let answered = false;

  function render() {
    const s = SCENARIOS[dailyIndex()];
    $("#dc-date").textContent = todayKey();
    $("#dc-streak").textContent = getStreak();
    // best streak
    let best = 0;
    try { best = parseInt(localStorage.getItem("bb-daily-best") || "0", 10); } catch (e) {}
    $("#dc-best").textContent = best;
    $("#dc-scenario").innerHTML = "<strong>" + s.title + "</strong><br><br>" + s.desc + "<br><br><strong>" + s.question + "</strong>";
    const area = $("#dc-area");
    area.innerHTML = "";
    s.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "btn btn-ghost";
      btn.style.width = "100%";
      btn.style.marginBottom = "8px";
      btn.style.textAlign = "left";
      btn.textContent = (i + 1) + ". " + opt;
      btn.addEventListener("click", () => answer(i, s));
      area.appendChild(btn);
    });
    $("#dc-submit").style.display = "none";
    if (isCompletedToday()) {
      $("#dc-scenario").innerHTML += '<br><br><span style="color:var(--good);font-weight:600">✓ Already completed today! Come back tomorrow.</span>';
      area.querySelectorAll("button").forEach((b) => (b.disabled = true));
    }
  }

  function answer(picked, s) {
    if (isCompletedToday()) return;
    const correct = picked === s.correct;
    if (correct) {
      if (typeof Sound !== "undefined") { Sound.success(); Sound.confetti(); }
      // update streak
      const last = getLastDate();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yKey = yesterday.getFullYear() + "-" + (yesterday.getMonth() + 1) + "-" + yesterday.getDate();
      let streak = getStreak();
      if (last === yKey) streak++;
      else if (last !== todayKey()) streak = 1;
      setStreak(streak);
      setLastDate(todayKey());
      let best = 0;
      try { best = parseInt(localStorage.getItem("bb-daily-best") || "0", 10); } catch (e) {}
      if (streak > best) { best = streak; try { localStorage.setItem("bb-daily-best", String(best)); } catch (e) {} }
      $("#dc-streak").textContent = streak;
      $("#dc-best").textContent = best;
      BB.toast("✓ Correct! Streak: " + streak, "good", 2000);
      $("#dc-scenario").innerHTML += '<br><br><span style="color:var(--good);font-weight:600">✓ Correct! ' + s.options[s.correct] + '</span>';
    } else {
      if (typeof Sound !== "undefined") Sound.error();
      BB.toast("Not quite. The answer was: " + s.options[s.correct], "warn", 2500);
      $("#dc-scenario").innerHTML += '<br><br><span style="color:var(--bad);font-weight:600">✗ The answer was: ' + s.options[s.correct] + '</span>';
    }
    $("#dc-area").querySelectorAll("button").forEach((b) => (b.disabled = true));
  }

  document.addEventListener("DOMContentLoaded", () => {
    render();
  });
})();
