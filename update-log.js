/* =========================================================
   Browser Buddy — Update Log (shows on every visit)
   ========================================================= */
(function () {
  "use strict";

  const STORAGE_KEY = "bb-update-log-dismissed";

  function isDismissed() {
    try { return localStorage.getItem(STORAGE_KEY) === "1"; } catch (e) { return false; }
  }

  function setDismissed() {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch (e) {}
  }

  function showUpdateLog() {
    // Only show on the home page
    const page = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (page !== "index.html" && page !== "") return;
    if (isDismissed()) return;

    const overlay = document.createElement("div");
    overlay.className = "ul-overlay";
    overlay.innerHTML = `
      <div class="ul-modal">
        <button class="ul-close" id="ul-close" aria-label="Close">×</button>
        <h2>What's New in Browser Buddy</h2>
        <div class="ul-version">Version 1.1 beta — Updated</div>
        <ul>
          <li>📅 <strong>Daily Tech Challenge</strong> — one new scenario every day. Build your streak!</li>
          <li>🏆 <strong>Trophy Room</strong> — track lifetime stats and earn 8 achievement badges.</li>
          <li>📜 <strong>Certificate</strong> — earn a printable certificate when you finish 100%.</li>
          <li>🔐 <strong>Account System</strong> — sign up, save data, and transfer progress between devices.</li>
          <li>⚙️ <strong>Settings Page</strong> — themes (dark/retro/neon), custom cursors, sound/voice toggles.</li>
          <li>🛡️ <strong>Admin Panel</strong> — manage bans, view live users, generate reward codes.</li>
          <li>📧 <strong>Chat & Phone Apps</strong> — new pretend apps in the simulator with 6 new missions.</li>
          <li>🧩 <strong>Click-Through Builder</strong> — create lessons from screenshots with export/import and templates.</li>
          <li>🦠 <strong>Mystery Virus Clean-Up</strong> — a new broken computer every round with real apps and windows.</li>
          <li>🌀 <strong>Roguelike Chaos Mode</strong> — endless waves with upgrades and curses.</li>
          <li>🎲 <strong>Scam Generator</strong> — procedurally generated scam emails and pop-ups.</li>
          <li>📞 <strong>Tech Support Career Mode</strong> — fix broken screens before patience runs out.</li>
          <li>🎭 <strong>Reverse Mode</strong> — design tricky pages and watch a bot navigate them.</li>
          <li>🐾 <strong>Browser Pet</strong> — adopt a pixel pet, feed and care for it.</li>
          <li>🎉 <strong>Party Mode</strong> — 2-player pass-and-play speedrun battles.</li>
          <li>🎨 <strong>100x Cooler UI</strong> — glassmorphism, gradients, animations, emoji font fixes.</li>
        </ul>
        <label class="ul-dontshow">
          <input type="checkbox" id="ul-dontshow">
          Don't show me this again
        </label>
      </div>
    </div>`;

    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector("#ul-close");
    const dontShow = overlay.querySelector("#ul-dontshow");

    function close() {
      // Always dismiss permanently (whether checkbox is checked or not)
      setDismissed();
      overlay.remove();
    }

    closeBtn.style.pointerEvents = "auto";
    closeBtn.style.zIndex = "10";
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      close();
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    dontShow.addEventListener("change", () => {
      if (dontShow.checked) setDismissed();
    });
  }

  // Show on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showUpdateLog);
  } else {
    showUpdateLog();
  }
})();
