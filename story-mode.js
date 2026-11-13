/* =========================================================
   Browser Buddy — Story Mode (interactive, hands-on)
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  const STORIES = [
    {
      title: "Help Grandma send her first email",
      avatar: "\u{1F475}", name: "Grandma Rose",
      steps: [
        { dialogue: "I want to send a message to my friend. Can you show me how?", scene: "You're at the email app. Folders on the left.", ui: '<div class="row"><button data-act="inbox">Inbox</button><button data-act="compose">Write</button><button data-act="spam">Spam</button></div>', action: "compose", lesson: "The Write button starts a new email.", hint: "Look for a button to start a new message.", feedback: "A new email window opened!" },
        { dialogue: "A new window opened! What do I do now?", scene: "New email: To, Subject, and a big text area.", ui: '<div class="row"><input id="sm-to" placeholder="To: friend@example.com" style="flex:1"><input id="sm-subj" placeholder="Subject" style="flex:1"></div><div class="row"><textarea id="sm-body" placeholder="Type your message" rows="2" style="flex:1;width:100%"></textarea></div><div class="row"><button data-act="send">Send</button><button data-act="draft">Save draft</button></div>', action: "send", validate: () => document.querySelector("#sm-to").value.trim() && document.querySelector("#sm-subj").value.trim() && document.querySelector("#sm-body").value.trim(), onAction: () => { const t=document.querySelector("#sm-to"),s=document.querySelector("#sm-subj"),b=document.querySelector("#sm-body"); if(!t.value.trim())t.value="friend@example.com"; if(!s.value.trim())s.value="Hello"; if(!b.value.trim())b.value="Hi! My first email."; }, lesson: "Fill To, Subject, message, then Send.", hint: "Fill in the recipient, title, and message, then send it.", feedback: "Email sent! (Practice)" },
        { dialogue: "I want to add a photo of my garden.", scene: "The email window has a paperclip.", ui: '<div class="row"><button data-act="attach">Attach file</button><button data-act="send2">Send</button></div>', action: "attach", lesson: "The paperclip attaches files.", hint: "Look for an icon that attaches files.", feedback: "Photo attached!" },
        { dialogue: "How do I check if they replied?", scene: "The inbox shows messages.", ui: '<div class="row"><button data-act="inbox">Check Inbox</button><button data-act="refresh">Refresh</button></div>', action: "inbox", lesson: "Inbox shows new messages. Refresh checks for new mail.", hint: "Where do new messages arrive?", feedback: "You checked your inbox!" },
        { dialogue: "I got a reply! How do I respond?", scene: "The reply email is open.", ui: '<div class="row"><button data-act="reply">Reply</button><button data-act="forward">Forward</button><button data-act="delete">Delete</button></div>', action: "reply", lesson: "Reply writes back to the sender.", hint: "How do you respond to a message?", feedback: "Reply started!" },
        { dialogue: "I want to send this email to my whole family.", scene: "The compose window is open.", ui: '<div class="row"><button data-act="replyall">Reply All</button><button data-act="forward2">Forward</button><button data-act="bcc">Add BCC</button></div>', action: "replyall", lesson: "Reply All sends to everyone in the conversation.", hint: "How do you respond to everyone?", feedback: "Reply All started!" },
        { dialogue: "How do I save a draft to finish later?", scene: "The email is half-written.", ui: '<div class="row"><button data-act="draft2">Save draft</button><button data-act="send3">Send now</button><button data-act="close">Close</button></div>', action: "draft2", lesson: "Save draft keeps your email for later.", hint: "How do you save without sending?", feedback: "Draft saved!" },
      ],
    },
    {
      title: "Help Uncle Bob fix his browser",
      avatar: "\u{1F468}", name: "Uncle Bob",
      steps: [
        { dialogue: "Everything is huge! I can only see one word.", scene: "The page is zoomed to 400%.", ui: '<div class="row"><button data-act="zoomout">Zoom out</button><button data-act="reset">Reset (100%)</button><button data-act="zoomin">Zoom in</button></div>', action: "reset", lesson: "Ctrl+0 resets zoom to 100%.", hint: "How do you get back to normal size?", feedback: "Zoom reset!" },
        { dialogue: "The page won't load — it just spins.", scene: "A spinning loading icon.", ui: '<div class="row"><button data-act="refresh">Refresh</button><button data-act="stop">Stop loading</button><button data-act="back">Back</button></div>', action: "refresh", lesson: "Refresh reloads a stuck page.", hint: "What reloads a stuck page?", feedback: "Page reloaded!" },
        { dialogue: "A pop-up asks for notifications. What do I do?", scene: "A notification permission prompt.", ui: '<div class="row"><button data-act="allow">Allow</button><button data-act="block">Block</button></div>', action: "block", lesson: "Block notification requests from unknown sites.", hint: "Which option stops notifications?", feedback: "Blocked! No spam." },
        { dialogue: "I have too many tabs open and it's slow.", scene: "8 tabs are open.", ui: '<div class="row"><button data-act="closetab">Close extra tabs</button><button data-act="newtab">Open new tab</button></div>', action: "closetab", lesson: "Close tabs you're not using to speed up.", hint: "How do you reduce clutter?", feedback: "Tabs closed. Faster now!" },
        { dialogue: "I want to go back to the previous page.", scene: "You're on a new page.", ui: '<div class="row"><button data-act="back">Back arrow</button><button data-act="forward">Forward</button><button data-act="home">Home</button></div>', action: "back", lesson: "The Back arrow returns to the previous page.", hint: "How do you return to the previous page?", feedback: "Went back!" },
        { dialogue: "The text is too small to read. How do I fix it?", scene: "The page is at 50% zoom.", ui: '<div class="row"><button data-act="zoomin2">Zoom in (+)</button><button data-act="reset2">Reset (100%)</button></div>', action: "reset2", lesson: "Ctrl+0 resets zoom. Or use A+ to zoom in.", hint: "How do you get back to normal size?", feedback: "Zoom reset to normal!" },
        { dialogue: "I accidentally closed a tab. Can I get it back?", scene: "A tab is missing.", ui: '<div class="row"><button data-act="reopen">Ctrl+Shift+T (reopen)</button><button data-act="newtab2">Open new tab</button><button data-act="history">Check history</button></div>', action: "reopen", lesson: "Ctrl+Shift+T reopens the last closed tab.", hint: "How do you undo a closed tab?", feedback: "Tab restored!" },
      ],
    },
    {
      title: "Help Sarah stay safe online",
      avatar: "\u{1F467}", name: "Sarah",
      steps: [
        { dialogue: "I got an email saying I won a free iPhone!", scene: "Email from 'prizes@winbig.example'.", ui: '<div class="row"><button data-act="delete">Delete</button><button data-act="claim">Claim now</button><button data-act="reply">Reply</button></div>', action: "delete", lesson: "If you didn't enter a contest, it's a scam. Delete it.", hint: "What removes something you don't want?", feedback: "Deleted! Good call." },
        { dialogue: "A website wants my password to 'verify my account'.", scene: "A page asks for email and password.", ui: '<div class="row"><input placeholder="Email" style="flex:1"><input type="password" placeholder="Password" style="flex:1"><button data-act="check">Check address bar</button><button data-act="submit">Submit</button></div>', action: "check", lesson: "Always check the address bar first.", hint: "What should you verify before typing a password?", feedback: "Smart! The address was fake." },
        { dialogue: "How do I make a strong password?", scene: "Creating a new account.", ui: '<div class="row"><button data-act="strong">Long mix of letters, numbers, symbols</button><button data-act="weak">password123</button><button data-act="birthday">My birthday</button></div>', action: "strong", lesson: "Long + mixed + unique = strong.", hint: "Which password is hardest to guess?", feedback: "Great choice!" },
        { dialogue: "How should I save my passwords?", scene: "Password management.", ui: '<div class="row"><button data-act="manager">Use a password manager</button><button data-act="notebook">Write in notebook</button><button data-act="same">Same password everywhere</button></div>', action: "manager", lesson: "A password manager remembers strong passwords.", hint: "What safely stores your passwords?", feedback: "Smart! Safest way." },
        { dialogue: "A link says 'Click here to verify your account'.", scene: "Suspicious link in an email.", ui: '<div class="row"><button data-act="hover">Hover to check the link</button><button data-act="click">Click it</button><button data-act="delete2">Delete email</button></div>', action: "hover", lesson: "Hover over links to see where they really go.", hint: "How do you check a link without clicking it?", feedback: "Smart! Always check before clicking." },
        { dialogue: "I want to log out of a shared computer.", scene: "You're done using a public computer.", ui: '<div class="row"><button data-act="logout">Log out</button><button data-act="close">Just close the browser</button><button data-act="minimize">Minimize the window</button></div>', action: "logout", lesson: "Always log out on shared computers.", hint: "How do you secure a shared computer?", feedback: "Logged out! Your account is safe." },
        { dialogue: "How do I turn on two-factor authentication?", scene: "Account security settings.", ui: '<div class="row"><button data-act="2fa">Enable 2FA</button><button data-act="skip">Skip for now</button><button data-act="password">Change password only</button></div>', action: "2fa", lesson: "2FA adds a second layer of security.", hint: "What adds a second security layer?", feedback: "2FA enabled! Much safer." },
      ],
    },
    {
      title: "Help Dad find his lost file",
      avatar: "\u{1F468}", name: "Dad",
      steps: [
        { dialogue: "I saved a document but can't find it!", scene: "File explorer shows folders.", ui: '<div class="row"><button data-act="downloads">Downloads</button><button data-act="documents">Documents</button><button data-act="pictures">Pictures</button></div>', action: "downloads", lesson: "Downloads go to the Downloads folder.", hint: "Where do browsers save files?", feedback: "Found it! Files usually go to Downloads." },
        { dialogue: "The name is wrong. How do I rename it?", scene: "File called 'untitled.pdf'.", ui: '<div class="row"><button data-act="rename">Right-click, Rename</button><button data-act="delete">Delete it</button><button data-act="open">Open it</button></div>', action: "rename", lesson: "Right-click, Rename changes the name.", hint: "How do you change a file name?", feedback: "Renamed! No need to start over." },
        { dialogue: "Now move it to Documents.", scene: "Downloads folder is open.", ui: '<div class="row"><button data-act="drag">Drag to Documents</button><button data-act="copy">Copy (leave original)</button><button data-act="email">Email to yourself</button></div>', action: "drag", lesson: "Drag and drop, or cut+paste.", hint: "How do you move a file to another folder?", feedback: "Moved! No duplicate left." },
        { dialogue: "I have duplicate files taking up space.", scene: "Two copies of the same file.", ui: '<div class="row"><button data-act="trash">Trash duplicate</button><button data-act="keep">Keep both</button><button data-act="rename2">Rename one</button></div>', action: "trash", lesson: "Trash duplicates to free space.", hint: "How do you remove extra copies?", feedback: "Trashed! Empty trash to finish." },
        { dialogue: "How do I find a file I downloaded last week?", scene: "The file explorer.", ui: '<div class="row"><button data-act="search">Use the search box</button><button data-act="scroll">Scroll through all files</button><button data-act="recent">Check Recent files</button></div>', action: "search", lesson: "The search box finds files fast.", hint: "What finds files quickly?", feedback: "Smart! Search is fastest." },
        { dialogue: "I want to share this file with a friend.", scene: "The file is selected.", ui: '<div class="row"><button data-act="share">Share</button><button data-act="copy2">Copy file</button><button data-act="print">Print it</button></div>', action: "share", lesson: "Share sends the file to someone.", hint: "How do you send a file to someone?", feedback: "Share menu opened!" },
      ],
    },
    {
      title: "Help a friend join a video call",
      avatar: "\u{1F469}", name: "Friend",
      steps: [
        { dialogue: "Everyone says I'm muted!", scene: "The mic icon has a line through it.", ui: '<div class="row"><button data-act="unmute">Unmute</button><button data-act="volume">Turn up speakers</button><button data-act="rejoin">Leave and rejoin</button></div>', action: "unmute", lesson: "The mic icon with a line means muted.", hint: "How do you turn your microphone on?", feedback: "Unmuted! They can hear you." },
        { dialogue: "Now they can't see me.", scene: "The camera shows 'Camera off'.", ui: '<div class="row"><button data-act="camera">Turn on camera</button><button data-act="closer">Move closer</button><button data-act="refresh">Ask them to refresh</button></div>', action: "camera", lesson: "The camera icon controls your video.", hint: "How do you turn on your video?", feedback: "Camera on! They can see you." },
        { dialogue: "I want to share my screen.", scene: "The call toolbar has icons.", ui: '<div class="row"><button data-act="share">Share Screen</button><button data-act="record">Record</button><button data-act="email">Email the doc</button></div>', action: "share", lesson: "Share Screen lets others see your screen.", hint: "How do you show your screen to others?", feedback: "Sharing! They see your screen." },
        { dialogue: "I'm done. How do I leave?", scene: "The call is still active.", ui: '<div class="row"><button data-act="leave">Leave call</button><button data-act="close">Close browser tab</button><button data-act="walk">Just walk away</button></div>', action: "leave", lesson: "Click 'Leave' to exit properly.", hint: "How do you exit a call?", feedback: "Left the call. Goodbye!" },
        { dialogue: "Can I make the video full-screen?", scene: "The video is in a small window.", ui: '<div class="row"><button data-act="fullscreen">Full screen</button><button data-act="zoom">Zoom in</button><button data-act="newtab">Open in new tab</button></div>', action: "fullscreen", lesson: "Full screen fills your display. Press Esc to exit.", hint: "How do you make video fill the screen?", feedback: "Full screen! Press Esc to exit." },
        { dialogue: "Someone is sharing their screen. How do I see it better?", scene: "A shared screen is small.", ui: '<div class="row"><button data-act="pip">Picture-in-picture</button><button data-act="zoom2">Zoom in</button><button data-act="ask">Ask them to stop</button></div>', action: "pip", lesson: "Picture-in-picture keeps the shared screen visible.", hint: "How do you keep video visible while working?", feedback: "Pinned! You can see it while doing other things." },
        { dialogue: "The call is lagging. What should I do?", scene: "The video is choppy.", ui: '<div class="row"><button data-act="mute2">Turn off camera</button><button data-act="wifi">Check Wi-Fi</button><button data-act="leave2">Leave and rejoin</button></div>', action: "wifi", lesson: "Check your internet connection first.", hint: "What should you check if video is choppy?", feedback: "Wi-Fi checked. Try moving closer to the router." },
      ],
    },
    {
      title: "Help a neighbor set up Wi-Fi",
      avatar: "\u{1F474}", name: "Neighbor Tom",
      steps: [
        { dialogue: "I just got a new router. How do I connect?", scene: "The Wi-Fi settings page.", ui: '<div class="row"><button data-act="settings">Open Settings</button><button data-act="plug">Plug in the router</button><button data-act="call">Call the internet company</button></div>', action: "settings", lesson: "Open Settings to find Wi-Fi options.", hint: "Where do you find Wi-Fi options?", feedback: "Settings opened!" },
        { dialogue: "Settings is open. Where's Wi-Fi?", scene: "The settings menu.", ui: '<div class="row"><button data-act="network">Network & Internet</button><button data-act="display">Display</button><button data-act="sound">Sound</button></div>', action: "network", lesson: "Wi-Fi is under Network & Internet.", hint: "Which settings category has Wi-Fi?", feedback: "Found it!" },
        { dialogue: "I see a list of networks. Which one is mine?", scene: "Available Wi-Fi networks.", ui: '<div class="row"><button data-act="mywifi">MyHomeNetwork</button><button data-act="guest">GuestNetwork</button><button data-act="unknown">UnknownNetwork</button></div>', action: "mywifi", lesson: "Pick your own network name (on the router label).", hint: "Which network is yours?", feedback: "Selected your network!" },
        { dialogue: "It's asking for a password.", scene: "Password prompt.", ui: '<div class="row"><input id="sm-pw" placeholder="Wi-Fi password" style="flex:1"><button data-act="connect">Connect</button></div>', action: "connect", validate: () => document.querySelector("#sm-pw").value.trim() !== "", onAction: () => { if (!document.querySelector("#sm-pw").value.trim()) document.querySelector("#sm-pw").value = "MyPassword123"; }, lesson: "Type the Wi-Fi password (on the router label).", hint: "What do you need to join a network?", feedback: "Connected! You're online." },
        { dialogue: "How do I know it worked?", scene: "The Wi-Fi icon in the corner.", ui: '<div class="row"><button data-act="checkicon">Look for the Wi-Fi icon</button><button data-act="refresh">Refresh the page</button><button data-act="restart">Restart the router</button></div>', action: "checkicon", lesson: "A Wi-Fi icon with bars means connected.", hint: "How do you confirm you're connected?", feedback: "Connected! Bars show signal strength." },
      ],
    },
    {
      title: "Help a teen recover a forgotten password",
      avatar: "\u{1F466}", name: "Teen Alex",
      steps: [
        { dialogue: "I forgot my password! What do I do?", scene: "The login page shows 'Forgot password?'.", ui: '<div class="row"><button data-act="forgot">Forgot password?</button><button data-act="guess">Try guessing</button><button data-act="new">Create new account</button></div>', action: "forgot", lesson: "'Forgot password?' sends a reset link to your email.", hint: "What do you do if you forget your password?", feedback: "Reset link sent to your email!" },
        { dialogue: "I got an email with a reset link. Now what?", scene: "The reset email is open.", ui: '<div class="row"><button data-act="clicklink">Click the reset link</button><button data-act="copy">Copy the link</button><button data-act="ignore">Ignore it</button></div>', action: "clicklink", lesson: "Click the link in the email to reset your password.", hint: "What in the email resets your password?", feedback: "Reset page opened!" },
        { dialogue: "It's asking for a new password. What should I use?", scene: "New password form.", ui: '<div class="row"><button data-act="strong">Long, unique password</button><button data-act="old">Same as before</button><button data-act="simple">123456</button></div>', action: "strong", lesson: "Use a new, strong, unique password.", hint: "What makes a good new password?", feedback: "Great choice! Strong and new." },
        { dialogue: "Should I save it somewhere?", scene: "Password saved.", ui: '<div class="row"><button data-act="manager">Save in password manager</button><button data-act="note">Write it down</button><button data-act="memory">Just remember it</button></div>', action: "manager", lesson: "A password manager keeps it safe and remembers it.", hint: "Where should you store passwords safely?", feedback: "Saved! You won't forget it now." },
        { dialogue: "How do I avoid forgetting again?", scene: "Account security tips.", ui: '<div class="row"><button data-act="2fa">Enable 2FA</button><button data-act="samepw">Use the same password everywhere</button><button data-act="nopw">No password at all</button></div>', action: "2fa", lesson: "2FA means even if you forget, you can recover.", hint: "What adds a second security layer?", feedback: "2FA on! Extra security." },
      ],
    },
  ];

  let storyIdx = 0, stepIdx = 0, score = 0, total = STORIES.length;
  let answered = false, mode = "practice";

  function loadStory() {
    stepIdx = 0;
    const story = STORIES[storyIdx];
    $("#sm-avatar").textContent = story.avatar;
    $("#sm-name").textContent = story.name;
    $("#sm-round").textContent = (storyIdx + 1) + " / " + total;
    $("#sm-score").textContent = score;
    loadStep();
  }

  function loadStep() {
    const story = STORIES[storyIdx];
    const step = story.steps[stepIdx];
    answered = false;
    $("#sm-progress").textContent = "Step " + (stepIdx + 1) + " of " + story.steps.length;
    $("#sm-dialogue").textContent = story.name + ": " + step.dialogue;
    $("#sm-scene").textContent = step.scene;
    $("#sm-lesson").style.display = "none";
    $("#sm-lesson").textContent = "";
    $("#sm-hint").textContent = mode === "practice" ? "Hint: " + step.hint : "";
    const scene = $("#sm-scene");
    const uiDiv = document.createElement("div");
    uiDiv.className = "sm-ui";
    uiDiv.innerHTML = step.ui;
    // shuffle buttons within each row so the answer isn't always in the same spot
    uiDiv.querySelectorAll(".row").forEach((row) => {
      const btns = Array.from(row.querySelectorAll("button[data-act]"));
      if (btns.length <= 1) return;
      // Fisher-Yates shuffle
      for (let i = btns.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [btns[i], btns[j]] = [btns[j], btns[i]];
      }
      // re-append in new order (keep inputs in place)
      btns.forEach((b) => row.appendChild(b));
    });
    scene.appendChild(uiDiv);
    Array.from(uiDiv.querySelectorAll("[data-act]")).forEach((el) => {
      el.addEventListener("click", () => handleAction(el, step));
    });
    const inputs = uiDiv.querySelectorAll("input, textarea, select");
    inputs.forEach((inp) => { inp.addEventListener("change", () => {}); });
    if (step.validate && !uiDiv.querySelector('[data-act="submit"]') && !uiDiv.querySelector('[data-act="send"]') && !uiDiv.querySelector('[data-act="send2"]')) {
      const btn = document.createElement("button");
      btn.setAttribute("data-act", "submit");
      btn.textContent = "Done";
      btn.className = "btn btn-primary";
      btn.style.marginTop = "8px";
      uiDiv.appendChild(btn);
      btn.addEventListener("click", () => handleAction(btn, step));
    }
    if (typeof Sound !== "undefined") Sound.speak(story.name + " says: " + step.dialogue);
  }

  function handleAction(el, step) {
    if (answered) return;
    const act = el.getAttribute("data-act");
    const expected = step.action.replace('[data-act="', "").replace('"]', "");
    if (step.validate) {
      if (!step.validate()) {
        if (step.onAction) step.onAction();
        if (!step.validate()) {
          if (typeof Sound !== "undefined") Sound.error();
          BB.toast("Fill in all the fields first.", "warn");
          return;
        }
      }
    }
    if (act === expected) {
      answered = true;
      if (typeof Sound !== "undefined") Sound.success();
      $("#sm-lesson").textContent = "Lesson: " + step.lesson;
      $("#sm-lesson").style.display = "block";
      BB.toast("Correct! " + (step.feedback || ""), "good", 1500);
      stepIdx++;
      if (stepIdx >= STORIES[storyIdx].steps.length) {
        setTimeout(() => {
          score++;
          $("#sm-score").textContent = score;
          if (typeof Sound !== "undefined") { Sound.complete(); Sound.confetti(); Sound.speak("Great job! You helped " + STORIES[storyIdx].name + "."); }
          storyIdx++;
          if (storyIdx >= total) { endGame(); return; }
          $("#sm-round").textContent = (storyIdx + 1) + " / " + total;
          loadStory();
        }, 1800);
      } else {
        setTimeout(loadStep, 1800);
      }
    } else {
      if (typeof Sound !== "undefined") Sound.error();
      BB.toast("Not quite. " + step.hint, "warn", 2000);
    }
  }

  function endGame() {
    const over = $("#sm-over");
    over.style.display = "block";
    const pct = Math.round((score / total) * 100);
    let msg = "Good start.";
    if (pct >= 90) msg = "Excellent! You're a great helper.";
    else if (pct >= 70) msg = "Nice work.";
    else if (pct >= 50) msg = "Halfway. Try again.";
    over.innerHTML = '<div class="big">\u{1F389}</div><h2>Done!</h2><p>Completed <strong>' + score + ' of ' + total + '</strong> stories (' + pct + '%).</p><p>' + msg + '</p><div class="game-actions"><button class="btn btn-primary btn-big" id="sm-replay">Play again</button></div>';
    $("#sm-replay").addEventListener("click", () => {
      over.style.display = "none";
      storyIdx = 0; stepIdx = 0; score = 0;
      $("#sm-score").textContent = "0";
      $("#sm-round").textContent = "1 / " + total;
      loadStory();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    Array.from(document.querySelectorAll(".mode-btn")).forEach((b) => {
      b.addEventListener("click", () => {
        Array.from(document.querySelectorAll(".mode-btn")).forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        mode = b.dataset.mode;
      });
    });
    const btn = document.createElement("button");
    btn.className = "btn btn-primary btn-big";
    btn.textContent = "Start story mode";
    btn.addEventListener("click", () => { btn.style.display = "none"; loadStory(); });
    document.querySelector("main").appendChild(btn);
  });
})();
