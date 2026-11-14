/* =========================================================
   Browser Buddy — Safe-Mode Simulator
   Three pretend apps (email, browser, settings) with
   guided missions, hints, and gentle feedback.
   ========================================================= */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  /* =========================================================
     DATA — pretend content
     ========================================================= */

  const EMAIL_SEED = [
    {
      id: "grandma", folder: "inbox", from: "Grandma Rose", subject: "Sunday dinner",
      preview: "Bring your appetite and a story!",
      body: "Hi dear,\n\nSunday dinner is at 5. We're making your favorite pie. Bring your appetite!\n\nLove, Grandma",
      suspicious: false,
    },
    {
      id: "prize", folder: "inbox", from: "Prize Center", subject: "You won a prize!",
      preview: "Click here to claim your reward now.",
      body: "Congratulations! You have been selected to win a prize. Click the link below to claim it immediately!",
      suspicious: true,
    },
    {
      id: "newsletter", folder: "inbox", from: "Weekly Deals", subject: "50% off everything",
      preview: "This week only — big savings inside.",
      body: "Our biggest sale of the year is here. Save 50% on everything this week.",
      suspicious: false,
    },
    {
      id: "spam1", folder: "spam", from: "Unknown Sender", subject: "URGENT: your account",
      preview: "Your account needs attention right away.",
      body: "We noticed something unusual. Sign in right away to keep your account safe.",
      suspicious: true,
    },
    {
      id: "spam2", folder: "spam", from: "Free Gift Card", subject: "Claim your $1000 gift card",
      preview: "You earned a gift card. Claim it today.",
      body: "You have been chosen to receive a $1000 gift card. Claim it now before it expires!",
      suspicious: true,
    },
    {
      id: "sent1", folder: "sent", from: "Me", subject: "Photos from the trip",
      preview: "Here are the photos I promised.",
      body: "Here are the photos from the trip. Let me know which one is your favorite!",
      suspicious: false,
    },
    {
      id: "trash1", folder: "trash", from: "Old Newsletter", subject: "Last month's news",
      preview: "A newsletter you read a while ago.",
      body: "This newsletter was moved to the trash.",
      suspicious: false,
    },
  ];

  const PAGES = {
    home: {
      title: "Grandma's Recipes",
      html:
        "<h1>Grandma's Recipes</h1>" +
        "<p>Welcome! Pick a recipe to read.</p>" +
        '<div class="fake-links">' +
        '<button class="fake-link" data-action="link" data-id="pie">🥧 Apple Pie</button>' +
        '<button class="fake-link" data-action="link" data-id="soup">🍲 Chicken Soup</button>' +
        '<button class="fake-link" data-action="link" data-id="news">📰 Daily News</button>' +
        "</div>",
    },
    pie: {
      title: "Apple Pie",
      html:
        "<h1>Apple Pie</h1>" +
        "<p>Ingredients: apples, sugar, cinnamon, butter, pastry.</p>" +
        "<p>Bake at 180°C for 45 minutes.</p>" +
        '<p><button class="fake-link" data-action="link" data-id="home">← Back to recipes</button></p>',
    },
    soup: {
      title: "Chicken Soup",
      html:
        "<h1>Chicken Soup</h1>" +
        "<p>Ingredients: chicken, carrots, celery, noodles, broth.</p>" +
        "<p>Simmer gently for an hour.</p>" +
        '<p><button class="fake-link" data-action="link" data-id="home">← Back to recipes</button></p>',
    },
    news: {
      title: "Daily News",
      html: "<h1>Daily News</h1><p>Today's top stories from around town.</p>",
    },
    weather: {
      title: "Weather",
      html: "<h1>Weather</h1><p>Today: sunny and 22°C. Tomorrow: light rain.</p>",
    },
    newtab: {
      title: "New Tab",
      html:
        "<h2>Where would you like to go?</h2>" +
        '<div class="fake-links">' +
        '<button class="fake-link" data-action="link" data-id="news">📰 Daily News</button>' +
        '<button class="fake-link" data-action="link" data-id="home">🥧 Grandma\'s Recipes</button>' +
        '<button class="fake-link" data-action="link" data-id="weather">🌤️ Weather</button>' +
        "</div>",
    },
  };

  /* =========================================================
     MISSIONS
     Each step: { action, id?, text, validate? }
     ========================================================= */

  const MISSIONS = [
    /* ---------- Pretend email ---------- */
    {
      id: "sim-email-open-grandma",
      app: "email",
      title: "Open a friendly email",
      plain: "Practice opening an email from someone you know.",
      steps: [
        { action: "folder-inbox", text: 'Click "Inbox" in the left sidebar.' },
        { action: "email", id: "grandma", text: "Click the email from Grandma Rose." },
      ],
      done: "You opened the email. That's all there is to reading email!",
    },
    {
      id: "sim-email-block-spam",
      app: "email",
      title: "Block a suspicious sender",
      plain: "Practice finding the Spam folder and blocking a sender.",
      steps: [
        { action: "folder-spam", text: 'Click "Spam" in the left sidebar.' },
        { action: "email", id: "spam1", text: 'Click the email from "Unknown Sender".' },
        { action: "block", text: 'Click "Block sender".' },
        { action: "confirm-block", text: 'Click "Block" to confirm.' },
      ],
      done: "You blocked the sender. Their emails will go straight to Spam from now on.",
    },
    {
      id: "sim-email-delete-prize",
      app: "email",
      title: "Delete a tricky email",
      plain: "Practice deleting an email that claims you won a prize.",
      steps: [
        { action: "folder-inbox", text: 'Click "Inbox" in the left sidebar.' },
        { action: "email", id: "prize", text: 'Click the email called "You won a prize!".' },
        { action: "delete", text: 'Click "Delete" at the top.' },
      ],
      done: "Deleted! The email moved to the Trash. Prize scams like that one are never real.",
    },

    /* ---------- Pretend browser ---------- */
    {
      id: "sim-browser-newtab-bookmark",
      app: "browser",
      title: "Open a new tab and save a page",
      plain: "Practice opening a new tab and bookmarking a page you like.",
      steps: [
        { action: "new-tab", text: "Click the ＋ button to open a new tab." },
        { action: "bookmark", text: "Click the star to save this page." },
      ],
      done: "You bookmarked the page. The star turns solid when a page is saved.",
    },
    {
      id: "sim-browser-type-address",
      app: "browser",
      title: "Type a web address",
      plain: "Practice typing an address and going to a page.",
      steps: [
        { action: "address", text: "Click the address bar at the top." },
        {
          action: "go",
          text: "Type a different address and click \"Go\" (or press Enter).",
          validate: function () {
            const v = $("#browser-address").value.trim();
            return v.length > 0 && v !== activeTab().url;
          },
        },
      ],
      done: "You navigated to a new page by typing its address. Great job!",
    },
    {
      id: "sim-browser-go-back",
      app: "browser",
      title: "Go back a page",
      plain: "Practice using the Back button.",
      steps: [
        { action: "link", id: "pie", text: 'Click the "Apple Pie" link on the page.' },
        { action: "back", text: "Click the Back arrow (←) at the top left." },
      ],
      done: "You went back to the previous page. The Back arrow always returns you to where you were.",
    },
    {
      id: "sim-browser-close-tab",
      app: "browser",
      title: "Close an extra tab",
      plain: "Practice opening and closing a tab.",
      steps: [
        { action: "new-tab", text: "Click ＋ to open a new tab." },
        { action: "close-tab", text: "Click the × on the new tab to close it." },
      ],
      done: "You closed the tab. Closing tabs you don't need keeps things tidy.",
    },
    {
      id: "sim-browser-zoom-in",
      app: "browser",
      title: "Zoom in to read better",
      plain: "Practice making the words bigger.",
      steps: [
        { action: "zoom-in", text: 'Click the "A＋" button to make the text bigger.' },
        { action: "zoom-out", text: 'Click the "A−" button to make it smaller again.' },
      ],
      done: "You changed the zoom. Bigger text is easier to read!",
    },

    /* ---------- Pretend settings ---------- */
    {
      id: "sim-settings-dark-mode",
      app: "settings",
      title: "Turn on dark mode",
      plain: "Practice finding Display settings and turning on dark mode.",
      steps: [
        { action: "cat-display", text: 'Click "Display" in the settings list.' },
        { action: "toggle", id: "dark", text: 'Click the switch next to "Dark mode".' },
      ],
      done: "Dark mode is on. See how the window turned dark? You can always switch it back.",
    },
    {
      id: "sim-settings-turn-off-sounds",
      app: "settings",
      title: "Turn off notification sounds",
      plain: "Practice finding sound settings.",
      steps: [
        { action: "cat-sound", text: 'Click "Sound & Notifications".' },
        { action: "toggle", id: "sounds", text: 'Click the switch next to "Notification sounds".' },
      ],
      done: "Notification sounds are off. Your device will stay quiet now.",
    },
    {
      id: "sim-settings-bigger-text",
      app: "settings",
      title: "Make the text bigger",
      plain: "Practice making text easier to read.",
      steps: [
        { action: "cat-display", text: 'Click "Display" in the settings list.' },
        { action: "text-bigger", text: 'Click "A＋" to make the text bigger.' },
      ],
      done: "The text got bigger. You can make it smaller again any time.",
    },

    /* ---------- More pretend email ---------- */
    {
      id: "sim-email-reply",
      app: "email",
      title: "Reply to an email",
      plain: "Practice writing a reply to someone.",
      steps: [
        { action: "folder-inbox", text: 'Click "Inbox".' },
        { action: "email", id: "grandma", text: "Click the email from Grandma Rose." },
        { action: "reply", text: 'Click "Reply".' },
      ],
      done: "You started a reply. Just type your message and send!",
    },
    {
      id: "sim-email-forward",
      app: "email",
      title: "Forward an email",
      plain: "Practice sending an email to someone else.",
      steps: [
        { action: "folder-inbox", text: 'Click "Inbox".' },
        { action: "email", id: "newsletter", text: "Click the newsletter email." },
        { action: "forwardmail", text: 'Click "Forward".' },
      ],
      done: "You started forwarding. Add a recipient and send!",
    },

    /* ---------- More pretend browser ---------- */
    {
      id: "sim-browser-bookmark",
      app: "browser",
      title: "Bookmark a page",
      plain: "Practice saving a page you like.",
      steps: [
        { action: "bookmark", text: "Click the star to bookmark this page." },
      ],
      done: "Bookmarked! The star turns solid. Find it in your bookmarks later.",
    },
    {
      id: "sim-browser-open-newtab",
      app: "browser",
      title: "Open a link in a new tab",
      plain: "Practice opening a link without losing your page.",
      steps: [
        { action: "link", id: "news", text: 'Right-click "Daily News" — or just click it to navigate.' },
      ],
      done: "You navigated to a new page. Use the Back arrow to return.",
    },

    /* ---------- More pretend settings ---------- */
    {
      id: "sim-settings-notifications",
      app: "settings",
      title: "Turn off notifications",
      plain: "Practice finding notification settings.",
      steps: [
        { action: "cat-sound", text: 'Click "Sound & Notifications".' },
        { action: "toggle", id: "clicks", text: 'Click the switch next to "Sound on button clicks".' },
      ],
      done: "Button click sounds are off. Your device will be quieter.",
    },
    {
      id: "sim-settings-privacy",
      app: "settings",
      title: "Turn off location sharing",
      plain: "Practice protecting your privacy.",
      steps: [
        { action: "cat-privacy", text: 'Click "Privacy".' },
        { action: "toggle", id: "location", text: 'Click the switch next to "Location access".' },
      ],
      done: "Location access is off. Apps can't see where you are now.",
    },

    /* ---------- Pretend chat ---------- */
    {
      id: "sim-chat-send",
      app: "chat",
      title: "Send a chat message",
      plain: "Practice sending a message in a chat app.",
      steps: [
        { action: "contact-mom", text: 'Click "Mom" in the contacts list.' },
        { action: "chat-send", text: "Type a message and click Send. (Type anything.)" },
      ],
      done: "Message sent! Chat apps work just like texting.",
    },
    {
      id: "sim-chat-switch",
      app: "chat",
      title: "Switch conversations",
      plain: "Practice switching between chat contacts.",
      steps: [
        { action: "contact-bob", text: 'Click "Uncle Bob" in the contacts list.' },
        { action: "contact-sarah", text: 'Click "Sarah" in the contacts list.' },
        { action: "contact-mom", text: 'Click "Mom" to go back.' },
      ],
      done: "You switched between conversations. Easy!",
    },
    {
      id: "sim-chat-attach",
      app: "chat",
      title: "Attach a file in chat",
      plain: "Practice attaching a file to a message.",
      steps: [
        { action: "contact-mom", text: 'Click "Mom" in the contacts list.' },
        { action: "chat-attach", text: 'Click the paperclip (📎) to attach a file.' },
      ],
      done: "Attachment option opened. In a real app, you'd pick a file.",
    },

    /* ---------- Pretend phone ---------- */
    {
      id: "sim-phone-dial",
      app: "phone",
      title: "Make a phone call",
      plain: "Practice dialing a number and calling.",
      steps: [
        { action: "phone-call", text: 'Tap the "Call" app icon.' },
        { action: "key-5", text: "Press a number on the keypad." },
        { action: "phone-dial", text: 'Tap "Call" to dial.' },
      ],
      done: "Call started! Tap Hang up when you're done.",
    },
    {
      id: "sim-phone-hangup",
      app: "phone",
      title: "End a call",
      plain: "Practice hanging up a call.",
      steps: [
        { action: "phone-call", text: 'Tap the "Call" app icon.' },
        { action: "key-1", text: "Press a number." },
        { action: "phone-dial", text: 'Tap "Call".' },
        { action: "phone-hangup", text: 'Tap "Hang up" to end the call.' },
      ],
      done: "Call ended. You hung up successfully!",
    },
    {
      id: "sim-phone-mute",
      app: "phone",
      title: "Mute during a call",
      plain: "Practice muting yourself during a call.",
      steps: [
        { action: "phone-call", text: 'Tap the "Call" app icon.' },
        { action: "key-2", text: "Press a number." },
        { action: "phone-dial", text: 'Tap "Call".' },
        { action: "phone-mute", text: 'Tap "Mute" during the call.' },
      ],
      done: "You muted yourself. Tap Mute again to unmute.",
    },
  ];

  /* =========================================================
     STATE
     ========================================================= */

  function freshEmail() {
    return {
      folder: "inbox",
      selected: null,
      messages: EMAIL_SEED.map((m) => Object.assign({}, m)),
      blocked: [],
    };
  }

  function freshBrowser() {
    return {
      tabs: [{
        id: 1,
        title: "Grandma's Recipes",
        page: "home",
        url: "recipes.example.com",
        bookmarked: false,
        history: [{ page: "home", url: "recipes.example.com" }],
        hi: 0,
      }],
      active: 1,
      zoom: 1,
      nextTabId: 2,
    };
  }

  function freshSettings() {
    return {
      panel: "home",
      dark: false,
      sounds: true,
      clicks: false,
      bigText: false,
      shareData: true,
      location: true,
    };
  }

  function freshChat() {
    return {
      contact: "mom",
      messages: {
        mom: [
          { from: "Mom", text: "Hi! How are you?", mine: false },
          { from: "Me", text: "I'm good, thanks!", mine: true },
        ],
        bob: [
          { from: "Uncle Bob", text: "Check out this photo!", mine: false, hasPhoto: true },
        ],
        sarah: [
          { from: "Sarah", text: "Happy birthday! 🎂", mine: false },
        ],
        group: [
          { from: "Mom", text: "Family dinner Sunday?", mine: false },
          { from: "Uncle Bob", text: "I'll be there!", mine: false },
        ],
      },
      selectedMsg: null,
    };
  }

  function freshPhone() {
    return {
      screen: "home", // home, dialer, calling
      number: "",
      caller: "",
      muted: false,
      speaker: false,
      timer: 0,
      timerInterval: null,
    };
  }

  let appState = {
    email: freshEmail(),
    browser: freshBrowser(),
    chat: freshChat(),
    phone: freshPhone(),
    settings: freshSettings(),
  };

  let activeApp = "email";
  let currentMission = null;
  let stepIndex = 0;
  let inactivityTimer = null;

  function activeTab() {
    const b = appState.browser;
    return b.tabs.find((t) => t.id === b.active) || b.tabs[0];
  }

  /* =========================================================
     RENDERING
     ========================================================= */

  function renderApp() {
    if (activeApp === "email") renderEmail();
    else if (activeApp === "browser") renderBrowser();
    else if (activeApp === "chat") renderChat();
    else if (activeApp === "phone") renderPhone();
    else renderSettings();
  }

  /* ---------- Fake email ---------- */
  function renderEmail() {
    const s = appState.email;

    $$(".email-folder").forEach((btn) => {
      const folder = btn.dataset.action.replace("folder-", "");
      btn.classList.toggle("active", folder === s.folder);
      const badge = btn.querySelector(".badge");
      if (badge) {
        const count = s.messages.filter((m) => m.folder === folder).length;
        badge.style.display = count ? "" : "none";
        badge.textContent = count;
      }
    });

    const list = $("#email-list");
    const msgs = s.messages.filter((m) => m.folder === s.folder);
    list.innerHTML = msgs.length ? "" : '<div class="empty-note">Nothing here right now.</div>';

    msgs.forEach((m) => {
      const el = document.createElement("button");
      el.className = "email-item" + (s.selected === m.id ? " selected" : "");
      el.dataset.action = "email";
      el.dataset.id = m.id;
      el.innerHTML =
        '<span class="email-from">' + (m.suspicious ? "⚠️ " : "") + escapeHtml(m.from) + "</span>" +
        '<span class="email-subject">' + escapeHtml(m.subject) + "</span>" +
        '<span class="email-preview">' + escapeHtml(m.preview) + "</span>";
      list.appendChild(el);
    });

    const reading = $("#email-reading");
    const sel = s.messages.find((m) => m.id === s.selected);
    if (sel) {
      reading.innerHTML =
        '<div class="email-reading-head"><h3>' + escapeHtml(sel.subject) + "</h3>" +
        "<p>From: <strong>" + escapeHtml(sel.from) + "</strong></p></div>" +
        '<div class="email-body">' + escapeHtml(sel.body).replace(/\n/g, "<br>") + "</div>" +
        (sel.suspicious
          ? '<div class="safety-note">⚠️ This message looks suspicious. Be careful with links, and never share your password.</div>'
          : "");
    } else {
      reading.innerHTML = '<div class="empty-note">Click an email to read it here.</div>';
    }

    const selMsg = s.messages.find((m) => m.id === s.selected);
    $("[data-action='delete']").disabled = !selMsg;
    $("[data-action='move-spam']").disabled = !selMsg;
    $("[data-action='block']").disabled = !selMsg;
    const replyBtn = $("[data-action='reply']");
    if (replyBtn) replyBtn.disabled = !selMsg;
    const fwdBtn = $("[data-action='forwardmail']");
    if (fwdBtn) fwdBtn.disabled = !selMsg;
  }

  /* ---------- Fake browser ---------- */
  function renderBrowser() {
    const b = appState.browser;
    const tabbar = $("#browser-tabs");
    tabbar.innerHTML = "";

    b.tabs.forEach((t) => {
      const el = document.createElement("div");
      el.className = "browser-tab" + (t.id === b.active ? " active" : "");
      el.dataset.action = "tab";
      el.dataset.id = String(t.id);
      el.innerHTML =
        '<span class="tab-title">' + escapeHtml(t.title) + "</span>" +
        '<span class="tab-book">' + (t.bookmarked ? "★" : "") + "</span>" +
        '<button class="tab-close" data-action="close-tab" data-id="' + t.id + '" title="Close tab" aria-label="Close tab">×</button>';
      tabbar.appendChild(el);
    });

    const addBtn = document.createElement("button");
    addBtn.className = "browser-newtab";
    addBtn.dataset.action = "new-tab";
    addBtn.textContent = "＋";
    addBtn.title = "Open a new tab";
    addBtn.setAttribute("aria-label", "Open a new tab");
    tabbar.appendChild(addBtn);

    const t = activeTab();
    $("#browser-address").value = t.url;
    $("[data-action='back']").disabled = t.hi <= 0;
    $("[data-action='forward']").disabled = t.hi >= t.history.length - 1;

    const star = $("[data-action='bookmark']");
    star.textContent = t.bookmarked ? "★" : "☆";
    star.classList.toggle("bookmarked", t.bookmarked);

    const content = $("#browser-content");
    if (t.page === "typed") {
      content.innerHTML =
        "<h1>" + escapeHtml(t.url) + "</h1>" +
        "<p>Good job — you went to a new page by typing its address!</p>" +
        "<p><em>(Practice page — nothing here is real.)</em></p>";
    } else {
      const page = PAGES[t.page];
      content.innerHTML = page ? page.html : "<p>Page not found.</p>";
    }
    content.style.fontSize = Math.round(b.zoom * 100) + "%";
    $("#zoom-label").textContent = Math.round(b.zoom * 100) + "%";
  }

  /* ---------- Fake settings ---------- */
  function settingRow(title, desc, id, pressed) {
    return (
      '<div class="setting-row"><div><strong>' + title + "</strong><p>" + desc + "</p></div>" +
      '<button class="switch" data-action="toggle" data-id="' + id + '" aria-pressed="' + pressed +
      '" aria-label="' + title + '"><span class="knob"></span></button></div>'
    );
  }

  function renderSettings() {
    const s = appState.settings;
    const pane = $("#pane-settings");
    pane.classList.toggle("dark", s.dark);
    pane.classList.toggle("big-text", s.bigText);

    $$(".settings-item").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.action === "cat-" + s.panel);
    });

    const panel = $("#settings-panel");
    if (s.panel === "display") {
      panel.innerHTML =
        "<h3>Display</h3>" +
        '<div class="setting-row"><div><strong>Dark mode</strong><p>Make the screen darker and easier on the eyes.</p></div>' +
        '<button class="switch" data-action="toggle" data-id="dark" aria-pressed="' + s.dark +
        '" aria-label="Dark mode"><span class="knob"></span></button></div>' +
        '<div class="setting-row"><div><strong>Text size</strong><p>Make the words bigger or smaller.</p></div>' +
        '<div class="seg"><button data-action="text-smaller" ' + (s.bigText ? "" : "disabled") + ">A−</button>" +
        '<button data-action="text-bigger" ' + (s.bigText ? "disabled" : "") + ">A＋</button></div></div>";
    } else if (s.panel === "sound") {
      panel.innerHTML =
        "<h3>Sound &amp; Notifications</h3>" +
        settingRow("Notification sounds", "Play a sound when a new notification arrives.", "sounds", s.sounds) +
        settingRow("Sound on button clicks", "Play a small click sound when you press buttons.", "clicks", s.clicks);
    } else if (s.panel === "privacy") {
      panel.innerHTML =
        "<h3>Privacy</h3>" +
        settingRow("Share usage data", "Send anonymous information that helps improve the app.", "shareData", s.shareData) +
        settingRow("Location access", "Let the app know your approximate location.", "location", s.location);
    } else {
      panel.innerHTML = '<div class="empty-note">👈 Choose a category on the left.</div>';
    }
  }

  /* ---------- Fake chat ---------- */
  const CHAT_CONTACTS = {
    mom: "Mom",
    bob: "Uncle Bob",
    sarah: "Sarah",
    group: "Family Group",
  };

  function renderChat() {
    const s = appState.chat;
    // contacts
    $$(".chat-contact").forEach((btn) => {
      const c = btn.dataset.action.replace("contact-", "");
      btn.classList.toggle("active", c === s.contact);
    });
    // header
    $("#chat-header").textContent = CHAT_CONTACTS[s.contact] || s.contact;
    // messages
    const msgs = $("#chat-messages");
    msgs.innerHTML = "";
    (s.messages[s.contact] || []).forEach((m) => {
      const el = document.createElement("div");
      el.className = "chat-msg " + (m.mine ? "mine" : "theirs");
      el.innerHTML = escapeHtml(m.text) + (m.hasPhoto ? " 📷" : "") + '<div class="meta">' + m.from + "</div>";
      msgs.appendChild(el);
    });
    msgs.scrollTop = msgs.scrollHeight;
  }

  /* ---------- Fake phone ---------- */
  function renderPhone() {
    const s = appState.phone;
    const dialer = $("#phone-dialer");
    const callScreen = $("#phone-call-screen");
    const apps = document.querySelector(".phone-apps");
    if (s.screen === "home") {
      if (apps) apps.style.display = "grid";
      if (dialer) dialer.style.display = "none";
      if (callScreen) callScreen.style.display = "none";
    } else if (s.screen === "dialer") {
      if (apps) apps.style.display = "none";
      if (dialer) dialer.style.display = "block";
      if (callScreen) callScreen.style.display = "none";
      $("#phone-number").textContent = s.number || "";
    } else if (s.screen === "calling") {
      if (apps) apps.style.display = "none";
      if (dialer) dialer.style.display = "none";
      if (callScreen) callScreen.style.display = "block";
      $("#phone-caller").textContent = s.caller;
      $("#phone-timer").textContent = s.timer + "s";
    }
  }

  /* ---------- Mission panel + list ---------- */
  function renderMissionPanel() {
    const panel = $("#mission-panel");

    if (!currentMission) {
      panel.innerHTML =
        '<div class="mission-tag">Practice mode</div>' +
        "<h2>Your mission</h2>" +
        '<p class="muted">Pick a mission below to get step-by-step guidance, or just click around the pretend app to explore.</p>' +
        '<div class="tip-box">💡 Stuck? Use the <strong>Show me where</strong> button. If you wait 10 seconds, I\'ll point the way automatically.</div>';
      return;
    }

    const m = currentMission;
    const pct = Math.round((stepIndex / m.steps.length) * 100);
    const stepsHtml = m.steps.map((s, i) => {
      const cls = i < stepIndex ? "done" : i === stepIndex ? "current" : "todo";
      const mark = i < stepIndex ? "✓" : i + 1;
      return '<li class="' + cls + '"><span class="step-num">' + mark + "</span><span>" + escapeHtml(s.text) + "</span></li>";
    }).join("");

    panel.innerHTML =
      '<div class="mission-tag">Guided mission</div>' +
      "<h2>" + escapeHtml(m.title) + "</h2>" +
      '<p class="mission-plain">' + escapeHtml(m.plain) + "</p>" +
      '<div class="mission-progress"><div class="mission-progress-fill" style="width:' + pct + '%"></div></div>' +
      '<ol class="steps">' + stepsHtml + "</ol>" +
      '<button class="btn btn-primary btn-big" id="hint-btn">💡 Show me where</button>' +
      '<button class="btn btn-ghost" id="stop-mission-btn">Stop mission</button>';

    $("#hint-btn").addEventListener("click", () => {
      if (currentMission && currentMission.steps[stepIndex]) {
        showStepHint(currentMission.steps[stepIndex]);
      }
    });
    $("#stop-mission-btn").addEventListener("click", stopMission);
  }

  function renderMissionList() {
    const wrap = $("#mission-list");
    const names = { email: "Pretend email", browser: "Pretend web browser", chat: "Pretend chat", phone: "Pretend phone", settings: "Pretend settings" };
    let html = "<h3>Missions — " + names[activeApp] + "</h3>";
    html += '<div class="mission-list-items">';

    missionForApp(activeApp).forEach((m) => {
      const done = BB.isDone(m.id);
      const isActive = currentMission && currentMission.id === m.id;
      html +=
        '<button class="mission-item' + (done ? " done" : "") + (isActive ? " active" : "") +
        '" data-mission="' + m.id + '">' +
        '<span class="mission-check">' + (done ? "✓" : "○") + "</span>" +
        "<span><strong>" + escapeHtml(m.title) + "</strong><small>" + escapeHtml(m.plain) + "</small></span></button>";
    });

    html += "</div>";
    wrap.innerHTML = html;

    $$(".mission-item", wrap).forEach((btn) => {
      btn.addEventListener("click", () => startMission(btn.dataset.mission));
    });
  }

  /* =========================================================
     MISSION ENGINE
     ========================================================= */

  function missionForApp(app) {
    return MISSIONS.filter((m) => m.app === app);
  }

  function resetApp(app) {
    if (app === "email") appState.email = freshEmail();
    else if (app === "browser") appState.browser = freshBrowser();
    else if (app === "chat") appState.chat = freshChat();
    else if (app === "phone") appState.phone = freshPhone();
    else if (app === "settings") appState.settings = freshSettings();
    renderApp();
  }

  function setActiveApp(app) {
    activeApp = app;
    $$(".app-pane").forEach((p) => p.classList.toggle("active", p.dataset.app === app));
    $$(".app-tab").forEach((t) => t.classList.toggle("active", t.dataset.app === app));
    const names = { email: "Practice Mail", browser: "Practice Browser", chat: "Practice Chat", phone: "Practice Phone", settings: "Practice Settings" };
    $("#app-title").textContent = names[app];
    renderApp();
    renderMissionList();
  }

  function findStepElement(step) {
    let sel = "[data-action='" + step.action + "']";
    if (step.id) sel += "[data-id='" + step.id + "']";
    return $(sel);
  }

  function showStepHint(step) {
    const el = findStepElement(step);
    if (el) BB.showHint(el, step.text);
    else BB.toast("Look for: " + step.text, "info", 3000);
  }

  function startMission(id) {
    const m = MISSIONS.find((x) => x.id === id);
    if (!m) return;
    currentMission = m;
    stepIndex = 0;
    resetApp(m.app);
    setActiveApp(m.app);
    renderMissionPanel();
    renderMissionList();
    BB.hideHint();
    resetInactivity();
    BB.toast("Mission started: " + m.title, "info", 2200);
    if (typeof Sound !== "undefined") Sound.speak(m.title + ". " + m.plain);
  }

  function stopMission() {
    currentMission = null;
    stepIndex = 0;
    BB.hideHint();
    renderMissionPanel();
    renderMissionList();
  }

  function completeMission() {
    const m = currentMission;
    if (typeof Sound !== "undefined") { Sound.complete(); Sound.confetti(); }
    if (typeof Sound !== "undefined") Sound.speak("You did it! " + m.done);
    BB.completeMission(m.id);
    BB.renderProgressChip();
    BB.hideHint();
    currentMission = null;
    stepIndex = 0;
    renderMissionList();

    const panel = $("#mission-panel");
    panel.innerHTML =
      '<div class="mission-complete"><div class="confetti">🎉</div>' +
      "<h2>You did it!</h2>" +
      "<p>" + escapeHtml(m.done) + "</p>" +
      '<div class="mission-actions">' +
      '<button class="btn btn-primary btn-big" id="next-mission-btn">Next mission</button>' +
      '<button class="btn btn-ghost" id="free-practice-btn">Free practice</button>' +
      "</div></div>";

    $("#next-mission-btn").addEventListener("click", () => {
      const next = nextMission(m);
      if (next) startMission(next.id);
      else { currentMission = null; renderMissionPanel(); }
    });
    $("#free-practice-btn").addEventListener("click", () => {
      currentMission = null;
      renderMissionPanel();
    });

    BB.toast("🎉 Mission complete!", "good", 3000);
  }

  function nextMission(m) {
    const undone = MISSIONS.filter((x) => !BB.isDone(x.id));
    if (!undone.length) return null;
    const idx = MISSIONS.findIndex((x) => x.id === m.id);
    for (let i = idx + 1; i < MISSIONS.length; i++) {
      if (!BB.isDone(MISSIONS[i].id)) return MISSIONS[i];
    }
    return undone[0];
  }

  function matches(step, el) {
    if (el.dataset.action !== step.action) return false;
    if (step.id && el.dataset.id !== step.id) return false;
    return true;
  }

  function handleClick(el) {
    if (!el) return;
    resetInactivity();

    if (!currentMission) {
      applyAction(el);
      return;
    }

    const step = currentMission.steps[stepIndex];
    const valid = step && matches(step, el) && (!step.validate || step.validate());

    if (valid) {
      applyAction(el);
      stepIndex++;
      BB.hideHint();
      if (stepIndex >= currentMission.steps.length) {
        completeMission();
      } else {
        BB.toast("✓ Nice!", "good", 1100);
        renderMissionPanel();
        if (typeof Sound !== "undefined") Sound.speak(currentMission.steps[stepIndex].text);
      }
    } else {
      BB.toast("Not that one — " + (step ? step.text : "keep trying."), "warn", 2600);
    }
  }

  function resetInactivity() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      if (currentMission && currentMission.steps[stepIndex]) {
        showStepHint(currentMission.steps[stepIndex]);
        BB.toast("Take your time — I pointed the way.", "info", 3000);
      }
    }, 10000);
  }

  /* =========================================================
     ACTIONS — what happens when you click inside a pretend app
     ========================================================= */

  function applyAction(el) {
    const action = el.dataset.action;
    const id = el.dataset.id;

    switch (action) {

      /* ---------------- EMAIL ---------------- */
      case "folder-inbox":
      case "folder-spam":
      case "folder-sent":
      case "folder-trash": {
        appState.email.folder = action.replace("folder-", "");
        appState.email.selected = null;
        closeModal();
        renderEmail();
        break;
      }
      case "email": {
        appState.email.selected = id;
        renderEmail();
        break;
      }
      case "delete": {
        const s = appState.email;
        const msg = s.messages.find((m) => m.id === s.selected);
        if (!msg) break;
        if (msg.folder === "trash") {
          s.messages = s.messages.filter((m) => m.id !== msg.id);
          BB.toast("Deleted for good.", "good");
        } else {
          msg.folder = "trash";
          BB.toast("Moved to Trash.", "good");
        }
        s.selected = null;
        renderEmail();
        break;
      }
      case "move-spam": {
        const s = appState.email;
        const msg = s.messages.find((m) => m.id === s.selected);
        if (!msg) break;
        msg.folder = "spam";
        s.selected = null;
        renderEmail();
        BB.toast("Moved to Spam.", "good");
        break;
      }
      case "block": {
        const s = appState.email;
        const msg = s.messages.find((m) => m.id === s.selected);
        if (!msg) break;
        openModal();
        break;
      }
      case "confirm-block": {
        const s = appState.email;
        const msg = s.messages.find((m) => m.id === s.selected);
        if (msg) {
          s.blocked.push(msg.from);
          msg.folder = "spam";
          BB.toast("Sender blocked.", "good");
        }
        closeModal();
        renderEmail();
        break;
      }
      case "cancel-block": closeModal(); break;
      case "compose": BB.toast("Practice only — nothing is really sent.", "info"); break;
      case "reply": BB.toast("Practice only — your reply isn't really sent.", "info"); break;
      case "forwardmail": BB.toast("Practice only — nothing is really forwarded.", "info"); break;
      case "refresh": BB.toast("You're up to date!", "good"); break;

      /* ---------------- BROWSER ---------------- */
      case "new-tab": {
        const b = appState.browser;
        const t = {
          id: b.nextTabId++,
          title: "New Tab",
          page: "newtab",
          url: "new-tab",
          bookmarked: false,
          history: [{ page: "newtab", url: "new-tab" }],
          hi: 0,
        };
        b.tabs.push(t);
        b.active = t.id;
        renderBrowser();
        break;
      }
      case "close-tab": {
        const b = appState.browser;
        if (b.tabs.length <= 1) {
          BB.toast("You need at least one tab open.", "warn");
          break;
        }
        const closeId = Number(id);
        const idx = b.tabs.findIndex((t) => t.id === closeId);
        b.tabs = b.tabs.filter((t) => t.id !== closeId);
        if (b.active === closeId) {
          b.active = b.tabs[Math.max(0, idx - 1)].id;
        }
        renderBrowser();
        break;
      }
      case "tab": {
        appState.browser.active = Number(id);
        renderBrowser();
        break;
      }
      case "back": goBack(); break;
      case "forward": goForward(); break;
      case "reload": BB.toast("Page reloaded (practice).", "info"); break;
      case "address": break; // focusing happens naturally
      case "go": goToTyped(); break;
      case "bookmark": {
        const t = activeTab();
        t.bookmarked = !t.bookmarked;
        renderBrowser();
        BB.toast(t.bookmarked ? "Page saved to bookmarks." : "Bookmark removed.", "good");
        break;
      }
      case "menu": BB.toast("The three dots (⋮) hold more options. Practice only!", "info"); break;
      case "link": {
        const urlMap = {
          home: "recipes.example.com",
          pie: "recipes.example.com/apple-pie",
          soup: "recipes.example.com/chicken-soup",
          news: "news.example.com",
          weather: "weather.example.com",
        };
        navigate(activeTab(), id, urlMap[id] || id);
        renderBrowser();
        break;
      }
      case "zoom-in": {
        const b = appState.browser;
        b.zoom = Math.min(1.6, Math.round((b.zoom + 0.15) * 100) / 100);
        renderBrowser();
        break;
      }
      case "zoom-out": {
        const b = appState.browser;
        b.zoom = Math.max(0.8, Math.round((b.zoom - 0.15) * 100) / 100);
        renderBrowser();
        break;
      }

      /* ---------------- SETTINGS ---------------- */
      /* ---------------- CHAT ---------------- */
    case "contact-mom":
    case "contact-bob":
    case "contact-sarah":
    case "contact-group": {
      appState.chat.contact = action.replace("contact-", "");
      renderChat();
      break;
    }
    case "chat-send": {
      const input = document.querySelector("#chat-input");
      const text = input.value.trim();
      if (!text) { BB.toast("Type a message first.", "warn"); break; }
      const s = appState.chat;
      if (!s.messages[s.contact]) s.messages[s.contact] = [];
      s.messages[s.contact].push({ from: "Me", text: text, mine: true });
      input.value = "";
      renderChat();
      BB.toast("Sent!", "good", 1000);
      break;
    }
    case "chat-attach": {
      BB.toast("Practice only — nothing is really attached.", "info");
      break;
    }
    case "chat-emoji": {
      BB.toast("Practice only — emoji picker would open here.", "info");
      break;
    }

    /* ---------------- PHONE ---------------- */
    case "phone-call": {
      appState.phone.screen = "dialer";
      appState.phone.number = "";
      renderPhone();
      break;
    }
    case "phone-msg": {
      BB.toast("Practice only — messages app would open here.", "info");
      break;
    }
    case "phone-cam": {
      BB.toast("Practice only — camera would open here.", "info");
      break;
    }
    case "phone-settings": {
      BB.toast("Practice only — phone settings would open here.", "info");
      break;
    }
    case "phone-back": {
      appState.phone.screen = "home";
      renderPhone();
      break;
    }
    case "phone-dial": {
      const s = appState.phone;
      if (!s.number) { BB.toast("Enter a number first.", "warn"); break; }
      s.screen = "calling";
      s.caller = s.number;
      s.timer = 0;
      if (s.timerInterval) clearInterval(s.timerInterval);
      s.timerInterval = setInterval(() => {
        s.timer++;
        const el = document.querySelector("#phone-timer");
        if (el) el.textContent = Math.floor(s.timer / 60) + ":" + String(s.timer % 60).padStart(2, "0");
      }, 1000);
      renderPhone();
      BB.toast("Calling " + s.number + "...", "info");
      break;
    }
    case "phone-mute": {
      appState.phone.muted = !appState.phone.muted;
      renderPhone();
      BB.toast(appState.phone.muted ? "Muted." : "Unmuted.", "info", 1000);
      break;
    }
    case "phone-speaker": {
      appState.phone.speaker = !appState.phone.speaker;
      renderPhone();
      BB.toast(appState.phone.speaker ? "Speaker on." : "Speaker off.", "info", 1000);
      break;
    }
    case "phone-hangup": {
      const s = appState.phone;
      if (s.timerInterval) clearInterval(s.timerInterval);
      s.screen = "home";
      s.number = "";
      s.caller = "";
      s.timer = 0;
      renderPhone();
      BB.toast("Call ended.", "info", 1000);
      break;
    }
    case "key-0": case "key-1": case "key-2": case "key-3": case "key-4":
    case "key-5": case "key-6": case "key-7": case "key-8": case "key-9":
    case "key-star": case "key-hash": {
      const digit = action.replace("key-", "");
      const map = { star: "*", hash: "#" };
      appState.phone.number += map[digit] || digit;
      renderPhone();
      break;
    }

    /* ---------------- SETTINGS ---------------- */
    case "cat-display":
      case "cat-sound":
      case "cat-privacy": {
        appState.settings.panel = action.replace("cat-", "");
        renderSettings();
        break;
      }
      case "toggle": {
        const s = appState.settings;
        const map = { dark: "dark", sounds: "sounds", clicks: "clicks", shareData: "shareData", location: "location" };
        const key = map[id];
        if (key) {
          s[key] = !s[key];
          renderSettings();
        }
        break;
      }
      case "text-bigger": {
        appState.settings.bigText = true;
        renderSettings();
        break;
      }
      case "text-smaller": {
        appState.settings.bigText = false;
        renderSettings();
        break;
      }
    }
  }

  /* ---------- Browser helpers ---------- */
  function navigate(tab, page, url) {
    tab.history = tab.history.slice(0, tab.hi + 1);
    tab.history.push({ page: page, url: url });
    tab.hi = tab.history.length - 1;
    restoreEntry(tab);
  }

  function restoreEntry(tab) {
    const entry = tab.history[tab.hi];
    tab.page = entry.page;
    tab.url = entry.url;
    tab.title = entry.page === "typed" ? entry.url : (PAGES[entry.page] ? PAGES[entry.page].title : entry.url);
  }

  function goBack() {
    const t = activeTab();
    if (t.hi > 0) {
      t.hi--;
      restoreEntry(t);
      renderBrowser();
    } else {
      BB.toast("You can't go back any further.", "info");
    }
  }

  function goForward() {
    const t = activeTab();
    if (t.hi < t.history.length - 1) {
      t.hi++;
      restoreEntry(t);
      renderBrowser();
    } else {
      BB.toast("You can't go forward any further.", "info");
    }
  }

  function goToTyped() {
    const input = $("#browser-address");
    const val = input.value.trim();
    if (!val) {
      BB.toast("Type an address first, then click Go.", "warn");
      return;
    }
    if (val === activeTab().url) {
      BB.toast("You're already on that page.", "info");
      return;
    }
    const v = val.toLowerCase();
    let page = "typed";
    let url = val;
    if (v.indexOf("news") !== -1) { page = "news"; url = "news.example.com"; }
    else if (v.indexOf("recipe") !== -1 || v.indexOf("pie") !== -1) { page = "home"; url = "recipes.example.com"; }
    else if (v.indexOf("weather") !== -1) { page = "weather"; url = "weather.example.com"; }
    navigate(activeTab(), page, url);
    renderBrowser();
  }

  /* ---------- Modal helpers ---------- */
  function openModal() { $("#email-modal").hidden = false; }
  function closeModal() { const m = $("#email-modal"); if (m) m.hidden = true; }

  /* =========================================================
     SET UP
     ========================================================= */

  function init() {
    setActiveApp("email");
    renderMissionPanel();
    renderMissionList();

    $$(".app-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const app = tab.dataset.app;
        if (app === activeApp) return;
        if (currentMission) {
          currentMission = null;
          stepIndex = 0;
          BB.hideHint();
          BB.toast("Mission stopped — you switched apps.", "info");
        }
        setActiveApp(app);
      });
    });

    document.addEventListener("click", (e) => {
      if (!e.target || !e.target.closest) return;
      const el = e.target.closest("[data-action]");
      if (el) handleClick(el);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target && e.target.matches && e.target.matches("[data-action='address']")) {
        e.preventDefault();
        handleClick($("[data-action='go']"));
      }
    });

    const modal = $("#email-modal");
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });
    }

    resetInactivity();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
