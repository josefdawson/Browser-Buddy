/* =========================================================
   Browser Buddy — Cookie Banner Speedrun
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  const BANNERS = [
    // type: "hidden-reject" - reject behind manage prefs
    { type: "hidden", site: "NewsSite.com" },
    { type: "bright-accept", site: "ShopDaily.com" },
    { type: "hidden", site: "BlogHub.net" },
    { type: "bright-accept", site: "VideoStream.io" },
    { type: "hidden", site: "RecipeWorld.com" },
    { type: "bright-accept", site: "GameZone.com" },
  ];

  let round = 0, score = 0, clicks = 0, total = BANNERS.length;

  function renderBanner() {
    const b = BANNERS[round];
    const el = $("#cb-banner");
    $("#cb-instr").textContent = "Reject unnecessary tracking on " + b.site + " in as few clicks as possible.";
    $("#cb-round").textContent = (round + 1) + " / " + total;
    clicks = 0;
    $("#cb-clicks").textContent = "0";

    if (b.type === "hidden") {
      el.innerHTML =
        '<div class="cookie-banner">' +
        '<div class="msg">' + b.site + ' uses cookies to track you.</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<button class="cookie-btn" data-act="manage">Manage preferences</button>' +
        '<button class="cookie-btn primary" data-act="accept">Accept all</button>' +
        "</div></div>" +
        '<div class="cb-prefs" style="display:none;margin-top:10px;padding:12px;background:#f0f4fc;border-radius:10px">' +
        '<label><input type="checkbox" checked> Essential (required)</label><br>' +
        '<label><input type="checkbox" checked> Analytics</label><br>' +
        '<label><input type="checkbox" checked> Advertising</label><br>' +
        '<button class="cookie-btn" data-act="reject" style="margin-top:8px">Reject all non-essential</button>' +
        '<button class="cookie-btn primary" data-act="save" style="margin-top:8px">Save preferences</button>' +
        "</div>";
      el.querySelector('[data-act="manage"]').addEventListener("click", () => {
        clicks++;
        $("#cb-clicks").textContent = clicks;
        el.querySelector(".cb-prefs").style.display = "block";
      });
      el.querySelector('[data-act="accept"]').addEventListener("click", () => {
        clicks++;
        $("#cb-clicks").textContent = clicks;
        BB.toast("You accepted tracking. Try rejecting instead.", "warn");
        renderBanner();
      });
      el.querySelector('[data-act="reject"]').addEventListener("click", () => {
        clicks++;
        $("#cb-clicks").textContent = clicks;
        success();
      });
      el.querySelector('[data-act="save"]').addEventListener("click", () => {
        clicks++;
        $("#cb-clicks").textContent = clicks;
        // check if all non-essential unchecked
        const checks = el.querySelectorAll('.cb-prefs input[type="checkbox"]');
        let allEssential = true;
        checks.forEach((c, i) => { if (i > 0 && c.checked) allEssential = false; });
        if (allEssential) success();
        else { BB.toast("Uncheck the tracking boxes first.", "warn"); }
      });
    } else {
      el.innerHTML =
        '<div class="cookie-banner">' +
        '<div class="msg">' + b.site + ' uses cookies to track you and show ads.</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<button class="cookie-btn primary" data-act="accept">Accept all</button>' +
        '<button class="cookie-btn" data-act="reject">Reject all</button>' +
        "</div></div>";
      el.querySelector('[data-act="accept"]').addEventListener("click", () => {
        clicks++;
        $("#cb-clicks").textContent = clicks;
        BB.toast("You accepted tracking. Try rejecting.", "warn");
        renderBanner();
      });
      el.querySelector('[data-act="reject"]').addEventListener("click", () => {
        clicks++;
        $("#cb-clicks").textContent = clicks;
        success();
      });
    }
  }

  function success() {
    score++;
    $("#cb-score").textContent = score;
    BB.toast("✓ Rejected tracking in " + clicks + " click" + (clicks === 1 ? "" : "s") + "!", "good", 1500);
    round++;
    if (round >= total) { endGame(); return; }
    $("#cb-round").textContent = (round + 1) + " / " + total;
    renderBanner();
  }

  function endGame() {
    const over = $("#cb-over");
    over.style.display = "block";
    const pct = Math.round((score / total) * 100);
    over.innerHTML = '<div class="big">🎉</div><h2>Done!</h2><p>You rejected tracking on <strong>' + score + ' of ' + total + '</strong> sites (' + pct + '%).</p><div class="game-actions"><button class="btn btn-primary btn-big" id="cb-replay">Play again</button></div>';
    $("#cb-replay").addEventListener("click", () => { over.style.display = "none"; score = 0; round = 0; $("#cb-score").textContent = "0"; renderBanner(); });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.createElement("button");
    btn.className = "btn btn-primary btn-big";
    btn.textContent = "Start game";
    btn.addEventListener("click", () => { btn.style.display = "none"; renderBanner(); });
    document.querySelector("main").appendChild(btn);
  });
})();
