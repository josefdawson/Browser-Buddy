/* =========================================================
   Browser Buddy — Click-Through Builder
   ========================================================= */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Storage ---------- */
  function loadTutorials() {
    try { return JSON.parse(localStorage.getItem("bb-tutorials") || "[]"); }
    catch (e) { return []; }
  }
  function saveTutorials(list) {
    try { localStorage.setItem("bb-tutorials", JSON.stringify(list)); return true; }
    catch (e) { return false; }
  }

  /* ---------- Tabs ---------- */
  function initTabs() {
    $$(".cb-tab").forEach((t) => {
      t.addEventListener("click", () => {
        $$(".cb-tab").forEach((x) => x.classList.remove("active"));
        t.classList.add("active");
        $$(".cb-pane").forEach((p) => p.classList.remove("active"));
        $("#pane-" + t.dataset.tab).classList.add("active");
        if (t.dataset.tab === "library") renderLibrary();
        if (t.dataset.tab === "player") populatePlayerSelect();
      });
    });
  }

  /* ---------- Editor ---------- */
  let editorSteps = [];
  let currentImage = null; // dataURL
  let currentHotspot = null; // {x,y,w,h} percent
  let drawing = false;
  let drawStart = null;

  function loadImageFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      // resize to max 800px width to keep storage small
      const img = new Image();
      img.onload = () => {
        const maxW = 800;
        let w = img.width, h = img.height;
        if (w > maxW) { h = Math.round(h * (maxW / w)); w = maxW; }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        currentImage = canvas.toDataURL("image/jpeg", 0.85);
        currentHotspot = null;
        $("#cb-img").src = currentImage;
        $("#cb-img").style.display = "block";
        $("#cb-box").style.display = "none";
        $("#cb-canvas-hint").textContent = "Image loaded. Click 'Draw hotspot' then drag to mark the click area.";
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function initEditor() {
    $("#cb-file").addEventListener("change", (e) => loadImageFile(e.target.files[0]));

    function loadTemplate(type) {
      const c = document.createElement("canvas");
      c.width = 800; c.height = 500;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#f0f4fc"; ctx.fillRect(0, 0, 800, 500);
      if (type === "browser") {
        ctx.fillStyle = "#e8edf7"; ctx.fillRect(0, 0, 800, 40);
        ctx.fillStyle = "#3b5bfd"; ctx.fillRect(10, 8, 60, 24);
        ctx.fillStyle = "#fff"; ctx.font = "12px sans-serif"; ctx.fillText("← → ↻", 18, 24);
        ctx.fillStyle = "#fff"; ctx.fillRect(80, 8, 500, 24);
        ctx.fillStyle = "#56617a"; ctx.fillText("https://example.com", 90, 24);
        ctx.fillStyle = "#e0e8f8"; ctx.fillRect(0, 40, 800, 30);
        ctx.fillStyle = "#17203a"; ctx.font = "14px sans-serif"; ctx.fillText("Home  |  About  |  Contact  |  Login", 20, 60);
        ctx.fillStyle = "#17203a"; ctx.font = "16px sans-serif"; ctx.fillText("Welcome to our website!", 20, 100);
        ctx.fillStyle = "#56617a"; ctx.font = "12px sans-serif"; ctx.fillText("Click the button below to continue.", 20, 125);
        ctx.fillStyle = "#3b5bfd"; ctx.fillRect(20, 140, 140, 36); ctx.fillStyle = "#fff"; ctx.font = "14px sans-serif"; ctx.fillText("Click here", 40, 163);
        ctx.fillStyle = "#c93a3a"; ctx.fillRect(200, 140, 140, 36); ctx.fillStyle = "#fff"; ctx.fillText("Fake button", 215, 163);
      } else if (type === "phone") {
        ctx.fillStyle = "#1a2233"; ctx.fillRect(250, 20, 300, 460);
        ctx.fillStyle = "#fff"; ctx.fillRect(260, 60, 280, 380);
        ctx.fillStyle = "#3b5bfd"; ctx.fillRect(270, 70, 260, 40);
        ctx.fillStyle = "#fff"; ctx.font = "14px sans-serif"; ctx.fillText("Settings", 280, 95);
        ctx.fillStyle = "#f6f8fd"; ctx.fillRect(270, 120, 260, 40); ctx.fillStyle = "#17203a"; ctx.fillText("Display", 280, 145);
        ctx.fillStyle = "#f6f8fd"; ctx.fillRect(270, 170, 260, 40); ctx.fillText("Sound", 280, 195);
        ctx.fillStyle = "#f6f8fd"; ctx.fillRect(270, 220, 260, 40); ctx.fillText("Privacy", 280, 245);
        ctx.fillStyle = "#f6f8fd"; ctx.fillRect(270, 270, 260, 40); ctx.fillText("About", 280, 295);
      } else if (type === "email") {
        ctx.fillStyle = "#f0f4fc"; ctx.fillRect(0, 0, 200, 500);
        ctx.fillStyle = "#17203a"; ctx.font = "14px sans-serif"; ctx.fillText("Inbox", 20, 30);
        ctx.fillStyle = "#3b5bfd"; ctx.fillRect(10, 45, 180, 30); ctx.fillStyle = "#fff"; ctx.fillText("Compose", 60, 65);
        ctx.fillStyle = "#fff"; ctx.fillRect(200, 0, 600, 500);
        ctx.fillStyle = "#17203a"; ctx.font = "16px sans-serif"; ctx.fillText("Inbox (3)", 210, 30);
        ctx.fillStyle = "#e8edff"; ctx.fillRect(200, 40, 600, 40); ctx.fillStyle = "#17203a"; ctx.font = "13px sans-serif"; ctx.fillText("Grandma Rose — Sunday dinner", 210, 65);
        ctx.fillStyle = "#fff"; ctx.fillRect(200, 80, 600, 40); ctx.fillText("Prize Center — You won!", 210, 105);
        ctx.fillStyle = "#fff"; ctx.fillRect(200, 120, 600, 40); ctx.fillText("Weekly Deals — 50% off", 210, 145);
      }
      currentImage = c.toDataURL("image/jpeg", 0.85);
      currentHotspot = null;
      $("#cb-img").src = currentImage;
      $("#cb-img").style.display = "block";
      $("#cb-box").style.display = "none";
      $("#cb-canvas-hint").textContent = "Template loaded. Click 'Draw hotspot' then drag to mark the click area.";
      BB.toast("Template loaded!", "good", 1500);
    }

    $("#cb-tpl-browser").addEventListener("click", () => loadTemplate("browser"));
    $("#cb-tpl-phone").addEventListener("click", () => loadTemplate("phone"));
    $("#cb-tpl-email").addEventListener("click", () => loadTemplate("email"));

    const canvas = $("#cb-canvas");
    let drawingMode = false;

    $("#cb-draw").addEventListener("click", () => {
      if (!currentImage) { BB.toast("Upload an image first.", "warn"); return; }
      drawingMode = true;
      BB.toast("Drag on the image to draw the hotspot.", "info", 2500);
    });

    canvas.addEventListener("mousedown", (e) => {
      if (!drawingMode || !currentImage) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      drawStart = { x, y };
      drawing = true;
      const box = $("#cb-box");
      box.style.left = x + "%";
      box.style.top = y + "%";
      box.style.width = "0%";
      box.style.height = "0%";
      box.style.display = "block";
    });

    canvas.addEventListener("mousemove", (e) => {
      if (!drawing) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      const box = $("#cb-box");
      const left = Math.min(drawStart.x, x);
      const top = Math.min(drawStart.y, y);
      const w = Math.abs(x - drawStart.x);
      const h = Math.abs(y - drawStart.y);
      box.style.left = left + "%";
      box.style.top = top + "%";
      box.style.width = w + "%";
      box.style.height = h + "%";
    });

    canvas.addEventListener("mouseup", () => {
      if (!drawing) return;
      drawing = false;
      drawingMode = false;
      const box = $("#cb-box");
      const x = parseFloat(box.style.left);
      const y = parseFloat(box.style.top);
      const w = parseFloat(box.style.width);
      const h = parseFloat(box.style.height);
      if (w < 2 || h < 2) {
        box.style.display = "none";
        currentHotspot = null;
        BB.toast("Hotspot too small. Try again.", "warn");
        return;
      }
      currentHotspot = { x, y, w, h };
      BB.toast("Hotspot set. Add a caption and click 'Add step'.", "good", 2000);
    });

    $("#cb-addstep").addEventListener("click", () => {
      if (!currentImage) { BB.toast("Upload an image first.", "warn"); return; }
      if (!currentHotspot) { BB.toast("Draw a hotspot first.", "warn"); return; }
      const caption = $("#cb-caption").value.trim() || "Click the highlighted area.";
      editorSteps.push({ image: currentImage, hotspot: currentHotspot, caption });
      currentHotspot = null;
      $("#cb-box").style.display = "none";
      $("#cb-caption").value = "";
      renderSteps();
      BB.toast("Step added.", "good", 1500);
    });

    $("#cb-save").addEventListener("click", () => {
      const name = $("#cb-name").value.trim();
      if (!name) { BB.toast("Give your lesson a name.", "warn"); return; }
      if (editorSteps.length === 0) { BB.toast("Add at least one step.", "warn"); return; }
      const tutorials = loadTutorials();
      tutorials.push({ id: "tut-" + Date.now(), name, steps: editorSteps.slice() });
      if (saveTutorials(tutorials)) {
        BB.toast("Lesson saved!", "good");
        $("#cb-status").textContent = "Saved: " + name + " (" + editorSteps.length + " steps)";
      } else {
        BB.toast("Couldn't save — storage full.", "bad");
      }
    });

    $("#cb-clear").addEventListener("click", () => {
      editorSteps = [];
      currentImage = null;
      currentHotspot = null;
      $("#cb-img").style.display = "none";
      $("#cb-box").style.display = "none";
      $("#cb-name").value = "";
      $("#cb-caption").value = "";
      renderSteps();
      BB.toast("Cleared.", "info");
    });

    $("#cb-export").addEventListener("click", () => {
      const name = $("#cb-name").value.trim() || "Untitled";
      if (editorSteps.length === 0) { BB.toast("Add steps first.", "warn"); return; }
      const data = JSON.stringify({ name, steps: editorSteps });
      // compress via btoa
      try {
        const code = btoa(unescape(encodeURIComponent(data)));
        navigator.clipboard.writeText(code).then(() => {
          BB.toast("Lesson code copied to clipboard!", "good", 2500);
        }).catch(() => {
          // fallback
          const ta = document.createElement("textarea");
          ta.value = code;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          ta.remove();
          BB.toast("Lesson code copied!", "good", 2500);
        });
      } catch (e) {
        BB.toast("Couldn't export.", "bad");
      }
    });

    $("#cb-importbtn").addEventListener("click", () => {
      const code = $("#cb-import").value.trim();
      if (!code) { BB.toast("Paste a code first.", "warn"); return; }
      try {
        const data = JSON.parse(decodeURIComponent(escape(atob(code))));
        if (!data.steps || !Array.isArray(data.steps)) throw new Error("bad");
        editorSteps = data.steps;
        $("#cb-name").value = data.name || "Imported lesson";
        renderSteps();
        BB.toast("Imported " + editorSteps.length + " steps!", "good");
      } catch (e) {
        BB.toast("Invalid code.", "bad");
      }
    });
  }

  function renderSteps() {
    const wrap = $("#cb-steps");
    wrap.innerHTML = "";
    editorSteps.forEach((s, i) => {
      const el = document.createElement("div");
      el.className = "cb-step";
      el.innerHTML =
        '<img class="thumb" src="' + s.image + '" alt="step">' +
        '<span class="cap"><strong>Step ' + (i + 1) + ":</strong> " + s.caption + "</span>" +
        '<button title="Remove" data-i="' + i + '">×</button>';
      el.querySelector("button").addEventListener("click", () => {
        editorSteps.splice(i, 1);
        renderSteps();
      });
      wrap.appendChild(el);
    });
  }

  /* ---------- Player ---------- */
  let playTutorial = null;
  let playIdx = 0;

  function populatePlayerSelect() {
    const sel = $("#cb-play-select");
    const tutorials = loadTutorials();
    sel.innerHTML = tutorials.length
      ? tutorials.map((t) => '<option value="' + t.id + '">' + t.name + " (" + t.steps.length + " steps)</option>").join("")
      : '<option value="">No saved lessons</option>';
  }

  function startPlay() {
    const id = $("#cb-play-select").value;
    const tutorials = loadTutorials();
    playTutorial = tutorials.find((t) => t.id === id);
    if (!playTutorial) { BB.toast("Pick a lesson first.", "warn"); return; }
    playIdx = 0;
    $("#cb-play-area").style.display = "block";
    $("#cb-play-feedback").textContent = "";
    $("#cb-play-hint").style.display = "none";
    showPlayStep();
  }

  function showPlayStep() {
    const step = playTutorial.steps[playIdx];
    $("#cb-play-img").src = step.image;
    $("#cb-play-caption").textContent = (playIdx + 1) + ". " + step.caption;
    $("#cb-play-progress").textContent = "Step " + (playIdx + 1) + " of " + playTutorial.steps.length;
    $("#cb-play-feedback").textContent = "";
    $("#cb-play-feedback").className = "cb-play-feedback";
    $("#cb-play-hint").style.display = "none";
    const h = step.hotspot;
    const hint = $("#cb-play-hint");
    hint.style.left = h.x + "%";
    hint.style.top = h.y + "%";
    hint.style.width = h.w + "%";
    hint.style.height = h.h + "%";
  }

  function initPlayer() {
    $("#cb-play-start").addEventListener("click", startPlay);
    const canvas = $("#cb-play-canvas");
    canvas.addEventListener("click", (e) => {
      if (!playTutorial) return;
      const step = playTutorial.steps[playIdx];
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      const h = step.hotspot;
      const inside = x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h;
      if (inside) {
        $("#cb-play-feedback").textContent = "✓ Correct!";
        $("#cb-play-feedback").className = "cb-play-feedback good";
        BB.toast("✓ Nice!", "good", 1200);
        playIdx++;
        if (playIdx >= playTutorial.steps.length) {
          $("#cb-play-feedback").textContent = "You finished the lesson!";
          $("#cb-play-feedback").className = "cb-play-feedback good";
          BB.toast("Lesson complete!", "good", 2500);
        } else {
          showPlayStep();
        }
      } else {
        $("#cb-play-feedback").textContent = "Not quite — try again. (Need a hint? Use the button below.)";
        $("#cb-play-feedback").className = "cb-play-feedback bad";
      }
    });
    $("#cb-play-hintbtn").addEventListener("click", () => {
      $("#cb-play-hint").style.display = "block";
    });
  }

  /* ---------- Library ---------- */
  function renderLibrary() {
    const list = $("#cb-lib-list");
    const empty = $("#cb-lib-empty");
    const tutorials = loadTutorials();
    if (tutorials.length === 0) {
      list.innerHTML = "";
      empty.style.display = "block";
      return;
    }
    empty.style.display = "none";
    list.innerHTML = tutorials
      .map(
        (t) =>
          '<div class="cb-libcard"><h3>' + t.name + "</h3>" +
          "<p>" + t.steps.length + " step" + (t.steps.length === 1 ? "" : "s") + "</p>" +
          '<div class="actions">' +
          '<button class="btn btn-primary" data-play="' + t.id + '">Play</button>' +
          '<button class="btn btn-ghost" data-del="' + t.id + '">Delete</button>' +
          "</div></div>"
      )
      .join("");
    $$("[data-play]", list).forEach((b) => {
      b.addEventListener("click", () => {
        const t = loadTutorials().find((x) => x.id === b.dataset.play);
        if (!t) return;
        // switch to player tab
        $$(".cb-tab").forEach((x) => x.classList.remove("active"));
        $$(".cb-tab")[1].classList.add("active");
        $$(".cb-pane").forEach((p) => p.classList.remove("active"));
        $("#pane-player").classList.add("active");
        populatePlayerSelect();
        $("#cb-play-select").value = t.id;
        startPlay();
      });
    });
    $$("[data-del]", list).forEach((b) => {
      b.addEventListener("click", () => {
        const tutorials = loadTutorials().filter((x) => x.id !== b.dataset.del);
        saveTutorials(tutorials);
        renderLibrary();
        BB.toast("Deleted.", "info");
      });
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    initEditor();
    initPlayer();
  });
})();
