/* =========================================================
   Browser Buddy — Admin Panel
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  // Auth check
  let isAdmin = false;
  try { isAdmin = sessionStorage.getItem("bb-admin") === "1"; } catch (e) {}
  if (!isAdmin) {
    window.location.href = "login.html";
    return;
  }

  /* ---------- Banned emails ---------- */
  function getBanned() {
    try { return JSON.parse(localStorage.getItem("bb-banned") || "[]"); } catch (e) { return []; }
  }
  function saveBanned(list) {
    try { localStorage.setItem("bb-banned", JSON.stringify(list)); } catch (e) {}
  }

  function renderBanned() {
    const list = getBanned();
    const el = $("#admin-banlist");
    if (list.length === 0) { el.innerHTML = '<p class="muted">No banned emails.</p>'; return; }
    el.innerHTML = list.map((e) => '<div class="admin-item"><span>' + e + '</span><button class="remove" data-email="' + e + '">✕</button></div>').join("");
    el.querySelectorAll("[data-email]").forEach((b) => {
      b.addEventListener("click", () => {
        const newList = getBanned().filter((x) => x !== b.dataset.email);
        saveBanned(newList);
        renderBanned();
        BB.toast("Unbanned.", "info");
      });
    });
  }

  /* ---------- Live users (real via Firebase) ---------- */
  let liveUsers = [];
  let presenceConfigured = (typeof Presence !== "undefined") ? Presence.isConfigured() : false;

  function initLiveUsers() {
    const setupCard = $("#admin-setup");
    if (presenceConfigured && typeof Presence !== "undefined") {
      if (setupCard) setupCard.style.display = "none";
      Presence.readLive((users) => {
        if (users) {
          liveUsers = users;
          renderLive();
          renderStats();
        } else {
          // Firebase not configured — show setup message
          $("#admin-livelist").innerHTML = '<p class="muted">Firebase not configured. See setup instructions below.</p>';
        }
      });
    } else {
      $("#admin-livelist").innerHTML = '<p class="muted">Firebase not configured. Edit presence.js with your Firebase config to enable real tracking.</p>';
      if (setupCard) setupCard.style.display = "block";
    }
  }

  function renderLive() {
    $("#admin-livecount").textContent = liveUsers.length;
    const el = $("#admin-livelist");
    if (liveUsers.length === 0) { el.innerHTML = '<p class="muted">No one online right now.</p>'; return; }
    el.innerHTML = liveUsers.map((u) => {
      const since = u.since ? new Date(u.since).toLocaleTimeString() : "just now";
      return '<div class="admin-item"><span>🟢 ' + u.id.slice(0, 12) + '</span><span style="color:var(--muted);font-size:.85rem">' + u.page + " · since " + since + "</span></div>";
    }).join("");
  }

  /* ---------- Stats ---------- */
  function renderStats() {
    const banned = getBanned();
    const progress = (function () { try { return JSON.parse(localStorage.getItem("bb-progress") || "[]"); } catch (e) { return []; } })();
    const tutorials = (function () { try { return JSON.parse(localStorage.getItem("bb-tutorials") || "[]"); } catch (e) { return []; } })();
    $("#admin-stats").innerHTML =
      '<div class="admin-stat"><span>Total banned emails</span><strong>' + banned.length + "</strong></div>" +
      '<div class="admin-stat"><span>Missions completed (this device)</span><strong>' + progress.length + "</strong></div>" +
      '<div class="admin-stat"><span>Saved lessons (this device)</span><strong>' + tutorials.length + "</strong></div>" +
      '<div class="admin-stat"><span>Live users (simulated)</span><strong>' + liveUsers.length + "</strong></div>";
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    initLiveUsers();
    renderBanned();
    renderLive();
    renderStats();

    // Refresh stats every 10s (live users update via Firebase callback)
    setInterval(() => { renderStats(); }, 10000);

    $("#admin-banbtn").addEventListener("click", () => {
      const email = $("#admin-baninput").value.trim().toLowerCase();
      if (!email || !email.includes("@")) { BB.toast("Enter a valid email.", "warn"); return; }
      const list = getBanned();
      if (list.includes(email)) { BB.toast("Already banned.", "warn"); return; }
      list.push(email);
      saveBanned(list);
      $("#admin-baninput").value = "";
      renderBanned();
      renderStats();
      BB.toast("Banned " + email, "good");
    });

    $("#admin-logout").addEventListener("click", () => {
      try { sessionStorage.removeItem("bb-admin"); } catch (e) {}
      window.location.href = "index.html";
    });

    // Give reward
    $("#admin-rewardbtn").addEventListener("click", () => {
      const email = $("#admin-reward-email").value.trim().toLowerCase();
      const coins = parseInt($("#admin-reward-coins").value, 10) || 0;
      const xp = parseInt($("#admin-reward-xp").value, 10) || 0;
      if (!email || !email.includes("@")) { BB.toast("Enter a valid email.", "warn"); return; }
      if (coins <= 0 && xp <= 0) { BB.toast("Enter coins or XP.", "warn"); return; }
      // Generate a redeem code (base64 encoded JSON)
      const reward = { email, coins, xp, created: Date.now() };
      const code = btoa(unescape(encodeURIComponent(JSON.stringify(reward))));
      const codeEl = $("#admin-rewardcode");
      codeEl.style.display = "block";
      codeEl.textContent = code;
      BB.toast("Reward code generated!", "good");
      // Also store in Firebase if configured
      if (typeof Presence !== "undefined" && Presence.isConfigured()) {
        try {
          if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
          firebase.database().ref("rewards/" + email.replace(/\./g, "_")).push(reward);
        } catch (e) {}
      }
    });
  });
})();
