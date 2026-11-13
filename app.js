/* =========================================================
   Browser Buddy — shared helpers
   Progress, toast, hint ring, zero-jargon mode.
   ========================================================= */
(function () {
  const BB = {

    /* ---------- Progress (saved in the browser) ---------- */
    getProgress() {
      try {
        return JSON.parse(localStorage.getItem("bb-progress") || "[]");
      } catch (e) {
        return [];
      }
    },
    isDone(id) {
      return this.getProgress().includes(id);
    },
    completeMission(id) {
      try {
        const p = this.getProgress();
        if (!p.includes(id)) p.push(id);
        localStorage.setItem("bb-progress", JSON.stringify(p));
      } catch (e) {
        /* storage can be blocked (e.g. some file:// or private modes) */
      }
    },

    /* ---------- Toast (little pop-up messages) ---------- */
    toast(msg, type = "good", ms = 2600) {
      let t = document.getElementById("toast");
      if (!t) {
        t = document.createElement("div");
        t.id = "toast";
        document.body.appendChild(t);
      }
      t.textContent = msg;
      t.className = "show " + type;
      // sound
      if (typeof Sound !== "undefined") {
        if (type === "good") Sound.success();
        else if (type === "warn") Sound.error();
        else if (type === "info") Sound.click();
      }
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => { t.className = ""; }, ms);
    },

    /* ---------- Hint ring (pulsing circle around a button) ---------- */
    showHint(el, label) {
      if (!el) return;
      let ring = document.getElementById("hint-ring");
      if (!ring) {
        ring = document.createElement("div");
        ring.id = "hint-ring";
        ring.innerHTML = '<div class="hint-label"></div>';
        document.body.appendChild(ring);
      }
      ring.querySelector(".hint-label").textContent = label || "Click here";

      const place = () => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) { ring.style.display = "none"; return; }
        ring.style.display = "block";
        ring.style.left = (r.left - 6) + "px";
        ring.style.top = (r.top - 6) + "px";
        ring.style.width = (r.width + 12) + "px";
        ring.style.height = (r.height + 12) + "px";
      };

      this._hintPlace = place;
      place();
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      if (typeof Sound !== "undefined") {
        Sound.hint();
        const label = (label || "").replace(/^Click /i, "").replace(/^Tap /i, "");
        Sound.speak("Look for the highlighted button. " + (label ? "It's the one that says " + label + "." : "It's right there."));
      }

      if (!this._hintListenersOn) {
        this._hintListenersOn = true;
        window.addEventListener("scroll", () => { if (this._hintPlace) this._hintPlace(); }, true);
        window.addEventListener("resize", () => { if (this._hintPlace) this._hintPlace(); });
      }
    },
    hideHint() {
      const ring = document.getElementById("hint-ring");
      if (ring) ring.style.display = "none";
      this._hintPlace = null;
    },

    /* ---------- Zero-jargon mode ---------- */
    applyJargonMode() {
      let zero = false;
      try {
        zero = localStorage.getItem("bb-zero") === "1";
      } catch (e) {
        zero = false;
      }
      document.body.classList.toggle("zero-jargon", zero);
      document.querySelectorAll("[data-jargon]").forEach((el) => {
        el.textContent = zero ? el.dataset.plain : el.dataset.jargon;
      });
      const t = document.getElementById("jargon-toggle");
      if (t) t.checked = zero;
    },

    /* ---------- Header progress chip ---------- */
    renderProgressChip() {
      const chip = document.getElementById("progress-chip");
      if (!chip) return;
      const done = this.getProgress().length;
      chip.textContent = done + " mission" + (done === 1 ? "" : "s") + " done";
    },
  };

  window.BB = BB;

  document.addEventListener("DOMContentLoaded", () => {
    BB.applyJargonMode();
    BB.renderProgressChip();

    const t = document.getElementById("jargon-toggle");
    if (t) {
      t.addEventListener("change", () => {
        try {
          localStorage.setItem("bb-zero", t.checked ? "1" : "0");
        } catch (e) {
          /* storage can be blocked */
        }
        BB.applyJargonMode();
      });
    }
  });
})();
