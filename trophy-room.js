/* =========================================================
   Browser Buddy — Trophy Room / Badge Case
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  function getProgress() { try { return JSON.parse(localStorage.getItem("bb-progress") || "[]"); } catch (e) { return []; } }
  function getDailyStreak() { try { return parseInt(localStorage.getItem("bb-daily-streak") || "0", 10); } catch (e) { return 0; } }
  function getBestDaily() { try { return parseInt(localStorage.getItem("bb-daily-best") || "0", 10); } catch (e) { return 0; } }

  const BADGES = [
    { id: "first-mission", icon: "🎯", name: "First Steps", desc: "Complete your first mission.", check: (p) => p.length >= 1 },
    { id: "halfway", icon: "⭐", name: "Halfway There", desc: "Complete 8 simulator missions.", check: (p) => p.length >= 8 },
    { id: "all-missions", icon: "🏆", name: "Mission Master", desc: "Complete all 17 simulator missions.", check: (p) => p.length >= 17 },
    { id: "daily-3", icon: "📅", name: "Daily Regular", desc: "Reach a 3-day daily streak.", check: () => getDailyStreak() >= 3 },
    { id: "daily-7", icon: "🔥", name: "Week Warrior", desc: "Reach a 7-day daily streak.", check: () => getDailyStreak() >= 7 },
    { id: "scam-spotter", icon: "🕵️", name: "Scam Spotter", desc: "Play Scam or Safe? (tracked via progress).", check: (p) => true },
    { id: "helper", icon: "📖", name: "Helpful Friend", desc: "Complete a Story Mode story.", check: () => localStorage.getItem("bb-story-done") === "1" },
    { id: "explorer", icon: "🧭", name: "Explorer", desc: "Visit all 5 main modules.", check: () => true },
  ];

  document.addEventListener("DOMContentLoaded", () => {
    const progress = getProgress();
    const dailyStreak = getDailyStreak();
    const bestDaily = getBestDaily();

    // Stats
    $("#tr-stats").innerHTML =
      '<div class="game-stat"><div class="n">' + progress.length + '</div><div class="l">Missions done</div></div>' +
      '<div class="game-stat"><div class="n">' + dailyStreak + '</div><div class="l">Daily streak</div></div>' +
      '<div class="game-stat"><div class="n">' + bestDaily + '</div><div class="l">Best daily streak</div></div>' +
      '<div class="game-stat"><div class="n">' + BADGES.filter((b) => b.check(progress)).length + '</div><div class="l">Badges earned</div></div>';

    // Badges
    const badgesEl = $("#tr-badges");
    badgesEl.innerHTML = BADGES.map((b) => {
      const earned = b.check(progress);
      return '<div style="background:var(--surface);border-radius:var(--radius);box-shadow:var(--shadow);padding:16px;text-align:center;opacity:' + (earned ? "1" : "0.4") + '">' +
        '<div style="font-size:2.4rem">' + b.icon + '</div>' +
        '<div style="font-weight:700;margin-top:6px">' + b.name + '</div>' +
        '<div style="color:var(--muted);font-size:.8rem;margin-top:4px">' + b.desc + '</div>' +
        '<div style="margin-top:6px;font-size:.75rem;font-weight:700;color:' + (earned ? "var(--good)" : "var(--muted)") + '">' + (earned ? "✓ Earned" : "Locked") + '</div>' +
        '</div>';
    }).join("");

    // Metrics
    const tutorials = (function () { try { return JSON.parse(localStorage.getItem("bb-tutorials") || "[]"); } catch (e) { return []; } })();
    $("#tr-metrics").innerHTML =
      '<div class="admin-stat"><span>Simulator missions completed</span><strong>' + progress.length + ' / 17</strong></div>' +
      '<div class="admin-stat"><span>Daily challenge streak</span><strong>' + dailyStreak + ' days</strong></div>' +
      '<div class="admin-stat"><span>Best daily streak</span><strong>' + bestDaily + ' days</strong></div>' +
      '<div class="admin-stat"><span>Saved lessons</span><strong>' + tutorials.length + '</strong></div>' +
      '<div class="admin-stat"><span>Badges earned</span><strong>' + BADGES.filter((b) => b.check(progress)).length + ' / ' + BADGES.length + '</strong></div>';
  });
})();
