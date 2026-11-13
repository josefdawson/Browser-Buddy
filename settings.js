/* =========================================================
   Browser Buddy — Settings page
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  function updateProgressInfo() {
    const info = $("#set-progress-info");
    if (!info) return;
    let done = 0;
    try { done = JSON.parse(localStorage.getItem("bb-progress") || "[]").length; } catch (e) { done = 0; }
    info.textContent = done + " mission" + (done === 1 ? "" : "s") + " completed so far.";
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Sound settings
    const soundToggle = $("#set-sound");
    const voiceToggle = $("#set-voice");
    const volumeSlider = $("#set-volume");

    function syncSound() {
      if (soundToggle) soundToggle.checked = (typeof Sound !== "undefined") ? Sound.enabled : true;
      if (voiceToggle) voiceToggle.checked = (typeof Sound !== "undefined") ? Sound.voiceEnabled : false;
      if (volumeSlider && typeof Sound !== "undefined") volumeSlider.value = Sound.volume;
    }
    syncSound();

    if (soundToggle) {
      soundToggle.addEventListener("change", () => {
        if (typeof Sound !== "undefined") Sound.setEnabled(soundToggle.checked);
      });
    }
    if (voiceToggle) {
      voiceToggle.addEventListener("change", () => {
        if (typeof Sound !== "undefined") Sound.setVoiceEnabled(voiceToggle.checked);
      });
    }
    if (volumeSlider) {
      volumeSlider.addEventListener("input", () => {
        if (typeof Sound !== "undefined") Sound.setVolume(parseFloat(volumeSlider.value));
      });
    }
    const testBtn = $("#set-testsound");
    if (testBtn) {
      testBtn.addEventListener("click", () => {
        if (typeof Sound !== "undefined") Sound.test();
      });
    }

    // sync jargon toggle
    const t = $("#set-jargon");
    const mainToggle = $("#jargon-toggle");
    function sync() {
      let zero = false;
      try { zero = localStorage.getItem("bb-zero") === "1"; } catch (e) {}
      if (t) t.checked = zero;
    }
    sync();
    if (t) {
      t.addEventListener("change", () => {
        try { localStorage.setItem("bb-zero", t.checked ? "1" : "0"); } catch (e) {}
        if (mainToggle) mainToggle.checked = t.checked;
        mainToggle && mainToggle.dispatchEvent(new Event("change"));
        // apply mode
        document.body.classList.toggle("zero-jargon", t.checked);
        document.querySelectorAll("[data-jargon]").forEach((el) => {
          el.textContent = t.checked ? el.dataset.plain : el.dataset.jargon;
        });
      });
    }

    updateProgressInfo();

    $("#set-reset").addEventListener("click", () => {
      if (!confirm("Reset all progress? This cannot be undone.")) return;
      try {
        localStorage.removeItem("bb-progress");
        localStorage.removeItem("bb-tutorials");
      } catch (e) {}
      updateProgressInfo();
      BB.toast("Progress reset.", "info", 2000);
    });
  });
})();
