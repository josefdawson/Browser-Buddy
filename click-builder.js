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
