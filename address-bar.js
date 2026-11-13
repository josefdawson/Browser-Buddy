/* =========================================================
   Browser Buddy — Address Bar vs. Search Bar
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  const ROUNDS = [
    { type: "url", prompt: "Go to wikipedia.org", answer: "wikipedia.org" },
    { type: "search", prompt: "Find out how to boil an egg", organic: "How to Boil an Egg — Step by Step", ad: "Buy Egg Cookers Now!" },
    { type: "url", prompt: "Go to weather.gov", answer: "weather.gov" },
    { type: "search", prompt: "Best cat videos", organic: "Top 10 Cat Videos of 2024", ad: "Ad: Buy Cat Food Here" },
    { type: "url", prompt: "Go to gmail.com", answer: "gmail.com" },
    { type: "search", prompt: "What is the capital of France?", organic: "Paris — Wikipedia", ad: "Sponsored: Learn French Fast" },
    { type: "url", prompt: "Go to youtube.com", answer: "youtube.com" },
    { type: "search", prompt: "How to reset a router", organic: "How to Restart Your Router", ad: "Ad: Buy a New Router" },
  ];

  let round = 0, score = 0, total = ROUNDS.length;

  function loadRound() {
    const r = ROUNDS[round];
    $("#ab-prompt").textContent = r.type === "url"
      ? "Type this web address in the address bar: " + r.answer
      : "Search for this: " + r.prompt;
    $("#ab-round").textContent = (round + 1) + " / " + total;
    $("#ab-area").innerHTML = "";

    if (r.type === "url") {
      $("#ab-area").innerHTML =
        '<div style="display:flex;gap:8px;margin-bottom:10px">' +
        '<input type="text" id="ab-addr" placeholder="Address bar (type URL here)" style="flex:1;padding:10px;border:2px solid var(--line);border-radius:10px;font-size:1rem">' +
        '<button class="btn btn-primary" id="ab-go">Go</button></div>' +
        '<div style="display:flex;gap:8px">' +
        '<input type="text" id="ab-search" placeholder="Search box (not here)" style="flex:1;padding:10px;border:2px solid var(--line);border-radius:10px;font-size:1rem">' +
        '<button class="btn btn-ghost" id="ab-searchbtn">Search</button></div>' +
        '<p class="muted" style="margin-top:10px">Tip: web addresses go in the address bar at the top.</p>';
      $("#ab-go").addEventListener("click", () => {
        const v = $("#ab-addr").value.trim().toLowerCase();
        if (v.includes(r.answer.replace(".com", "").replace(".org", "").replace(".gov", ""))) {
          score++;
          $("#ab-score").textContent = score;
          BB.toast("✓ Correct! You used the address bar.", "good", 1500);
          next();
        } else {
          BB.toast("Try typing the address in the address bar.", "warn");
        }
      });
      $("#ab-searchbtn").addEventListener("click", () => {
        BB.toast("That's a search, not an address. Use the address bar.", "warn");
      });
    } else {
      $("#ab-area").innerHTML =
        '<div style="display:flex;gap:8px;margin-bottom:10px">' +
        '<input type="text" id="ab-search" placeholder="Search box" style="flex:1;padding:10px;border:2px solid var(--line);border-radius:10px;font-size:1rem">' +
        '<button class="btn btn-primary" id="ab-searchbtn">Search</button></div>' +
        '<p class="muted">Tip: questions go in the search box.</p>';
      $("#ab-searchbtn").addEventListener("click", () => {
        const v = $("#ab-search").value.trim();
        if (v.length < 3) { BB.toast("Type your search first.", "warn"); return; }
        showResults(r);
      });
    }
  }

  function showResults(r) {
    $("#ab-area").innerHTML =
      '<div style="background:#f0f4fc;border:2px solid #ffb020;border-radius:10px;padding:12px;margin:8px 0;cursor:pointer" data-ad="1">' +
      '<strong style="color:#c93a3a">Sponsored</strong> — ' + r.ad + "</div>" +
      '<div style="background:#fff;border:2px solid var(--line);border-radius:10px;padding:12px;margin:8px 0;cursor:pointer" data-org="1">' +
      r.organic + "</div>" +
      '<p class="muted" style="margin-top:8px">Click the real (non-sponsored) result.</p>';
    $("#ab-area").querySelector("[data-ad]").addEventListener("click", () => {
      BB.toast("That's a sponsored ad. Pick the organic result below.", "warn");
    });
    $("#ab-area").querySelector("[data-org]").addEventListener("click", () => {
      score++;
      $("#ab-score").textContent = score;
      BB.toast("✓ Correct! You skipped the ad.", "good", 1500);
      next();
    });
  }

  function next() {
    round++;
    if (round >= total) { endGame(); return; }
    $("#ab-round").textContent = (round + 1) + " / " + total;
    loadRound();
  }

  function endGame() {
    const over = $("#ab-over");
    over.style.display = "block";
    const pct = Math.round((score / total) * 100);
    over.innerHTML = '<div class="big">🎉</div><h2>Done!</h2><p>You got <strong>' + score + ' of ' + total + '</strong> right (' + pct + '%).</p><div class="game-actions"><button class="btn btn-primary btn-big" id="ab-replay">Play again</button></div>';
    $("#ab-replay").addEventListener("click", () => { over.style.display = "none"; score = 0; round = 0; $("#ab-score").textContent = "0"; $("#ab-round").textContent = "1 / " + total; loadRound(); });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.createElement("button");
    btn.className = "btn btn-primary btn-big";
    btn.textContent = "Start game";
    btn.addEventListener("click", () => { btn.style.display = "none"; loadRound(); });
    document.querySelector("main").appendChild(btn);
  });
})();
