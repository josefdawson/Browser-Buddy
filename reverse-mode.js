/* =========================================================
   Browser Buddy — Reverse Mode (Be the Scammer)
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  let elements = [];
  let selected = null;
  let dragOffset = { x: 0, y: 0 };

  function render() {
    const canvas = $("#rm-canvas");
    canvas.innerHTML = "";
    if (elements.length === 0) {
      canvas.innerHTML = '<p style="color:var(--muted);font-size:.9rem">Your fake download page. Add elements above.</p>';
      return;
    }
    elements.forEach((el, i) => {
      const div = document.createElement("div");
      div.className = "rm-element " + el.type;
      div.style.left = el.x + "px";
      div.style.top = el.y + "px";
      div.textContent = el.label;
      div.dataset.idx = i;
      if (el.type === "fake") {
        div.title = "Trap! Clicking this spawns more pop-ups.";
      }
      div.addEventListener("mousedown", (e) => {
        selected = i;
        const rect = canvas.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left - el.x;
        dragOffset.y = e.clientY - rect.top - el.y;
        div.style.zIndex = "100";
      });
      canvas.appendChild(div);
    });
  }

  document.addEventListener("mousemove", (e) => {
    if (selected === null) return;
    const canvas = $("#rm-canvas");
    const rect = canvas.getBoundingClientRect();
    const el = elements[selected];
    el.x = Math.max(0, Math.min(rect.width - 100, e.clientX - rect.left - dragOffset.x));
    el.y = Math.max(0, Math.min(rect.height - 40, e.clientY - rect.top - dragOffset.y));
    const div = canvas.querySelector('[data-idx="' + selected + '"]');
    if (div) { div.style.left = el.x + "px"; div.style.top = el.y + "px"; }
  });

  document.addEventListener("mouseup", () => {
    if (selected !== null) {
      const canvas = $("#rm-canvas");
      const div = canvas.querySelector('[data-idx="' + selected + '"]');
      if (div) div.style.zIndex = "";
      selected = null;
    }
  });

  function addReal() {
    const canvas = $("#rm-canvas");
    elements.push({ type: "real", label: "Download file.pdf", x: 50 + Math.random() * 100, y: 50 + Math.random() * 100 });
    render();
  }

  function addFake() {
    const labels = ["DOWNLOAD NOW!", "GET IT FREE", "CLICK HERE", "START DOWNLOAD"];
    elements.push({ type: "fake", label: labels[Math.floor(Math.random() * labels.length)], x: 50 + Math.random() * 200, y: 50 + Math.random() * 150 });
    render();
  }

  function addPopup() {
    elements.push({ type: "fake", label: "You won! (fake pop-up)", x: 100 + Math.random() * 150, y: 30 + Math.random() * 100 });
    render();
  }

  function addCookie() {
    elements.push({ type: "fake", label: "Cookie banner (Accept all)", x: 20 + Math.random() * 50, y: 200 + Math.random() * 50 });
    render();
  }

  function addPerm() {
    elements.push({ type: "fake", label: "Allow notifications? (Allow)", x: 250 + Math.random() * 100, y: 80 + Math.random() * 80 });
    render();
  }

  function addScam() {
    elements.push({ type: "fake", label: "You won a prize! (scam email)", x: 60 + Math.random() * 120, y: 120 + Math.random() * 80 });
    render();
  }

  function clearAll() {
    elements = [];
    render();
    const bot = $("#rm-bot");
    if (bot) bot.style.display = "none";
    const over = $("#rm-over");
    if (over) over.style.display = "none";
  }

  function runBot() {
    const bot = $("#rm-bot");
    const log = $("#rm-botlog");
    if (!bot || !log) return;
    bot.style.display = "block";
    log.innerHTML = "";
    const realBtns = elements.filter((e) => e.type === "real");
    const fakeBtns = elements.filter((e) => e.type === "fake");

    function logLine(text) {
      const div = document.createElement("div");
      div.className = "bot-action";
      div.textContent = text;
      log.appendChild(div);
    }

    logLine("Bot started. Scanning page...");
    setTimeout(() => {
      logLine("Found " + elements.length + " elements (" + realBtns.length + " real, " + fakeBtns.length + " fake).");
    }, 400);
    setTimeout(() => {
      if (fakeBtns.length === 0) {
        logLine("No traps found. Bot easily found the real download.");
        logLine("Result: Too easy! Add some fake buttons.");
      } else if (fakeBtns.length > realBtns.length * 2) {
        logLine("Bot is overwhelmed by fake buttons...");
        logLine("Bot clicked a FAKE button!");
        logLine("Result: Bot fell for the trap! Very tricky design.");
      } else if (fakeBtns.length > realBtns.length) {
        logLine("Bot hesitates between real and fake...");
        logLine("Bot clicked a FAKE button!");
        logLine("Result: Bot fell for the trap. Good design!");
      } else {
        logLine("Bot carefully checked each button.");
        logLine("Bot found the real download link.");
        logLine("Result: Bot avoided traps. Try more fakes!");
      }
      const trapScore = Math.min(100, fakeBtns.length * 10 + (fakeBtns.length > realBtns.length ? 30 : 0));
      logLine("Trap score: " + trapScore + "/100");
      if (typeof Sound !== "undefined") Sound.complete();
    }, 1200);
  }

  // Event delegation for buttons
  document.addEventListener("click", (e) => {
    const id = e.target && e.target.id;
    if (id === "rm-addreal") addReal();
    if (id === "rm-addfake") addFake();
    if (id === "rm-addpopup") addPopup();
    if (id === "rm-addcookie") addCookie();
    if (id === "rm-addperm") addPerm();
    if (id === "rm-addscam") addScam();
    if (id === "rm-clear") clearAll();
    if (id === "rm-test") runBot();
  });

  // Expose globally
  window.addReal = addReal;
  window.addFake = addFake;
  window.addPopup = addPopup;
  window.addCookie = addCookie;
  window.addPerm = addPerm;
  window.addScam = addScam;
  window.clearAll = clearAll;
  window.testBot = runBot;

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector("#rm-startbtn");
    if (btn) btn.addEventListener("click", () => { btn.style.display = "none"; });
  });
})();
