/* =========================================================
   Browser Buddy — home page progress bars
   ========================================================= */
(function () {
  function render() {
    const done = BB.getProgress();
    document.querySelectorAll("[data-module]").forEach((card) => {
      const total = parseInt(card.dataset.total || "0", 10);
      const fill = card.querySelector(".progress-fill");
      const label = card.querySelector(".progress-label");
      if (!fill) return;

      if (total === 0) {
        fill.style.width = "0%";
        if (label) label.textContent = "Coming soon";
        return;
      }

      const prefix = card.dataset.module + "-";
      const count = done.filter((id) => id.startsWith(prefix)).length;
      const pct = Math.round((count / total) * 100);
      fill.style.width = pct + "%";
      if (label) label.textContent = count + " / " + total + " missions done";
    });
  }

  document.addEventListener("DOMContentLoaded", render);
})();
