/* =========================================================
   Browser Buddy — Bookmark Organizer
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  const LINKS = [
    { id: "l1", title: "Pasta recipe", folder: null },
    { id: "l2", title: "Cake recipe", folder: null },
    { id: "l3", title: "World news", folder: null },
    { id: "l4", title: "Tech news", folder: null },
    { id: "l5", title: "Knitting blog", folder: null },
    { id: "l6", title: "Garden tips", folder: null },
  ];
  const FOLDERS = ["Recipes", "News", "Hobbies"];
  const CORRECT = { l1: "Recipes", l2: "Recipes", l3: "News", l4: "News", l5: "Hobbies", l6: "Hobbies" };

  const TASKS = [
    { text: "Move the two recipe links into the 'Recipes' folder.", check: (links) => links.filter(l => l.folder === "Recipes").length >= 2 },
    { text: "Move the two news links into the 'News' folder.", check: (links) => links.filter(l => l.folder === "News").length >= 2 },
    { text: "Move the two hobby links into the 'Hobbies' folder.", check: (links) => links.filter(l => l.folder === "Hobbies").length >= 2 },
    { text: "Star the 'Pasta recipe' link as a favorite.", check: (links, ctx) => ctx.starred },
    { text: "Show the bookmarks bar (it's hidden).", check: (links, ctx) => ctx.barVisible },
  ];

  let round = 0, score = 0, total = TASKS.length;
  let links = LINKS.map(l => ({ ...l }));
  let selected = null;
  let starred = false;
  let barVisible = false;

  function render() {
    const area = $("#bo-area");
    area.innerHTML = "";
    // links
    const linksDiv = document.createElement("div");
    linksDiv.style.display = "flex";
    linksDiv.style.flexWrap = "wrap";
    linksDiv.style.gap = "8px";
    linksDiv.style.marginBottom = "12px";
    links.forEach((l) => {
      const el = document.createElement("button");
      el.className = "btn btn-ghost";
      el.style.fontSize = ".85rem";
      el.textContent = (starred && l.id === "l1" ? "⭐ " : "") + l.title + (l.folder ? " → " + l.folder : "");
      if (selected === l.id) el.style.borderColor = "var(--primary)";
      el.addEventListener("click", () => { selected = l.id; render(); });
      linksDiv.appendChild(el);
    });
    area.appendChild(linksDiv);
    // folders
    const foldersDiv = document.createElement("div");
    foldersDiv.style.display = "flex";
    foldersDiv.style.gap = "8px";
    foldersDiv.style.flexWrap = "wrap";
    FOLDERS.forEach((f) => {
      const el = document.createElement("button");
      el.className = "btn btn-primary";
      el.textContent = "📁 " + f;
      el.addEventListener("click", () => {
        if (!selected) { BB.toast("Select a link first.", "warn"); return; }
        const l = links.find((x) => x.id === selected);
        if (l) l.folder = f;
        selected = null;
        render();
        check();
      });
      foldersDiv.appendChild(el);
    });
    area.appendChild(foldersDiv);

    // star button
    const starBtn = document.createElement("button");
    starBtn.className = "btn btn-ghost";
    starBtn.style.marginTop = "8px";
    starBtn.textContent = "⭐ Star 'Pasta recipe'";
    starBtn.addEventListener("click", () => { starred = true; render(); check(); });
    area.appendChild(starBtn);

    // bookmarks bar
    const bar = $("#bo-bar");
    bar.style.display = barVisible ? "block" : "none";
    $("#bo-baritems").textContent = links.filter(l => l.folder).map(l => l.title).join(", ") || "(empty)";
  }

  function check() {
    const ctx = { starred, barVisible };
    const t = TASKS[round];
    if (t.check(links, ctx)) {
      score++;
      $("#bo-score").textContent = score;
      BB.toast("✓ Done!", "good", 1500);
      round++;
      if (round >= total) { endGame(); return; }
      $("#bo-round").textContent = (round + 1) + " / " + total;
      $("#bo-instr").textContent = TASKS[round].text;
      selected = null;
    }
  }

  $("#bo-togglebar").addEventListener("click", () => {
    barVisible = !barVisible;
    render();
    check();
  });

  function endGame() {
    const over = $("#bo-over");
    over.style.display = "block";
    over.innerHTML = '<div class="big">🎉</div><h2>Done!</h2><p>You completed <strong>' + score + ' of ' + total + '</strong> tasks.</p><div class="game-actions"><button class="btn btn-primary btn-big" id="bo-replay">Play again</button></div>';
    $("#bo-replay").addEventListener("click", () => { over.style.display = "none"; score = 0; round = 0; links = LINKS.map(l => ({ ...l })); selected = null; starred = false; barVisible = false; $("#bo-score").textContent = "0"; $("#bo-round").textContent = "1 / " + total; $("#bo-instr").textContent = TASKS[0].text; render(); });
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("#bo-instr").textContent = TASKS[0].text;
    const btn = document.createElement("button");
    btn.className = "btn btn-primary btn-big";
    btn.textContent = "Start game";
    btn.addEventListener("click", () => { btn.style.display = "none"; render(); });
    document.querySelector("main").appendChild(btn);
  });
})();
