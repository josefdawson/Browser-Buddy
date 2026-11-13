/* =========================================================
   Browser Buddy — Where Did My Download Go?
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  const ROUNDS = [
    { file: "concert_tickets.pdf", site: "TicketMaster", hint: "Look for the download arrow in the top-right corner." },
    { file: "resume.pdf", site: "Job Portal", hint: "The file name ends in .pdf" },
    { file: "vacation_photo.jpg", site: "Photo Share", hint: "Images show as .jpg" },
    { file: "budget_2024.xlsx", site: "Spreadsheet Cloud", hint: "Spreadsheets are .xlsx" },
    { file: "meeting_notes.docx", site: "Office Portal", hint: "Documents are .docx" },
  ];

  let round = 0, score = 0, total = ROUNDS.length;
  let downloaded = false, downloadedFile = null;

  function loadRound() {
    const r = ROUNDS[round];
    $("#wd-instr").textContent = "Download the file from " + r.site + ", then find it in your downloads list. Hint: " + r.hint;
    $("#wd-round") && ($("#wd-round").textContent = (round + 1) + " / " + total);
    downloaded = false; downloadedFile = null;
    $("#wd-dlpanel").style.display = "none";
    $("#wd-content").innerHTML =
      "<h3>" + r.site + "</h3><p>Your file is ready.</p>" +
      '<button class="fake-link" id="wd-dlbtn2">⬇ Download ' + r.file + "</button>";
    $("#wd-dlbtn2").addEventListener("click", () => {
      downloaded = true;
      downloadedFile = r.file;
      $("#wd-content").innerHTML = "<p>Download started! The file disappeared from the page. Where did it go?</p><p>Find it in your downloads.</p>";
      BB.toast("File downloaded. Find it in the downloads list (⬇ top right).", "info", 2500);
    });
    $("#wd-dlbtn").onclick = () => togglePanel();
  }

  function togglePanel() {
    const panel = $("#wd-dlpanel");
    if (panel.style.display === "none") {
      panel.style.display = "block";
      renderPanel();
    } else {
      panel.style.display = "none";
    }
  }

  function renderPanel() {
    const panel = $("#wd-dlpanel");
    if (!downloaded) {
      panel.innerHTML = "<p>No downloads yet.</p>";
      return;
    }
    panel.innerHTML =
      "<h4>Downloads</h4>" +
      '<div class="wd-dlitem" data-file="' + downloadedFile + '">' +
      "📄 " + downloadedFile + " — just now" +
      "</div>";
    panel.querySelector(".wd-dlitem").addEventListener("click", () => {
      score++;
      $("#wd-score").textContent = score;
      BB.toast("✓ Found it!", "good", 1500);
      round++;
      if (round >= total) { endGame(); return; }
      $("#wd-round").textContent = (round + 1) + " / " + total;
      loadRound();
    });
  }

  function endGame() {
    const over = $("#wd-over");
    over.style.display = "block";
    const pct = Math.round((score / total) * 100);
    over.innerHTML = '<div class="big">🎉</div><h2>Done!</h2><p>You found <strong>' + score + ' of ' + total + '</strong> files (' + pct + '%).</p><div class="game-actions"><button class="btn btn-primary btn-big" id="wd-replay">Play again</button></div>';
    $("#wd-replay").addEventListener("click", () => { over.style.display = "none"; score = 0; round = 0; $("#wd-score").textContent = "0"; loadRound(); });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.createElement("button");
    btn.className = "btn btn-primary btn-big";
    btn.textContent = "Start game";
    btn.addEventListener("click", () => { btn.style.display = "none"; loadRound(); });
    document.querySelector("main").appendChild(btn);
  });
})();
