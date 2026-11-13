/* =========================================================
   Browser Buddy — Storage Full! Clean-Up
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  const ITEMS = [
    { name: "App cache (3 apps)", size: 200, action: "clear-cache", safe: true },
    { name: "Duplicate video (500 MB)", size: 500, action: "delete", safe: true },
    { name: "Old photos (200 MB)", size: 200, action: "delete", safe: true },
    { name: "Recently Deleted (300 MB)", size: 300, action: "empty-trash", safe: true },
    { name: "Contacts app", size: 50, action: "delete", safe: false },
    { name: "Messages app", size: 80, action: "delete", safe: false },
  ];

  let freed = 0, target = 500, done = false;

  function render() {
    const list = $("#sf-list");
    list.innerHTML = "";
    ITEMS.forEach((item, i) => {
      if (item.removed) return;
      const el = document.createElement("div");
      el.style.cssText = "display:flex;align-items:center;gap:10px;background:#f6f8fd;border-radius:10px;padding:10px 12px";
      el.innerHTML = '<span style="flex:1;font-weight:600">' + item.name + '</span><span style="color:var(--muted);font-size:.85rem">' + item.size + ' MB</span>';
      const btn = document.createElement("button");
      btn.className = "btn btn-ghost";
      btn.style.padding = "6px 12px";
      btn.style.fontSize = ".85rem";
      btn.textContent = item.action === "clear-cache" ? "Clear cache" : item.action === "empty-trash" ? "Empty trash" : "Delete";
      btn.addEventListener("click", () => {
        if (!item.safe) {
          BB.toast("Don't delete apps you need! Pick cache, duplicates, or trash.", "warn");
          return;
        }
        item.removed = true;
        freed += item.size;
        $("#sf-freed").textContent = freed + " MB";
        const used = Math.max(0, 95 - Math.round(freed / 10));
        $("#sf-storage").textContent = used + "%";
        render();
        if (freed >= target && !done) {
          done = true;
          BB.toast("✓ Enough space freed! Downloading...", "good", 2000);
          setTimeout(() => {
            const over = $("#sf-over");
            over.style.display = "block";
            over.innerHTML = '<div class="big">🎉</div><h2>Done!</h2><p>You freed ' + freed + ' MB of space.</p><div class="game-actions"><button class="btn btn-primary btn-big" id="sf-replay">Play again</button></div>';
            $("#sf-replay").addEventListener("click", () => location.reload());
          }, 800);
        }
      });
      el.appendChild(btn);
      list.appendChild(el);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.createElement("button");
    btn.className = "btn btn-primary btn-big";
    btn.textContent = "Start game";
    btn.addEventListener("click", () => { btn.style.display = "none"; render(); });
    document.querySelector("main").appendChild(btn);
  });
})();
