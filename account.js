/* =========================================================
   Browser Buddy — Account System (save/load data)
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  function getAccounts() {
    try { return JSON.parse(localStorage.getItem("bb-accounts") || "{}"); } catch (e) { return {}; }
  }
  function saveAccounts(accts) {
    try { localStorage.setItem("bb-accounts", JSON.stringify(accts)); } catch (e) {}
  }
  function getCurrentUser() {
    try { return localStorage.getItem("bb-current-user"); } catch (e) { return null; }
  }
  function setCurrentUser(email) {
    try {
      if (email) localStorage.setItem("bb-current-user", email);
      else localStorage.removeItem("bb-current-user");
    } catch (e) {}
  }

  function getAllData() {
    const data = {};
    try {
      data.progress = JSON.parse(localStorage.getItem("bb-progress") || "[]");
      data.tutorials = JSON.parse(localStorage.getItem("bb-tutorials") || "[]");
      data.dailyStreak = localStorage.getItem("bb-daily-streak");
      data.dailyBest = localStorage.getItem("bb-daily-best");
      data.dailyLast = localStorage.getItem("bb-daily-last");
      data.certName = localStorage.getItem("bb-cert-name");
      data.theme = localStorage.getItem("bb-theme");
      data.cursor = localStorage.getItem("bb-cursor");
      data.zeroJargon = localStorage.getItem("bb-zero");
      data.sound = localStorage.getItem("bb-sound");
      data.voice = localStorage.getItem("bb-voice");
      data.volume = localStorage.getItem("bb-volume");
    } catch (e) {}
    return data;
  }

  function setAllData(data) {
    try {
      if (data.progress) localStorage.setItem("bb-progress", JSON.stringify(data.progress));
      if (data.tutorials) localStorage.setItem("bb-tutorials", JSON.stringify(data.tutorials));
      if (data.dailyStreak) localStorage.setItem("bb-daily-streak", data.dailyStreak);
      if (data.dailyBest) localStorage.setItem("bb-daily-best", data.dailyBest);
      if (data.dailyLast) localStorage.setItem("bb-daily-last", data.dailyLast);
      if (data.certName) localStorage.setItem("bb-cert-name", data.certName);
      if (data.theme) localStorage.setItem("bb-theme", data.theme);
      if (data.cursor) localStorage.setItem("bb-cursor", data.cursor);
      if (data.zeroJargon) localStorage.setItem("bb-zero", data.zeroJargon);
      if (data.sound) localStorage.setItem("bb-sound", data.sound);
      if (data.voice) localStorage.setItem("bb-voice", data.voice);
      if (data.volume) localStorage.setItem("bb-volume", data.volume);
    } catch (e) {}
  }

  let mode = "signup"; // or "login"

  function checkFirebaseRewards(email) {
    if (typeof Presence === "undefined" || !Presence.isConfigured()) return;
    if (typeof firebase === "undefined") return;
    try {
      if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      const db = firebase.database();
      const ref = db.ref("rewards/" + email.replace(/\\./g, "_"));
      ref.once("value", (snap) => {
        const data = snap.val();
        if (!data) return;
        let totalCoins = 0, totalXP = 0;
        Object.values(data).forEach((r) => {
          totalCoins += r.coins || 0;
          totalXP += r.xp || 0;
        });
        if (totalCoins > 0 || totalXP > 0) {
                    const msg = $("#acct-redeemmsg");
          if (msg) {
            msg.textContent = "✓ Received " + totalCoins + " coins and " + totalXP + " XP from admin!";
            msg.style.color = "var(--good)";
          }
          // Clear rewards after claiming
          ref.remove();
        }
      });
    } catch (e) {}
  }

  function updateUI() {
    const user = getCurrentUser();
    const form = $("#account-form");
    const logged = $("#account-logged");
    const tabs = $("#account-tabs");
    if (user) {
      form.style.display = "none";
      tabs.style.display = "none";
      logged.style.display = "block";
      $("#acct-user").textContent = user;
      const data = getAllData();
      $("#acct-info").textContent = "Missions: " + (data.progress ? data.progress.length : 0) + " · Lessons: " + (data.tutorials ? data.tutorials.length : 0);
      // Check for pending Firebase rewards
      checkFirebaseRewards(user);
    } else {
      form.style.display = "block";
      tabs.style.display = "flex";
      logged.style.display = "none";
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    updateUI();

    // Tab switching
    $("#tab-signup").addEventListener("click", () => {
      mode = "signup";
      $("#tab-signup").className = "btn btn-primary";
      $("#tab-login").className = "btn btn-ghost";
      $("#acct-btn").textContent = "Sign up";
      $("#acct-msg").textContent = "";
    });
    $("#tab-login").addEventListener("click", () => {
      mode = "login";
      $("#tab-login").className = "btn btn-primary";
      $("#tab-signup").className = "btn btn-ghost";
      $("#acct-btn").textContent = "Log in";
      $("#acct-msg").textContent = "";
    });

    // Submit
    $("#acct-btn").addEventListener("click", () => {
      const email = $("#acct-email").value.trim().toLowerCase();
      const pw = $("#acct-pw").value;
      const msg = $("#acct-msg");
      if (!email || !email.includes("@")) { msg.textContent = "Enter a valid email."; return; }
      if (pw.length < 4) { msg.textContent = "Password must be at least 4 characters."; return; }

      const accts = getAccounts();
      if (mode === "signup") {
        if (accts[email]) { msg.textContent = "Account already exists. Try logging in."; return; }
        accts[email] = { password: pw, created: new Date().toISOString() };
        saveAccounts(accts);
        setCurrentUser(email);
        if (typeof Sound !== "undefined") Sound.success();
        BB.toast("Account created!", "good");
        updateUI();
      } else {
        if (!accts[email]) { msg.textContent = "No account found. Sign up first."; return; }
        if (accts[email].password !== pw) { msg.textContent = "Incorrect password."; if (typeof Sound !== "undefined") Sound.error(); return; }
        setCurrentUser(email);
        if (typeof Sound !== "undefined") Sound.success();
        BB.toast("Welcome back!", "good");
        updateUI();
      }
    });

    $("#acct-pw").addEventListener("keydown", (e) => {
      if (e.key === "Enter") $("#acct-btn").click();
    });

    // Logout
    $("#acct-logout").addEventListener("click", () => {
      setCurrentUser(null);
      updateUI();
      BB.toast("Logged out.", "info");
    });

    // Save data (download JSON)
    $("#acct-savedata").addEventListener("click", () => {
      const data = getAllData();
      data.exportedAt = new Date().toISOString();
      data.user = getCurrentUser();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "browser-buddy-data.json";
      a.click();
      URL.revokeObjectURL(url);
      BB.toast("Data downloaded!", "good");
    });

    // Load data (upload JSON)
    $("#acct-loaddata").addEventListener("click", () => {
      $("#acct-file").click();
    });
    $("#acct-file").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          setAllData(data);
          BB.toast("Data loaded! Refreshing...", "good");
          setTimeout(() => location.reload(), 1000);
        } catch (err) {
          BB.toast("Invalid file.", "bad");
        }
      };
      reader.readAsText(file);
    });

    // Redeem reward code
    $("#acct-redeembtn").addEventListener("click", () => {
      const code = $("#acct-redeem").value.trim();
      const msg = $("#acct-redeemmsg");
      if (!code) { msg.textContent = "Paste a code first."; msg.style.color = "var(--bad)"; return; }
      // Check if already redeemed
      let redeemed = [];
      try { redeemed = JSON.parse(localStorage.getItem("bb-redeemed") || "[]"); } catch (e) {}
      if (redeemed.includes(code)) {
        msg.textContent = "This code has already been redeemed.";
        msg.style.color = "var(--bad)";
        if (typeof Sound !== "undefined") Sound.error();
        return;
      }
      try {
        const data = JSON.parse(decodeURIComponent(escape(atob(code))));
        const user = getCurrentUser();
        if (user && data.email && data.email.toLowerCase() !== user) {
          msg.textContent = "This code is for " + data.email + ", not " + user + ".";
          msg.style.color = "var(--bad)";
          return;
        }
                // Mark as redeemed
        redeemed.push(code);
        try { localStorage.setItem("bb-redeemed", JSON.stringify(redeemed)); } catch (e) {}
        msg.textContent = "Redeemed! +" + (data.coins || 0) + " coins, +" + (data.xp || 0) + " XP";
        msg.style.color = "var(--good)";
        $("#acct-redeem").value = "";
        if (typeof Sound !== "undefined") Sound.complete();
      } catch (err) {
        msg.textContent = "Invalid code.";
        msg.style.color = "var(--bad)";
      }
    });
  });
})();
