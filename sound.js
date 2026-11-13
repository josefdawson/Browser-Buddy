/* =========================================================
   Browser Buddy — Sound & Voice effects
   Uses Web Audio API (synthesized, no files) + Speech Synthesis.
   ========================================================= */
(function () {
  "use strict";

  const Sound = {
    enabled: true,
    voiceEnabled: false,
    volume: 0.8,
    ctx: null,

    init() {
      try {
        this.enabled = localStorage.getItem("bb-sound") !== "off";
        // Voice on by default for beginners
        this.voiceEnabled = localStorage.getItem("bb-voice") !== "off";
        const v = parseFloat(localStorage.getItem("bb-volume"));
        if (!isNaN(v)) this.volume = v;
      } catch (e) {}
      // lazy AudioContext
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) this.ctx = new Ctx();
      } catch (e) { this.ctx = null; }
    },

    ensureCtx() {
      if (!this.ctx) {
        try {
          const Ctx = window.AudioContext || window.webkitAudioContext;
          if (Ctx) this.ctx = new Ctx();
        } catch (e) {}
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    },

    setEnabled(on) {
      this.enabled = !!on;
      try { localStorage.setItem("bb-sound", on ? "on" : "off"); } catch (e) {}
    },
    setVoiceEnabled(on) {
      this.voiceEnabled = !!on;
      try { localStorage.setItem("bb-voice", on ? "on" : "off"); } catch (e) {}
    },
    setVolume(v) {
      this.volume = Math.max(0, Math.min(1, v));
      try { localStorage.setItem("bb-volume", String(this.volume)); } catch (e) {}
    },

    // ---------- Tone synthesis ----------
    tone(freq, duration, type = "sine", gain = 0.3, delay = 0) {
      const ctx = this.ensureCtx();
      if (!ctx || !this.enabled) return;
      const t0 = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(gain * this.volume, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + duration + 0.05);
    },

    // ---------- Named effects ----------
    test() {
      this.tone(523, 0.12, "sine", 0.3, 0);
      this.tone(659, 0.12, "sine", 0.3, 0.15);
      this.tone(784, 0.18, "sine", 0.35, 0.3);
      if (this.voiceEnabled) this.speak("Sound is working.");
    },
    click() { this.tone(660, 0.06, "square", 0.15); },
    tick() { this.tone(880, 0.04, "square", 0.1); },
    success() {
      this.tone(523, 0.12, "sine", 0.25, 0);
      this.tone(659, 0.12, "sine", 0.25, 0.12);
      this.tone(784, 0.18, "sine", 0.3, 0.24);
    },
    error() {
      this.tone(220, 0.15, "sawtooth", 0.2, 0);
      this.tone(180, 0.2, "sawtooth", 0.2, 0.12);
    },
    hint() {
      this.tone(880, 0.1, "sine", 0.2, 0);
      this.tone(1100, 0.12, "sine", 0.2, 0.1);
    },
    complete() {
      this.tone(523, 0.1, "sine", 0.25, 0);
      this.tone(659, 0.1, "sine", 0.25, 0.1);
      this.tone(784, 0.1, "sine", 0.25, 0.2);
      this.tone(1047, 0.25, "sine", 0.3, 0.3);
    },
    pop() {
      this.tone(400, 0.08, "triangle", 0.2, 0);
      this.tone(200, 0.1, "triangle", 0.15, 0.05);
    },
    fanfare() {
      this.tone(523, 0.12, "square", 0.2, 0);
      this.tone(659, 0.12, "square", 0.2, 0.12);
      this.tone(784, 0.12, "square", 0.2, 0.24);
      this.tone(1047, 0.3, "square", 0.25, 0.36);
    },

    // ---------- Voice ----------
    speak(text, opts = {}) {
      if (!this.voiceEnabled) return;
      if (!("speechSynthesis" in window)) return;
      try {
        // cancel previous
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = opts.rate || 0.95;
        u.pitch = opts.pitch || 1.0;
        u.volume = this.volume;
        // prefer a friendly voice
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find((v) => /female|samantha|zira|karen|victoria/i.test(v.name)) || voices.find((v) => v.lang.startsWith("en"));
        if (preferred) u.voice = preferred;
        window.speechSynthesis.speak(u);
      } catch (e) {}
    },
    stopSpeaking() {
      if ("speechSynthesis" in window) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }
    },

    // ---------- Visual effects ----------
    confetti(container) {
      const root = container || document.body;
      const colors = ["#3b5bfd", "#178a4c", "#ffb020", "#c93a3a", "#9b59b6"];
      for (let i = 0; i < 40; i++) {
        const piece = document.createElement("div");
        piece.className = "confetti-piece";
        piece.style.left = Math.random() * 100 + "%";
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 0.5 + "s";
        piece.style.animationDuration = 1.5 + Math.random() * 1.5 + "s";
        root.appendChild(piece);
        setTimeout(() => piece.remove(), 3500);
      }
    },
  };

  // Inject confetti CSS
  const style = document.createElement("style");
  style.textContent = `
    .confetti-piece {
      position: fixed; top: -10px; width: 8px; height: 14px;
      border-radius: 2px; pointer-events: none; z-index: 9999;
      animation: confetti-fall linear forwards;
    }
    @keyframes confetti-fall {
      0% { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  window.Sound = Sound;

  // Auto-init on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => Sound.init());
  } else {
    Sound.init();
  }

  // Unlock audio on first user interaction
  function unlock() {
    Sound.ensureCtx();
    document.removeEventListener("click", unlock, true);
    document.removeEventListener("keydown", unlock, true);
    document.removeEventListener("touchstart", unlock, true);
  }
  document.addEventListener("click", unlock, true);
  document.addEventListener("keydown", unlock, true);
  document.addEventListener("touchstart", unlock, true);
})();
