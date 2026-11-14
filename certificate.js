/* =========================================================
   Browser Buddy — Printable Certificate
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  function getProgress() { try { return JSON.parse(localStorage.getItem("bb-progress") || "[]"); } catch (e) { return []; } }

  document.addEventListener("DOMContentLoaded", () => {
    const nameInput = $("#cert-nameinput");
    const nameEl = $("#cert-name");
    const dateEl = $("#cert-date");
    const status = $("#cert-status");

    // Load saved name
    try {
      const saved = localStorage.getItem("bb-cert-name");
      if (saved) { nameEl.textContent = saved; nameInput.value = saved; }
    } catch (e) {}
    dateEl.textContent = "Awarded on " + new Date().toLocaleDateString();

    const progress = getProgress();
    const pct = Math.round((progress.length / 17) * 100);
    if (pct < 100) {
      status.textContent = "Complete " + (17 - progress.length) + " more mission" + (17 - progress.length === 1 ? "" : "s") + " to earn your certificate. (" + pct + "% done)";
    } else {
      status.textContent = "🎉 Congratulations! You've completed all missions. Print your certificate!";
      if (typeof Sound !== "undefined") { Sound.complete(); Sound.confetti(); }
    }

    $("#cert-update").addEventListener("click", () => {
      const name = nameInput.value.trim() || "Tech Hero";
      nameEl.textContent = name;
      try { localStorage.setItem("bb-cert-name", name); } catch (e) {}
      BB.toast("Name updated!", "good");
    });

    $("#cert-print").addEventListener("click", () => {
      window.print();
    });
  });
})();
