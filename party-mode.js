/* =========================================================
   Browser Buddy — Party Mode (Pass-and-Play 2-Player)
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  let currentGame = "cookie";
  let currentPlayer = 1;
  let p1Score = 0, p2Score = 0;
  let running = false;
  let timer = null, timeLeft = 20;
  let roundScore = 0;

  const GAMES = {
    cookie: {
      title: "Cookie Banner Speedrun",
      desc: "Reject tracking in as few clicks as possible.",
      rounds: 5,
      generate: () => {
        const types = ["hidden", "bright"];
        return types[Math.floor(Math.random() * types.length)];
      },
    },
    address: {
      title: "Address Bar vs Search Bar",
      desc: "Type URLs in the address bar, searches in the search box.",
      rounds: 5,
      generate: () => {
        const urls = ["wikipedia.org", "weather.gov", "gmail.com", "youtube.com"];
        const searches = ["how to boil an egg", "best cat videos", "capital of France", "reset router"];
        return Math.random() < 0.5 ? { type: "url", val: urls[Math.floor(Math.random() * urls.length)] } : { type: "search", val: searches[Math.floor(Math.random() * searches.length)] };
      },
    },
  };

  function updateHud() {
    $("#pm-p1score").textContent = p1Score;
    $("#pm-p2score").textContent = p2Score;
    $("#pm-score").textContent = roundScore;
    $("#pm-current").textContent = "Player " + currentPlayer + "'s turn";
    $("#pm-current").className = "pm-player p" + currentPlayer;
  }

  function startTurn() {
    running = true;
    roundScore = 0;
    timeLeft = 20;
    $("#pm-area").innerHTML = "";
    $("#pm-instr").textContent = "Get ready...";
    if (currentGame === "cookie") startCookieRound();
    else startAddressRound();
    timer = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) endTurn();
    }, 1000);
  }

  function startCookieRound() {
    const type = Math.random() < 0.5 ? "hidden" : "bright";
    const area = $("#pm-area");
    if (type === "hidden") {
      area.innerHTML = '<div style="background:#fff;border:2px solid var(--line);border-radius:10px;padding:12px"><div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"><button class="btn btn-ghost" data-act="manage" style="padding:6px 10px;font-size:.8rem">Manage</button><button class="btn btn-primary" data-act="accept" style="padding:6px 10px;font-size:.8rem">Accept all</button></div></div><div class="cb-prefs" style="display:none;margin-top:8px;padding:8px;background:#f0f4fc;border-radius:8px"><button class="btn btn-ghost" data-act="reject" style="padding:6px 10px;font-size:.8rem">Reject all</button></div>';
      area.querySelector('[data-act="manage"]').addEventListener("click", () => { area.querySelector(".cb-prefs").style.display = "block"; });
      area.querySelector('[data-act="accept"]').addEventListener("click", () => { BB.toast("Accepted (not ideal).", "warn", 800); });
      area.querySelector('[data-act="reject"]').addEventListener("click", () => { roundScore++; BB.toast("✓ Rejected!", "good", 600); nextCookieRound(); });
    } else {
      area.innerHTML = '<div style="background:#fff;border:2px solid var(--line);border-radius:10px;padding:12px"><div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"><button class="btn btn-primary" data-act="accept" style="padding:6px 10px;font-size:.8rem">Accept all</button><button class="btn btn-ghost" data-act="reject" style="padding:6px 10px;font-size:.8rem">Reject all</button></div></div>';
      area.querySelector('[data-act="accept"]').addEventListener("click", () => { BB.toast("Accepted (not ideal).", "warn", 800); });
      area.querySelector('[data-act="reject"]').addEventListener("click", () => { roundScore++; BB.toast("✓ Rejected!", "good", 600); nextCookieRound(); });
    }
  }

  let cookieRound = 0;
  function nextCookieRound() {
    cookieRound++;
    if (cookieRound >= 5) { endTurn(); return; }
    startCookieRound();
  }

  function startAddressRound() {
    const r = Math.random() < 0.5
      ? { type: "url", val: ["wikipedia.org", "weather.gov", "gmail.com", "youtube.com"][Math.floor(Math.random() * 4)] }
      : { type: "search", val: ["how to boil an egg", "best cat videos", "capital of France"][Math.floor(Math.random() * 3)] };
    const area = $("#pm-area");
    if (r.type === "url") {
      area.innerHTML = '<p style="margin:0 0 8px">Type this address in the address bar:</p><strong>' + r.val + '</strong><div style="display:flex;gap:8px;margin-top:8px"><input id="pm-addr" placeholder="Address bar" style="flex:1;padding:8px;border:2px solid var(--line);border-radius:8px"><button class="btn btn-primary" id="pm-go" style="padding:6px 12px">Go</button></div>';
      $("#pm-go").addEventListener("click", () => {
        const v = $("#pm-addr").value.trim().toLowerCase();
        if (v.includes(r.val.replace(".com", "").replace(".org", "").replace(".gov", ""))) {
          roundScore++;
          BB.toast("✓ Correct!", "good", 600);
          nextAddressRound();
        } else {
          BB.toast("Try the address bar.", "warn", 800);
        }
      });
    } else {
      area.innerHTML = '<p style="margin:0 0 8px">Search for:</p><strong>' + r.val + '</strong><div style="display:flex;gap:8px;margin-top:8px"><input id="pm-search" placeholder="Search box" style="flex:1;padding:8px;border:2px solid var(--line);border-radius:8px"><button class="btn btn-primary" id="pm-searchbtn" style="padding:6px 12px">Search</button></div>';
      $("#pm-searchbtn").addEventListener("click", () => {
        const v = $("#pm-search").value.trim();
        if (v.length >= 3) {
          roundScore++;
          BB.toast("✓ Correct!", "good", 600);
          nextAddressRound();
        } else {
          BB.toast("Type a search first.", "warn", 800);
        }
      });
    }
  }

  let addressRound = 0;
  function nextAddressRound() {
    addressRound++;
    if (addressRound >= 5) { endTurn(); return; }
    startAddressRound();
  }

  function endTurn() {
    running = false;
    clearInterval(timer);
    if (currentPlayer === 1) {
      p1Score = roundScore;
      $("#pm-p1score").textContent = p1Score;
      currentPlayer = 2;
      cookieRound = 0; addressRound = 0;
      $("#pm-current").textContent = "Player 2's turn — hand over the mouse!";
      $("#pm-current").className = "pm-player p2";
      $("#pm-instr").textContent = "Player 2, click 'Start turn' when ready.";
      $("#pm-area").innerHTML = "";
      $("#pm-start").style.display = "inline-flex";
      $("#pm-start").textContent = "Start Player 2's turn";
    } else {
      p2Score = roundScore;
      $("#pm-p2score").textContent = p2Score;
      showResult();
    }
  }

  function showResult() {
    const result = $("#pm-result");
    result.style.display = "block";
    let winner = p1Score > p2Score ? "Player 1" : p2Score > p1Score ? "Player 2" : "Tie";
    result.innerHTML = '<div class="big">🎉</div><h2>' + winner + (winner !== "Tie" ? " wins!" : "!") + '</h2><p>Player 1: ' + p1Score + ' · Player 2: ' + p2Score + '</p><div class="game-actions"><button class="btn btn-primary btn-big" id="pm-replay">Play again</button></div>';
    $("#pm-replay").addEventListener("click", () => {
      result.style.display = "none";
      p1Score = 0; p2Score = 0; currentPlayer = 1;
      $("#pm-p1score").textContent = "0";
      $("#pm-p2score").textContent = "0";
      $("#pm-current").textContent = "Player 1's turn";
      $("#pm-current").className = "pm-player p1";
      $("#pm-start").textContent = "Start turn";
    });
    if (typeof Sound !== "undefined") { Sound.complete(); Sound.confetti(); }
  }

  document.addEventListener("DOMContentLoaded", () => {
    $$(".mode-btn").forEach((b) => {
      b.addEventListener("click", () => {
        $$(".mode-btn").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        currentGame = b.dataset.game;
      });
    });
    $("#pm-start").addEventListener("click", () => {
      $("#pm-start").style.display = "none";
      startTurn();
    });
  });
})();
