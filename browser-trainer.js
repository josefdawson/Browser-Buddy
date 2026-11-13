/* =========================================================
   Browser Buddy — Browser Survival Trainer
   ========================================================= */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Browser state ---------- */
  let tabs = [{ id: 1, title: "Grandma's Recipes", page: "home", url: "recipes.example.com", history: ["home"], hi: 0 }];
  let active = 1;
  let zoom = 1;
  let nextId = 2;
  let scenario = null;
  let popupOpen = false;
  let popupClosedCorrectly = false;
  let downloaded = false;
  let permissionResolved = null; // 'block' | 'allow'
  let tabClosedCorrectly = false;

  const PAGES = {
    home: "<h1>Grandma's Recipes</h1><p>Welcome! Pick a recipe.</p><div class='fake-links'><button class='fake-link' data-btlink='pie'>🥧 Apple Pie</button><button class='fake-link' data-btlink='soup'>🍲 Chicken Soup</button></div>",
    pie: "<h1>Apple Pie</h1><p>Ingredients: apples, sugar, cinnamon.</p><button class='fake-link' data-btlink='home'>← Back to recipes</button>",
    soup: "<h1>Chicken Soup</h1><p>Ingredients: chicken, carrots, noodles.</p><button class='fake-link' data-btlink='home'>← Back to recipes</button>",
  };

  function activeTab() { return tabs.find((t) => t.id === active) || tabs[0]; }

  function renderTabs() {
    const bar = $("#bt-tabs");
    bar.innerHTML = "";
    tabs.forEach((t) => {
      const el = document.createElement("div");
      el.className = "browser-tab" + (t.id === active ? " active" : "");
      el.innerHTML = '<span class="tab-title">' + t.title + '</span><button class="tab-close" data-tabid="' + t.id + '" title="Close tab">×</button>';
      el.addEventListener("click", (e) => {
        if (e.target.classList.contains("tab-close")) return;
        active = t.id;
        render();
      });
      el.querySelector(".tab-close").addEventListener("click", (e) => {
        e.stopPropagation();
        if (tabs.length <= 1) { BB.toast("You need at least one tab open.", "warn"); return; }
        const wasActive = active === t.id;
        tabs = tabs.filter((x) => x.id !== t.id);
        if (wasActive) active = tabs[Math.max(0, tabs.length - 1)].id;
        tabClosedCorrectly = (tabs.length === 1 && active === 1);
        render();
        checkScenario();
      });
      bar.appendChild(el);
    });
    const add = document.createElement("button");
    add.className = "browser-newtab";
    add.textContent = "＋";
    add.title = "Open a new tab";
    add.addEventListener("click", () => {
      const t = { id: nextId++, title: "New Tab", page: "home", url: "new-tab", history: ["home"], hi: 0 };
      tabs.push(t);
      active = t.id;
      render();
      checkScenario();
    });
    bar.appendChild(add);
  }

  function render() {
    renderTabs();
    const t = activeTab();
    $("#bt-address").value = t.url;
    $("#bt-zoom").textContent = Math.round(zoom * 100) + "%";
    const content = $("#bt-content");
    let html = PAGES[t.page] || "<p>Page not found.</p>";
    if (t.page === "home" && scenario && scenario.id === "download") {
      html += '<div style="margin-top:16px"><button class="fake-link" data-bt="download">⬇ Download guide.pdf</button></div>';
    }
    content.innerHTML = html;
    content.style.fontSize = Math.round(zoom * 100) + "%";

    // pop-up
    const existing = content.querySelector(".bt-popup");
    if (popupOpen) {
      const pop = document.createElement("div");
      pop.className = "bt-popup";
      pop.innerHTML =
        '<div class="bt-popup-box">' +
        '<button class="bt-popup-fakeclose" data-bt="fakeclose">Close ✕</button>' +
        '<button class="bt-popup-realclose" data-bt="realclose" title="Close">×</button>' +
        "<h3>🎉 You won a prize!</h3>" +
        "<p>Click here to claim your reward now.</p>" +
        '<div class="bt-popup-actions"><button data-bt="claim">Claim prize</button></div>' +
        "</div>";
      content.appendChild(pop);
      pop.querySelector('[data-bt="fakeclose"]').addEventListener("click", () => {
        BB.toast("That button was an ad! Try the small red ×.", "warn");
      });
      pop.querySelector('[data-bt="claim"]').addEventListener("click", () => {
        BB.toast("That's a scam button. Try closing the pop-up.", "warn");
      });
      pop.querySelector('[data-bt="realclose"]').addEventListener("click", () => {
        popupOpen = false;
        popupClosedCorrectly = true;
        render();
        checkScenario();
      });
    }

    // permission prompt
    if (permissionResolved === null && scenario && scenario.id === "permission") {
      // show permission prompt
      if (!content.querySelector(".bt-perm")) {
        const perm = document.createElement("div");
        perm.className = "bt-perm";
        perm.innerHTML =
          "<h4>example-news.com wants to</h4><p>Show notifications</p>" +
          '<div class="bt-perm-actions"><button data-bt="allow">Allow</button><button class="block" data-bt="block">Block</button></div>';
        content.appendChild(perm);
        perm.querySelector('[data-bt="allow"]').addEventListener("click", () => {
          permissionResolved = "allow";
          perm.remove();
          BB.toast("Notifications allowed (not the safest).", "warn");
          checkScenario();
        });
        perm.querySelector('[data-bt="block"]').addEventListener("click", () => {
          permissionResolved = "block";
          perm.remove();
          BB.toast("Blocked. Good!", "good");
          checkScenario();
        });
      }
    }

    // download notification
    if (downloaded && !content.querySelector(".bt-dl-note")) {
      const note = document.createElement("div");
      note.className = "bt-dl-note";
      note.textContent = "⬇ Downloaded: guide.pdf";
      content.appendChild(note);
    }

    // bind links
    $$("[data-btlink]", content).forEach((el) => {
      el.addEventListener("click", () => {
        const t = activeTab();
        const page = el.dataset.btlink;
        t.history = t.history.slice(0, t.hi + 1);
        t.history.push(page);
        t.hi = t.history.length - 1;
        t.page = page;
        t.url = page === "pie" ? "recipes.example.com/apple-pie" : "recipes.example.com";
        t.title = page === "pie" ? "Apple Pie" : page === "soup" ? "Chicken Soup" : "Grandma's Recipes";
        render();
        checkScenario();
      });
    });

    // download button
    const dl = content.querySelector('[data-bt="download"]');
    if (dl) {
      dl.addEventListener("click", () => {
        downloaded = true;
        render();
        checkScenario();
      });
    }
  }

  /* ---------- Scenarios ---------- */
  const SCENARIOS = [
    {
      id: "newtab",
      title: "Open a new tab",
      instr: "You're reading a recipe. You want to look up something else without losing this page. Open a new tab.",
      tip: "Use the ＋ button in the tab bar. Don't close this tab.",
      check: () => tabs.length === 2,
    },
    {
      id: "popup",
      title: "Close the pop-up",
      instr: "A pop-up appeared. Close it by clicking the small red × in the corner. (The big 'Close ✕' and 'Claim prize' are traps.)",
      tip: "Real close buttons are often small. Ads pretend to be close buttons.",
      setup: () => { popupOpen = true; popupClosedCorrectly = false; },
      check: () => popupClosedCorrectly,
    },
    {
      id: "download",
      title: "Download a file",
      instr: "Download the guide.pdf file from this page. Click the download button, then confirm it downloaded.",
      tip: "Look for a download notification at the bottom right.",
      setup: () => { downloaded = false; },
      check: () => downloaded,
    },
    {
      id: "permission",
      title: "Block notifications",
      instr: "This site asks to send notifications. Block it.",
      tip: "Sites that ask for notifications often spam you. Block them.",
      setup: () => { permissionResolved = null; },
      check: () => permissionResolved === "block",
    },
    {
      id: "zoom",
      title: "Make text bigger",
      instr: "The text is too small to read. Make it bigger using the zoom controls.",
      tip: "Use the A＋ button in the toolbar.",
      setup: () => { zoom = 0.8; },
      check: () => zoom > 0.8,
    },
    {
      id: "back",
      title: "Go back",
      instr: "You're on the Apple Pie recipe. Go back to the recipes home page.",
      tip: "Use the Back arrow (←) at the top left.",
      setup: () => {
        const t = activeTab();
        t.page = "pie";
        t.url = "recipes.example.com/apple-pie";
        t.title = "Apple Pie";
        t.history = ["home", "pie"];
        t.hi = 1;
      },
      check: () => activeTab().page === "home",
    },
    {
      id: "closetab",
      title: "Close only the extra tab",
      instr: "You have two tabs open. Close only the extra one (the 'New Tab'), keeping this recipe tab.",
      tip: "Click the × on the tab you want to close.",
      setup: () => {
        if (tabs.length < 2) {
          tabs.push({ id: nextId++, title: "New Tab", page: "home", url: "new-tab", history: ["home"], hi: 0 });
        }
        active = 1;
        tabClosedCorrectly = false;
      },
      check: () => tabs.length === 1 && tabs[0].id === 1,
    },
    {
      id: "address",
      title: "Type a web address",
      instr: "Type 'weather.com' in the address bar and press Go (not in a search box).",
      tip: "The address bar is at the top, next to the arrows.",
      setup: () => {},
      check: () => {
        const v = $("#bt-address").value.trim().toLowerCase();
        return v.includes("weather") && activeTab().url.includes("weather");
      },
    },
  ];

  let scenarioIdx = 0;
  let score = 0;
  let streak = 0;
  let bestStreak = 0;

  function resetBrowser() {
    tabs = [{ id: 1, title: "Grandma's Recipes", page: "home", url: "recipes.example.com", history: ["home"], hi: 0 }];
    active = 1;
    zoom = 1;
    nextId = 2;
    popupOpen = false;
    popupClosedCorrectly = false;
    downloaded = false;
    permissionResolved = null;
    tabClosedCorrectly = false;
  }

  function loadScenario() {
    const s = SCENARIOS[scenarioIdx];
    scenario = s;
    resetBrowser();
    if (s.setup) s.setup();
    render();
    $("#bt-title").textContent = s.title;
    $("#bt-instr").textContent = s.instr;
    $("#bt-tip").textContent = "💡 " + s.tip;
    $("#bt-feedback").style.display = "none";
    $("#bt-feedback").innerHTML = "";
    $("#bt-next").style.display = "none";
    $("#bt-round").textContent = (scenarioIdx + 1) + " / " + SCENARIOS.length;
  }

  function checkScenario() {
    const s = SCENARIOS[scenarioIdx];
    if (s.check()) {
      score++;
      streak++;
      if (streak > bestStreak) bestStreak = streak;
      $("#bt-feedback").style.display = "block";
      $("#bt-feedback").innerHTML = '<div class="mission-complete"><div class="confetti">🎉</div><h3>You did it!</h3><p>Great job handling that browser situation.</p></div>';
      $("#bt-next").style.display = "inline-flex";
      BB.toast("✓ Passed!", "good", 1500);
      $("#bt-score").textContent = score;
      $("#bt-streak").textContent = streak;
    }
  }

  function nextScenario() {
    scenarioIdx++;
    if (scenarioIdx >= SCENARIOS.length) {
      showOver();
      return;
    }
    loadScenario();
  }

  function showOver() {
    $("#bt-browser").style.display = "none";
    const over = $("#bt-over");
    over.style.display = "block";
    const pct = Math.round((score / SCENARIOS.length) * 100);
    let msg = "Good start — keep practicing.";
    if (pct >= 90) msg = "Excellent! You're a browser pro.";
    else if (pct >= 70) msg = "Nice work. A few more and you'll be great.";
    else if (pct >= 50) msg = "Halfway there. Try again to build the habit.";
    over.innerHTML =
      '<div class="big">🎉</div>' +
      "<h2>You finished!</h2>" +
      "<p>You passed <strong>" + score + " of " + SCENARIOS.length + "</strong> (" + pct + "%).</p>" +
      "<p>" + msg + "</p>" +
      "<p>Best streak: <strong>" + bestStreak + "</strong></p>" +
      '<div class="scam-actions"><button class="btn btn-primary btn-big" id="bt-replay">Play again</button></div>';
    $("#bt-replay").addEventListener("click", () => {
      over.style.display = "none";
      $("#bt-browser").style.display = "block";
      scenarioIdx = 0;
      score = 0;
      streak = 0;
      bestStreak = 0;
      $("#bt-score").textContent = "0";
      $("#bt-streak").textContent = "0";
      loadScenario();
    });
  }

  /* ---------- Wire up ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    $("#bt-next").addEventListener("click", nextScenario);

    // nav buttons
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-bt]");
      if (!btn) return;
      const action = btn.dataset.bt;
      if (action === "back") {
        const t = activeTab();
        if (t.hi > 0) { t.hi--; t.page = t.history[t.hi]; t.url = t.page === "pie" ? "recipes.example.com/apple-pie" : "recipes.example.com"; render(); checkScenario(); }
        else BB.toast("Can't go back further.", "info");
      } else if (action === "forward") {
        const t = activeTab();
        if (t.hi < t.history.length - 1) { t.hi++; t.page = t.history[t.hi]; t.url = t.page === "pie" ? "recipes.example.com/apple-pie" : "recipes.example.com"; render(); checkScenario(); }
        else BB.toast("Can't go forward further.", "info");
      } else if (action === "reload") {
        BB.toast("Page reloaded (practice).", "info");
      } else if (action === "go") {
        const val = $("#bt-address").value.trim();
        if (!val) { BB.toast("Type an address first.", "warn"); return; }
        const t = activeTab();
        t.history = t.history.slice(0, t.hi + 1);
        t.history.push("home");
        t.hi = t.history.length - 1;
        t.page = "home";
        t.url = val.toLowerCase().includes("weather") ? "weather.com" : val;
        t.title = "New Page";
        render();
        checkScenario();
      } else if (action === "bookmark") {
        const t = activeTab();
        t.bookmarked = !t.bookmarked;
        btn.textContent = t.bookmarked ? "★" : "☆";
        btn.classList.toggle("bookmarked", t.bookmarked);
      } else if (action === "zoom-in") {
        zoom = Math.min(1.6, Math.round((zoom + 0.15) * 100) / 100);
        render();
        checkScenario();
      } else if (action === "zoom-out") {
        zoom = Math.max(0.8, Math.round((zoom - 0.15) * 100) / 100);
        render();
        checkScenario();
      }
    });

    loadScenario();
  });
})();
