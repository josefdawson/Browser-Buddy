/* =========================================================
   Browser Buddy — Content Drip (unlock new content over time)
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  // Content schedule: day -> { title, desc, link, icon }
  const SCHEDULE = [
    { day: 0, title: "Welcome!", desc: "Start with the Safe-Mode Simulator.", link: "simulator.html", icon: "🛡️" },
    { day: 1, title: "New: Scam or Safe?", desc: "Spot tricky buttons and interfaces.", link: "scam.html", icon: "🕵️" },
    { day: 2, title: "New: Icon Dictionary", desc: "What does that little picture mean?", link: "icon-dictionary.html", icon: "🔣" },
    { day: 3, title: "New: Browser Trainer", desc: "Tabs, pop-ups, downloads, and permissions.", link: "browser-trainer.html", icon: "🌐" },
    { day: 4, title: "New: Click-Through Builder", desc: "Make your own step-by-step lessons.", link: "click-builder.html", icon: "🧩" },
    { day: 5, title: "New: Story Mode", desc: "Help a friend through a real task.", link: "story-mode.html", icon: "📖" },
    { day: 6, title: "New: Daily Challenge", desc: "One new scenario every day.", link: "daily-challenge.html", icon: "📅" },
    { day: 7, title: "New: Chaos Mode", desc: "Fast-paced gauntlet. 3 lives.", link: "chaos-mode.html", icon: "🌀" },
    { day: 8, title: "New: Mystery Virus", desc: "Fix a broken computer every round.", link: "mystery-virus.html", icon: "🦠" },
    { day: 9, title: "New: Pop-Up Whack-a-Mole", desc: "Click the real close buttons.", link: "popup-whack.html", icon: "🎯" },
    { day: 10, title: "New: Tab Chaos Organizer", desc: "Mute, pin, close, reopen tabs.", link: "tab-chaos.html", icon: "🗂️" },
    { day: 11, title: "New: Download Button Hunt", desc: "Find the real download link.", link: "download-hunt.html", icon: "⬇️" },
    { day: 12, title: "New: Icon Match", desc: "Timed icon identification.", link: "icon-match.html", icon: "⏱️" },
    { day: 13, title: "New: Permission Police", desc: "Allow or block permission requests.", link: "permission-police.html", icon: "🛡️" },
    { day: 14, title: "New: Zoom & Fit Rescue", desc: "Fix broken zoom and full-screen.", link: "zoom-rescue.html", icon: "🔍" },
    { day: 15, title: "New: Form Pitstop", desc: "Timed form obstacle course.", link: "form-pitstop.html", icon: "📝" },
    { day: 16, title: "New: Hidden Setting Hunt", desc: "Scavenger hunt through settings.", link: "hidden-setting.html", icon: "🕵️" },
    { day: 17, title: "New: Where Did My Download Go?", desc: "Find downloaded files.", link: "where-download.html", icon: "📥" },
    { day: 18, title: "New: Cookie Banner Speedrun", desc: "Reject tracking in few clicks.", link: "cookie-banner.html", icon: "🍪" },
    { day: 19, title: "New: Address Bar vs Search Bar", desc: "Type URLs vs searches. Skip ads.", link: "address-bar.html", icon: "🔍" },
    { day: 20, title: "New: Bookmark Organizer", desc: "Sort bookmarks into folders.", link: "bookmark-organizer.html", icon: "📑" },
    { day: 21, title: "New: Chat App Relay", desc: "Reply, forward, react, delete.", link: "chat-relay.html", icon: "💬" },
    { day: 22, title: "New: File Explorer Rescue", desc: "Find, rename, move, trash files.", link: "file-explorer.html", icon: "📁" },
    { day: 23, title: "New: Photo & Doc Attachment", desc: "Attach the right file.", link: "attachment-challenge.html", icon: "📎" },
    { day: 24, title: "New: App Store Safety", desc: "Spot real apps among clones.", link: "app-store.html", icon: "📱" },
    { day: 25, title: "New: Share Sheet Master", desc: "Tap share, pick the right action.", link: "share-sheet.html", icon: "📤" },
    { day: 26, title: "New: Storage Full Clean-Up", desc: "Free up space.", link: "storage-full.html", icon: "💾" },
    { day: 27, title: "New: Notification Control", desc: "Mute chats, manage notifications.", link: "notification-control.html", icon: "🔔" },
    { day: 28, title: "New: Unzip & Open", desc: "Extract and open zipped photos.", link: "unzip-open.html", icon: "📦" },
    { day: 29, title: "New: Reverse Mode", desc: "Design tricky pages, watch a bot.", link: "reverse-mode.html", icon: "🎭" },
    { day: 30, title: "New: Tech Support Career", desc: "Fix broken screens before time runs out.", link: "tech-support.html", icon: "📞" },
    { day: 31, title: "New: Browser Pet", desc: "Adopt a pixel pet.", link: "browser-pet.html", icon: "🐾" },
    { day: 32, title: "New: Party Mode", desc: "2-player pass-and-play battles.", link: "party-mode.html", icon: "🎉" },
    { day: 33, title: "New: Roguelike Chaos", desc: "Endless waves with upgrades and curses.", link: "roguelike-chaos.html", icon: "🌀" },
    { day: 34, title: "New: Scam Generator", desc: "Procedurally generated scams.", link: "scam-generator.html", icon: "🎲" },
    { day: 35, title: "New: Mystery Virus", desc: "Fix a broken computer every round.", link: "mystery-virus.html", icon: "🦠" },
  ];

  function getVisitDay() {
    const start = localStorage.getItem("bb-start-date");
    if (!start) {
      localStorage.setItem("bb-start-date", new Date().toDateString());
      return 0;
    }
    const startDate = new Date(start);
    const now = new Date();
    const diff = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }

  function getUnlockedContent() {
    const day = getVisitDay();
    return SCHEDULE.filter((s) => s.day <= day);
  }

  function getNextUnlock() {
    const day = getVisitDay();
    return SCHEDULE.find((s) => s.day === day + 1);
  }

  function showContentDrip() {
    const next = getNextUnlock();
    if (!next) return;
    const day = getVisitDay();
    // Only show if there's new content today
    const todayUnlocked = SCHEDULE.filter((s) => s.day === day);
    if (todayUnlocked.length === 0) return;
    // Check if already shown today
    const lastShown = localStorage.getItem("bb-drip-shown");
    if (lastShown === String(day)) return;
    localStorage.setItem("bb-drip-shown", String(day));

    const today = todayUnlocked[todayUnlocked.length - 1];
    const toast = document.createElement("div");
    toast.style.cssText = "position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,var(--primary),#9b59b6);color:#fff;padding:14px 22px;border-radius:12px;font-size:1rem;font-weight:600;box-shadow:var(--shadow-lg);z-index:10000;animation:ul-slidein .3s ease;cursor:pointer;max-width:90vw;text-align:center";
    toast.innerHTML = today.icon + " <strong>" + today.title + "</strong><br><span style='font-size:.85rem;opacity:.9'>" + today.desc + "</span>";
    toast.addEventListener("click", () => { window.location.href = today.link; });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 6000);
    if (typeof Sound !== "undefined") Sound.success();
  }

  // Add "New" badges to home page cards
  function addNewBadges() {
    const day = getVisitDay();
    const unlocked = getUnlockedContent();
    const unlockedLinks = unlocked.map((s) => s.link);
    document.querySelectorAll(".module-card a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (unlockedLinks.includes(href)) {
        const card = a.closest(".module-card");
        if (card && !card.querySelector(".new-badge")) {
          const badge = document.createElement("span");
          badge.className = "new-badge";
          badge.style.cssText = "position:absolute;top:10px;right:10px;background:var(--good);color:#fff;padding:3px 8px;border-radius:99px;font-size:.7rem;font-weight:700";
          badge.textContent = "NEW";
          card.style.position = "relative";
          card.appendChild(badge);
        }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    showContentDrip();
    addNewBadges();
  });
})();
