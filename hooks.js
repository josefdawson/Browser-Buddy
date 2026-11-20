/* =========================================================
   Browser Buddy — Engagement Hooks (no coins/levels)
   Daily streaks, sharing, email capture, pet hunger
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  /* ---------- Daily login streak ---------- */
  function getLoginStreak() {
    try {
      const data = JSON.parse(localStorage.getItem("bb-login") || "{}");
      return data;
    } catch (e) { return {}; }
  }
  function updateLoginStreak() {
    const today = new Date().toDateString();
    let data = getLoginStreak();
    if (data.lastDate === today) return data; // already visited today
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (data.lastDate === yesterday.toDateString()) {
      data.streak = (data.streak || 0) + 1;
    } else if (data.lastDate !== today) {
      data.streak = 1; // reset
    }
    data.lastDate = today;
    data.totalVisits = (data.totalVisits || 0) + 1;
    try { localStorage.setItem("bb-login", JSON.stringify(data)); } catch (e) {}
    return data;
  }

  /* ---------- Share score ---------- */
  function shareScore(game, score, total) {
    const text = "I scored " + score + "/" + total + " on " + game + " in Browser Buddy! Can you beat me? " + window.location.origin + window.location.pathname;
    if (navigator.share) {
      navigator.share({ title: "Browser Buddy Score", text: text, url: window.location.href }).catch(() => {});
    } else {
      // Fallback: copy to clipboard
      try {
        navigator.clipboard.writeText(text).then(() => {
          if (typeof BB !== "undefined") BB.toast("Score copied to clipboard! Share it with friends.", "good", 3000);
        }).catch(() => {
          const ta = document.createElement("textarea");
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          ta.remove();
          if (typeof BB !== "undefined") BB.toast("Score copied to clipboard!", "good", 3000);
        });
      } catch (e) {
        if (typeof BB !== "undefined") BB.toast("Share: " + text, "info", 5000);
      }
    }
  }
  window.shareScore = shareScore;

  /* ---------- Email capture ---------- */
  function showEmailCapture() {
    if (localStorage.getItem("bb-email-captured") === "1") return;
    const overlay = document.createElement("div");
    overlay.className = "ul-overlay";
    overlay.innerHTML = `
      <div class="ul-modal">
        <button class="ul-close" id="ec-close">×</button>
        <h2>Stay Updated 📬</h2>
        <div class="ul-version">Get notified about new games and features</div>
        <p style="color:var(--muted);font-size:.9rem;margin:10px 0">Enter your email to receive updates about new games, tips, and features. No spam, ever.</p>
        <input type="email" id="ec-email" placeholder="you@example.com" class="cb-input" style="width:100%;margin:8px 0">
        <div class="game-actions" style="margin-top:10px">
          <button class="btn btn-primary" id="ec-submit">Subscribe</button>
          <button class="btn btn-ghost" id="ec-skip">No thanks</button>
        </div>
        <p class="muted" id="ec-msg" style="margin-top:8px"></p>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector("#ec-close").addEventListener("click", () => overlay.remove());
    overlay.querySelector("#ec-skip").addEventListener("click", () => { overlay.remove(); try { localStorage.setItem("bb-email-captured", "1"); } catch (e) {} });
    overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector("#ec-submit").addEventListener("click", () => {
      const email = overlay.querySelector("#ec-email").value.trim();
      const msg = overlay.querySelector("#ec-msg");
      if (!email || !email.includes("@")) { msg.textContent = "Enter a valid email."; msg.style.color = "var(--bad)"; return; }
      // Store locally (in real app, send to backend)
      let emails = [];
      try { emails = JSON.parse(localStorage.getItem("bb-emails") || "[]"); } catch (e) {}
      if (!emails.includes(email)) emails.push(email);
      try { localStorage.setItem("bb-emails", JSON.stringify(emails)); } catch (e) {}
      try { localStorage.setItem("bb-email-captured", "1"); } catch (e) {}
      msg.textContent = "✓ Subscribed! We'll keep you updated.";
      msg.style.color = "var(--good)";
      if (typeof Sound !== "undefined") Sound.success();
      setTimeout(() => overlay.remove(), 2000);
    });
  }

  /* ---------- Daily login streak display ---------- */
  function showLoginStreak() {
    const data = updateLoginStreak();
    if (data.streak > 1) {
      if (typeof BB !== "undefined") {
        BB.toast("🔥 " + data.streak + "-day streak! Keep it going!", "good", 3000);
      }
    }
  }

  /* ---------- Pet hunger timer ---------- */
  function checkPetHunger() {
    // Show a reminder if pet is hungry
    try {
      const pet = JSON.parse(localStorage.getItem("bb-pet") || "null");
      if (pet) {
        const avg = (pet.hunger + pet.happiness + pet.energy) / 3;
        if (avg < 40) {
          setTimeout(() => {
            if (typeof BB !== "undefined") BB.toast("🐾 Your pet is hungry! Visit Browser Pet to feed it.", "info", 4000);
          }, 3000);
        }
      }
    } catch (e) {}
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    showLoginStreak();
    checkPetHunger();
    // Show email capture after 30 seconds
    setTimeout(showEmailCapture, 30000);
  });
})();
