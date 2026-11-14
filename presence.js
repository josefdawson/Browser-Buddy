/* =========================================================
   Browser Buddy — Real-time presence tracking (Firebase)
   ========================================================= */
(function () {
  "use strict";

  // ====== CONFIGURE YOUR FIREBASE PROJECT HERE ======
  // Create a free Firebase project at https://console.firebase.google.com
  // Enable Realtime Database, set rules to allow read/write for presence
  const FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
  // ==================================================

  // Check if Firebase is configured
  function isConfigured() {
    return FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY" &&
           FIREBASE_CONFIG.databaseURL !== "https://YOUR_PROJECT-default-rtdb.firebaseio.com";
  }

  // Generate or retrieve session ID
  function getSessionId() {
    let sid = null;
    try { sid = sessionStorage.getItem("bb-session-id"); } catch (e) {}
    if (!sid) {
      sid = "user-" + Math.random().toString(36).substr(2, 9) + "-" + Date.now();
      try { sessionStorage.setItem("bb-session-id", sid); } catch (e) {}
    }
    return sid;
  }

  // Page name (clean URL)
  function pageName() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    return path.replace(".html", "") || "home";
  }

  // Track presence
  function trackPresence() {
    if (!isConfigured()) return;
    if (typeof firebase === "undefined") return;

    try {
      if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    } catch (e) {}

    const db = firebase.database();
    const sid = getSessionId();
    const ref = db.ref("presence/" + sid);

    const data = {
      page: pageName(),
      since: firebase.database.ServerValue.TIMESTAMP,
      ua: navigator.userAgent.slice(0, 80),
    };

    // Set presence and remove on disconnect
    ref.set(data);
    ref.onDisconnect().remove();

    // Heartbeat every 30s to stay alive
    setInterval(() => {
      ref.update({ lastSeen: firebase.database.ServerValue.TIMESTAMP });
    }, 30000);
  }

  // Read live users (for admin)
  window.Presence = {
    isConfigured: isConfigured,
    readLive: function (callback) {
      if (!isConfigured() || typeof firebase === "undefined") {
        callback(null);
        return;
      }
      try {
        if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      } catch (e) {}
      const db = firebase.database();
      db.ref("presence").on("value", (snap) => {
        const data = snap.val() || {};
        const users = Object.keys(data).map((key) => ({
          id: key,
          page: data[key].page || "unknown",
          since: data[key].since || 0,
          lastSeen: data[key].lastSeen || data[key].since || 0,
        }));
        callback(users);
      });
    },
    removeUser: function (id) {
      if (!isConfigured() || typeof firebase === "undefined") return;
      try {
        if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      } catch (e) {}
      firebase.database().ref("presence/" + id).remove();
    },
  };

  // Auto-track on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", trackPresence);
  } else {
    trackPresence();
  }
})();
