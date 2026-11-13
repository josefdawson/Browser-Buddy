/* =========================================================
   Browser Buddy — Find the Hidden Setting (Scavenger Hunt)
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  const TREE = {
    name: "Settings",
    children: [
      { name: "Display", icon: "🖥️", children: [
        { name: "Brightness", icon: "☀️", leaf: true, id: "brightness" },
        { name: "Dark mode", icon: "🌙", leaf: true, id: "darkmode" },
        { name: "Font size", icon: "🔤", leaf: true, id: "fontsize" },
        { name: "Wallpaper", icon: "🖼️", leaf: true, id: "wallpaper" },
      ]},
      { name: "Sound", icon: "🔊", children: [
        { name: "Volume", icon: "🔉", leaf: true, id: "volume" },
        { name: "Notification sounds", icon: "🔔", leaf: true, id: "notifsounds" },
        { name: "Ringtone", icon: "🎵", leaf: true, id: "ringtone" },
      ]},
      { name: "Privacy", icon: "🔒", children: [
        { name: "Location", icon: "📍", leaf: true, id: "location" },
        { name: "Camera access", icon: "📷", leaf: true, id: "camera" },
        { name: "Microphone", icon: "🎙️", leaf: true, id: "mic" },
        { name: "Clear browsing history", icon: "🗑️", leaf: true, id: "clearhistory" },
        { name: "Ad tracking", icon: "📊", leaf: true, id: "adtracking" },
      ]},
      { name: "Network", icon: "📶", children: [
        { name: "Wi-Fi", icon: "📡", leaf: true, id: "wifi" },
        { name: "Bluetooth", icon: "🔵", leaf: true, id: "bluetooth" },
        { name: "Airplane mode", icon: "✈️", leaf: true, id: "airplane" },
      ]},
      { name: "Accessibility", icon: "♿", children: [
        { name: "Large text", icon: "🔤", leaf: true, id: "largetext" },
        { name: "High contrast", icon: "🔲", leaf: true, id: "highcontrast" },
        { name: "Screen reader", icon: "🔊", leaf: true, id: "screenreader" },
      ]},
      { name: "Battery", icon: "🔋", children: [
        { name: "Battery saver", icon: "🪫", leaf: true, id: "batterysaver" },
        { name: "Usage stats", icon: "📊", leaf: true, id: "usagestats" },
      ]},
    ],
  };

  const GOALS = [
    { text: "Turn on Dark Mode.", target: "darkmode", path: ["Display", "Dark mode"] },
    { text: "Clear your browsing history.", target: "clearhistory", path: ["Privacy", "Clear browsing history"] },
    { text: "Change the font size to Large.", target: "fontsize", path: ["Display", "Font size"] },
    { text: "Turn off Location access.", target: "location", path: ["Privacy", "Location"] },
    { text: "Enable Battery Saver.", target: "batterysaver", path: ["Battery", "Battery saver"] },
    { text: "Turn on High Contrast.", target: "highcontrast", path: ["Accessibility", "High contrast"] },
  ];

  let score = 0, round = 0, total = GOALS.length, clicks = 0;
  let path = [TREE]; // stack of nodes
  let searchQuery = "";

  function current() { return path[path.length - 1]; }

  function render() {
    const node = current();
    const settings = $("#hs-settings");
    $("#hs-clicks").textContent = clicks;
    $("#hs-goal").textContent = "🎯 Goal: " + GOALS[round].text;
    $("#hs-round").textContent = (round + 1) + " / " + total;

    // breadcrumb
    const bc = path.map((n) => n.name).join(" › ");
    let html = '<div class="sh-breadcrumb">' + bc + '</div>';
    if (path.length > 1) {
      html += '<div class="sh-item" data-back="1">← Back</div>';
    }

    let children = node.children || [];
    if (searchQuery) {
      // flatten search
      const results = [];
      function search(n, trail) {
        (n.children || []).forEach((c) => {
          if (c.leaf && c.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            results.push({ node: c, trail: trail.concat(c.name) });
          }
          if (c.children) search(c, trail.concat(c.name));
        });
      }
      search(TREE, []);
      children = results.map((r) => r.node);
      // store trail for click handling
      children._trails = results.map((r) => r.trail);
    }

    children.forEach((c) => {
      if (c.leaf) {
        html += '<div class="sh-item" data-leaf="' + c.id + '">' + c.icon + " " + c.name + "</div>";
      } else {
        html += '<div class="sh-cat" data-cat="' + c.name + '">' + c.icon + " " + c.name + " ›</div>";
      }
    });
    settings.innerHTML = html;

    // search input
    let searchInput = $("#hs-search");
    if (!searchInput) {
      searchInput = document.createElement("input");
      searchInput.id = "hs-search";
      searchInput.className = "cb-input";
      searchInput.placeholder = "Search settings...";
      searchInput.style.marginBottom = "10px";
      settings.parentNode.insertBefore(searchInput, settings);
      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value;
        render();
      });
    }

    // bind clicks
    settings.querySelectorAll("[data-cat]").forEach((el) => {
      el.addEventListener("click", () => {
        clicks++;
        const child = node.children.find((c) => c.name === el.dataset.cat);
        path.push(child);
        render();
      });
    });
    settings.querySelectorAll("[data-leaf]").forEach((el) => {
      el.addEventListener("click", () => {
        clicks++;
        const id = el.dataset.leaf;
        if (id === GOALS[round].target) {
          // success
          const optimal = GOALS[round].path.length;
          let stars = 1;
          if (clicks <= optimal + 1) stars = 3;
          else if (clicks <= optimal + 2) stars = 2;
          score += stars;
          $("#hs-score").textContent = score;
          BB.toast("✓ Found it! +" + stars + " stars", "good", 1500);
          round++;
          if (round >= total) { endGame(); return; }
          path = [TREE];
          clicks = 0;
          searchQuery = "";
          $("#hs-search").value = "";
          render();
        } else {
          BB.toast("Not that one. Keep looking.", "warn", 1500);
          render();
        }
      });
    });
    const back = settings.querySelector("[data-back]");
    if (back) {
      back.addEventListener("click", () => {
        clicks++;
        path.pop();
        render();
      });
    }
  }

  function endGame() {
    if (typeof Sound !== "undefined") { Sound.complete(); Sound.confetti(); }
    const over = $("#hs-over");
    over.style.display = "block";
    const maxStars = total * 3;
    const pct = Math.round((score / maxStars) * 100);
    let msg = "Good start.";
    if (pct >= 90) msg = "Excellent! You know your settings.";
    else if (pct >= 70) msg = "Nice work.";
    else if (pct >= 50) msg = "Halfway. Try using the search bar.";
    over.innerHTML = '<div class="big">🎉</div><h2>Done!</h2><p>You earned <strong>' + score + ' of ' + maxStars + '</strong> stars (' + pct + '%).</p><p>' + msg + '</p><div class="game-actions"><button class="btn btn-primary btn-big" id="hs-replay">Play again</button></div>';
    $("#hs-replay").addEventListener("click", () => {
      over.style.display = "none";
      score = 0; round = 0; clicks = 0; path = [TREE]; searchQuery = "";
      $("#hs-score").textContent = "0";
      $("#hs-search").value = "";
      render();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.createElement("button");
    btn.className = "btn btn-primary btn-big";
    btn.textContent = "Start game";
    btn.addEventListener("click", () => {
      btn.style.display = "none";
      render();
    });
    const ga = document.createElement("div");
    ga.className = "game-actions";
    ga.appendChild(btn);
    document.querySelector("main").appendChild(ga);
  });
})();
