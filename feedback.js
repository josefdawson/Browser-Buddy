/* =========================================================
   Browser Buddy — Feedback system
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  function getFeedback() {
    try { return JSON.parse(localStorage.getItem("bb-feedback") || "[]"); } catch (e) { return []; }
  }
  function saveFeedback(list) {
    try { localStorage.setItem("bb-feedback", JSON.stringify(list)); } catch (e) {}
  }

  function showFeedbackModal() {
    const overlay = document.createElement("div");
    overlay.className = "ul-overlay";
    overlay.innerHTML = `
      <div class="ul-modal">
        <button class="ul-close" id="fb-close" aria-label="Close">×</button>
        <h2>Send Feedback 💬</h2>
        <div class="ul-version">We'd love to hear from you!</div>
        <label style="display:block;font-weight:600;margin:10px 0 4px;font-size:.9rem">Your name (optional)</label>
        <input type="text" id="fb-name" placeholder="Anonymous" class="cb-input" style="width:100%">
        <label style="display:block;font-weight:600;margin:10px 0 4px;font-size:.9rem">Your message</label>
        <textarea id="fb-msg" rows="4" placeholder="What do you think? Any bugs or suggestions?" class="cb-input" style="width:100%"></textarea>
        <div class="game-actions" style="margin-top:12px">
          <button class="btn btn-primary" id="fb-submit">Send feedback</button>
        </div>
        <p class="muted" id="fb-status" style="margin-top:8px"></p>
      </div>
    `;
    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector("#fb-close");
    closeBtn.style.pointerEvents = "auto";
    closeBtn.style.zIndex = "10";
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      overlay.remove();
    });
    overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector("#fb-submit").addEventListener("click", () => {
      const name = overlay.querySelector("#fb-name").value.trim() || "Anonymous";
      const msg = overlay.querySelector("#fb-msg").value.trim();
      const status = overlay.querySelector("#fb-status");
      if (!msg) { status.textContent = "Please write a message."; status.style.color = "var(--bad)"; return; }
      const list = getFeedback();
      list.push({ name, message: msg, date: new Date().toISOString(), page: location.pathname.split("/").pop() || "index.html" });
      saveFeedback(list);
      status.textContent = "✓ Thank you for your feedback!";
      status.style.color = "var(--good)";
      overlay.querySelector("#fb-msg").value = "";
      if (typeof Sound !== "undefined") Sound.success();
    });
  }

  // Add feedback link to topbar
  document.addEventListener("DOMContentLoaded", () => {
    const topbarRight = document.querySelector(".topbar-right");
    if (topbarRight && !document.querySelector(".feedback-link")) {
      const link = document.createElement("a");
      link.className = "settings-link feedback-link";
      link.href = "#";
      link.textContent = "💬 Feedback";
      link.addEventListener("click", (e) => { e.preventDefault(); showFeedbackModal(); });
      topbarRight.insertBefore(link, topbarRight.firstChild);
    }
  });
})();
