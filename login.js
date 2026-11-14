/* =========================================================
   Browser Buddy — Admin Login
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  const ADMIN_EMAIL = "thelittledevchannel@gmail.com";
  const ADMIN_PASS = "thelittledev";

  document.addEventListener("DOMContentLoaded", () => {
    $("#login-btn").addEventListener("click", () => {
      const email = $("#login-email").value.trim().toLowerCase();
      const pw = $("#login-pw").value;
      const msg = $("#login-msg");
      if (email === ADMIN_EMAIL && pw === ADMIN_PASS) {
        try { sessionStorage.setItem("bb-admin", "1"); } catch (e) {}
        window.location.href = "admin.html";
      } else {
        msg.textContent = "Incorrect email or password.";
        if (typeof Sound !== "undefined") Sound.error();
      }
    });
    $("#login-pw").addEventListener("keydown", (e) => {
      if (e.key === "Enter") $("#login-btn").click();
    });
  });
})();
