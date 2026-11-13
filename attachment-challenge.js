/* =========================================================
   Browser Buddy — Photo & Document Attachment Challenge
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  const FILES = [
    { name: "resume.pdf", type: "doc", icon: "📄" },
    { name: "screenshot.png", type: "img", icon: "🖼️" },
    { name: "dog_photo.jpg", type: "img", icon: "🐕" },
    { name: "vacation1.jpg", type: "img", icon: "🏖️" },
    { name: "vacation2.jpg", type: "img", icon: "SETTINGS" },
    { name: "report.docx", type: "doc", icon: "📝" },
  ];

  const TASKS = [
    { text: "Attach the PDF resume (not the screenshot).", need: ["resume.pdf"], mode: "attach" },
    { text: "Attach the dog photo from your Pictures.", need: ["dog_photo.jpg"], mode: "attach" },
    { text: "Send 3 vacation photos at once.", need: ["vacation1.jpg", "vacation2.jpg"], mode: "multi", count: 2 },
    { text: "Attach the report document.", need: ["report.docx"], mode: "attach" },
    { text: "Attach only the screenshot, not the resume.", need: ["screenshot.png"], mode: "attach" },
  ];

  let round = 0, score = 0, total = TASKS.length;
  let attached = [];
  let pickerOpen = false;
  let pickerMode = "attach";

  function renderAttachments() {
    const el = $("#ac-attachments");
    if (attached.length === 0) { el.innerHTML = '<span style="color:var(--muted)">No attachments yet.</span>'; return; }
    el.innerHTML = attached.map((f) => '<span style="display:inline-block;background:#e8edff;border-radius:8px;padding:4px 8px;margin:2px;font-size:.85rem">' + f.icon + " " + f.name + "</span>").join("");
  }

  function openPicker(mode) {
    pickerMode = mode;
    const picker = $("#ac-picker");
    picker.style.display = "block";
    const files = $("#ac-files");
    files.innerHTML = FILES.map((f) => '<div style="padding:6px;cursor:pointer;border-radius:6px" data-file="' + f.name + '">' + f.icon + " " + f.name + "</div>").join("");
    files.querySelectorAll("[data-file]").forEach((el) => {
      el.addEventListener("click", () => {
        const f = FILES.find((x) => x.name === el.dataset.file);
        if (attached.find((a) => a.name === f.name)) {
          BB.toast("Already attached.", "warn"); return;
        }
        if (pickerMode === "attach") {
          attached = [f];
        } else {
          attached.push(f);
        }
        renderAttachments();
        BB.toast("Attached " + f.name, "good", 1200);
      });
    });
  }

  function check() {
    const t = TASKS[round];
    const names = attached.map((a) => a.name);
    const ok = t.need.every((n) => names.includes(n)) && names.length === t.need.length;
    if (ok) {
      score++;
      BB.toast("✓ Correct attachments!", "good", 1500);
      round++;
      if (round >= total) { endGame(); return; }
      $("#ac-round").textContent = (round + 1) + " / " + total;
      $("#ac-instr").textContent = TASKS[round].text;
      attached = [];
      renderAttachments();
      $("#ac-picker").style.display = "none";
    } else {
      BB.toast("Check your attachments and try again.", "warn");
    }
  }

  $("#ac-attach").addEventListener("click", () => openPicker("attach"));
  $("#ac-gallery").addEventListener("click", () => openPicker("multi"));
  $("#ac-send").addEventListener("click", check);

  function endGame() {
    const over = $("#ac-over");
    over.style.display = "block";
    over.innerHTML = '<div class="big">🎉</div><h2>Done!</h2><p>You got <strong>' + score + ' of ' + total + '</strong> right.</p><div class="game-actions"><button class="btn btn-primary btn-big" id="ac-replay">Play again</button></div>';
    $("#ac-replay").addEventListener("click", () => { over.style.display = "none"; score = 0; round = 0; attached = []; $("#ac-score").textContent = "0"; $("#ac-round").textContent = "1 / " + total; $("#ac-instr").textContent = TASKS[0].text; renderAttachments(); });
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("#ac-instr").textContent = TASKS[0].text;
    $("#ac-score").textContent = "0";
    $("#ac-round").textContent = "1 / " + total;
    renderAttachments();
    const btn = document.createElement("button");
    btn.className = "btn btn-primary btn-big";
    btn.textContent = "Start game";
    btn.addEventListener("click", () => { btn.style.display = "none"; });
    document.querySelector("main").appendChild(btn);
  });
})();
