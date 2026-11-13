/* =========================================================
   Browser Buddy — Icon Dictionary
   ========================================================= */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Icon data ---------- */
  const ICONS = [
    { id: "menu", glyph: "☰", name: "Hamburger menu", cat: "general", desc: "Opens a list of options or pages.", where: "Top corner of apps and websites.", tip: "It usually hides extra features. Tap it when you can't find something." },
    { id: "more", glyph: "⋮", name: "Three dots (more)", cat: "general", desc: "Shows more actions for this item.", where: "Next to posts, emails, and files.", tip: "Think of it as 'what else can I do here?'" },
    { id: "settings", glyph: "⚙️", name: "Settings / gear", cat: "settings", desc: "Opens settings to change how the app works.", where: "Top or bottom of most apps.", tip: "Look here to change text size, sounds, or privacy." },
    { id: "search", glyph: "🔍", name: "Search (magnifying glass)", cat: "general", desc: "Lets you type what you're looking for.", where: "Top of browsers, stores, and email.", tip: "Tap it, type a word, press Enter." },
    { id: "home", glyph: "🏠", name: "Home", cat: "general", desc: "Takes you back to the main page.", where: "Navigation bars.", tip: "Use it when you feel lost." },
    { id: "back", glyph: "←", name: "Back arrow", cat: "browser", desc: "Goes to the previous page.", where: "Top left of browsers.", tip: "It never deletes anything — it just moves back." },
    { id: "forward", glyph: "→", name: "Forward arrow", cat: "browser", desc: "Goes to the next page after going back.", where: "Next to the back arrow.", tip: "Only lights up after you've gone back." },
    { id: "refresh", glyph: "↻", name: "Refresh / reload", cat: "browser", desc: "Reloads the current page.", where: "Top of browsers.", tip: "Use it if a page looks broken or stuck." },
    { id: "newtab", glyph: "＋", name: "New tab", cat: "browser", desc: "Opens a fresh page in a new tab.", where: "Tab bar in browsers.", tip: "Your other tabs stay open." },
    { id: "bookmark", glyph: "⭐", name: "Bookmark (star)", cat: "browser", desc: "Saves this page so you can find it later.", where: "Address bar.", tip: "Filled star = already saved." },
    { id: "share", glyph: "↗️", name: "Share", cat: "general", desc: "Sends this page or file to someone.", where: "Almost everywhere.", tip: "Opens a list of apps to send it to." },
    { id: "copy", glyph: "📋", name: "Copy", cat: "general", desc: "Copies text or a link to your clipboard.", where: "Menus and toolbars.", tip: "Then use Paste to put it somewhere else." },
    { id: "trash", glyph: "🗑️", name: "Delete / trash", cat: "general", desc: "Moves something to the trash.", where: "Email, files, photos.", tip: "Usually not permanent — check the Trash folder." },
    { id: "reply", glyph: "↩️", name: "Reply", cat: "email", desc: "Writes a response to an email.", where: "Email apps.", tip: "Reply goes to the sender; Reply all goes to everyone." },
    { id: "forwardmail", glyph: "➡️", name: "Forward (email)", cat: "email", desc: "Sends an email to someone else.", where: "Email apps.", tip: "Good for sharing a message." },
    { id: "attach", glyph: "📎", name: "Attach (paperclip)", cat: "email", desc: "Adds a file to an email.", where: "When writing an email.", tip: "Tap it to pick a photo or document." },
    { id: "inbox", glyph: "📥", name: "Inbox", cat: "email", desc: "Where new emails arrive.", where: "Email sidebar.", tip: "The number shows unread emails." },
    { id: "spam", glyph: "⚠️", name: "Spam / warning", cat: "safety", desc: "Marks something as suspicious or junk.", where: "Email and security apps.", tip: "Don't open links in spam." },
    { id: "lock", glyph: "🔒", name: "Lock / secure", cat: "safety", desc: "Means the connection is private and safe.", where: "Address bar of websites.", tip: "Look for it before typing passwords." },
    { id: "unlock", glyph: "🔓", name: "Unlock", cat: "safety", desc: "Means the connection is NOT secure.", where: "Address bar.", tip: "Avoid typing personal info on these pages." },
    { id: "eye", glyph: "👁️", name: "Show / hide", cat: "general", desc: "Shows or hides a password or text.", where: "Login screens.", tip: "Tap to check your typing." },
    { id: "bell", glyph: "🔔", name: "Notifications", cat: "settings", desc: "Alerts and messages from an app.", where: "Settings and status bar.", tip: "You can turn these off." },
    { id: "mute", glyph: "🔇", name: "Mute", cat: "video", desc: "Turns off your microphone.", where: "Video calls.", tip: "Use it when you're not speaking." },
    { id: "camera", glyph: "📷", name: "Camera", cat: "video", desc: "Turns your camera on or off.", where: "Video calls.", tip: "Off means people can't see you." },
    { id: "hangup", glyph: "📞", name: "End call / hang up", cat: "video", desc: "Leaves the video call.", where: "Video calls.", tip: "Usually red." },
    { id: "raisehand", glyph: "✋", name: "Raise hand", cat: "video", desc: "Signals you want to speak.", where: "Video calls.", tip: "The host sees a hand icon next to your name." },
    { id: "record", glyph: "⏺️", name: "Record", cat: "video", desc: "Records the meeting.", where: "Video calls.", tip: "Everyone is usually notified." },
    { id: "download", glyph: "⬇️", name: "Download", cat: "general", desc: "Saves a file to your device.", where: "Browsers and apps.", tip: "Check your Downloads folder after." },
    { id: "upload", glyph: "⬆️", name: "Upload", cat: "general", desc: "Sends a file from your device.", where: "Forms and chat.", tip: "Pick the file from your device." },
    { id: "print", glyph: "🖨️", name: "Print", cat: "general", desc: "Sends the page to a printer.", where: "Menus.", tip: "You can also 'print' to a PDF." },
  ];

  const CATS = {
    all: "All icons",
    browser: "Browser",
    email: "Email",
    video: "Video calls",
    settings: "Settings",
    safety: "Safety",
  };

  /* ---------- State ---------- */
  let fcOrder = [];
  let fcIdx = 0;
  let fcRevealed = false;
  let qzScore = 0;
  let qzTotal = 0;
  let qzCurrent = null;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ---------- Tabs ---------- */
  function initTabs() {
    $$(".id-tab").forEach((t) => {
      t.addEventListener("click", () => {
        $$(".id-tab").forEach((x) => x.classList.remove("active"));
        t.classList.add("active");
        $$(".id-pane").forEach((p) => p.classList.remove("active"));
        $("#pane-" + t.dataset.tab).classList.add("active");
      });
    });
  }

  /* ---------- Browse ---------- */
  let activeCat = "all";
  let searchTerm = "";

  function renderGrid() {
    const grid = $("#id-grid");
    const filtered = ICONS.filter((ic) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return ic.name.toLowerCase().includes(q) || ic.desc.toLowerCase().includes(q) || ic.glyph.includes(q);
      }
      if (activeCat !== "all" && ic.cat !== activeCat) return false;
      return true;
    });
    grid.innerHTML = filtered
      .map(
        (ic) =>
          '<div class="id-tile" data-id="' + ic.id + '">' +
          '<div class="glyph">' + ic.glyph + "</div>" +
          '<div class="name">' + ic.name + "</div>" +
          '<div class="cat">' + CATS[ic.cat] + "</div></div>"
      )
      .join("");
    $$(".id-tile", grid).forEach((t) => {
      t.addEventListener("click", () => showDetail(t.dataset.id));
    });
  }

  function showDetail(id) {
    const ic = ICONS.find((x) => x.id === id);
    if (!ic) return;
    const d = $("#id-detail");
    d.innerHTML =
      '<div class="glyph">' + ic.glyph + "</div>" +
      "<h2>" + ic.name + "</h2>" +
      '<div class="where"><strong>Where you see it:</strong> ' + ic.where + "</div>" +
      "<p>" + ic.desc + "</p>" +
      '<div class="tip">💡 ' + ic.tip + "</div>";
    d.classList.add("show");
    d.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // inject detail container
  function injectDetail() {
    const pane = $("#pane-browse");
    const d = document.createElement("div");
    d.id = "id-detail";
    d.className = "id-detail";
    pane.appendChild(d);
  }

  function initBrowse() {
    injectDetail();
    $$(".id-filter").forEach((f) => {
      f.addEventListener("click", () => {
        $$(".id-filter").forEach((x) => x.classList.remove("active"));
        f.classList.add("active");
        activeCat = f.dataset.cat;
        renderGrid();
      });
    });
    $("#id-search").addEventListener("input", (e) => {
      searchTerm = e.target.value;
      renderGrid();
    });
    renderGrid();
  }

  /* ---------- Flashcards ---------- */
  function initFlashcards() {
    fcOrder = shuffle(ICONS.map((_, i) => i));
    fcIdx = 0;
    showFlashcard();
    $("#fc-show").addEventListener("click", () => {
      fcRevealed = true;
      $("#fc-name").style.display = "block";
      $("#fc-desc").style.display = "block";
      $("#fc-show").style.display = "none";
    });
    $("#fc-next").addEventListener("click", () => {
      fcIdx = (fcIdx + 1) % fcOrder.length;
      showFlashcard();
    });
  }

  function showFlashcard() {
    const ic = ICONS[fcOrder[fcIdx]];
    $("#fc-glyph").textContent = ic.glyph;
    $("#fc-name").textContent = ic.name;
    $("#fc-desc").textContent = ic.desc;
    $("#fc-name").style.display = "none";
    $("#fc-desc").style.display = "none";
    $("#fc-show").style.display = "inline-flex";
    fcRevealed = false;
    $("#fc-progress").textContent = "Card " + (fcIdx + 1) + " of " + ICONS.length;
  }

  /* ---------- Quiz ---------- */
  function newQuestion() {
    const correct = ICONS[Math.floor(Math.random() * ICONS.length)];
    const distractors = shuffle(ICONS.filter((x) => x.id !== correct.id)).slice(0, 3);
    const opts = shuffle([correct, ...distractors]);
    qzCurrent = { correct, opts };

    $("#qz-glyph").textContent = correct.glyph;
    $("#qz-question").textContent = "Which icon means: \"" + correct.desc + "\"?";
    $("#qz-options").innerHTML = opts
      .map((o) => '<button class="id-quiz-opt" data-id="' + o.id + '">' + o.glyph + "  " + o.name + "</button>")
      .join("");
    $$(".id-quiz-opt", $("#qz-options")).forEach((b) => {
      b.addEventListener("click", () => answerQuiz(b.dataset.id));
    });
    $("#qz-feedback").textContent = "";
    $("#qz-feedback").className = "id-quiz-feedback";
    $("#qz-next").style.display = "none";
  }

  function answerQuiz(pickedId) {
    qzTotal++;
    const correct = pickedId === qzCurrent.correct.id;
    if (correct) {
      qzScore++;
      if (typeof Sound !== "undefined") Sound.success();
      $("#qz-feedback").textContent = "✓ Correct!";
      $("#qz-feedback").className = "id-quiz-feedback good";
    } else {
      if (typeof Sound !== "undefined") Sound.error();
      $("#qz-feedback").textContent = "✗ The answer was " + qzCurrent.correct.name + " (" + qzCurrent.correct.glyph + ").";
      $("#qz-feedback").className = "id-quiz-feedback bad";
    }
    $$(".id-quiz-opt", $("#qz-options")).forEach((b) => {
      b.classList.add("disabled");
      if (b.dataset.id === qzCurrent.correct.id) b.classList.add("correct");
      else if (b.dataset.id === pickedId) b.classList.add("wrong");
    });
    $("#qz-next").style.display = "inline-flex";
    $("#qz-score").textContent = "Score: " + qzScore + " / " + qzTotal;
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    initBrowse();
    initFlashcards();
    newQuestion();
    $("#qz-next").addEventListener("click", newQuestion);
  });
})();
