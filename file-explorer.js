/* =========================================================
   Browser Buddy — File Explorer Rescue
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  const ROOT = {
    name: "Home", children: [
      { name: "Downloads", type: "folder", children: [
        { name: "tax_form.pdf", type: "file", id: "tax" },
        { name: "photo.jpg", type: "file", id: "photo" },
        { name: "setup.exe", type: "file", id: "setup" },
        { name: "tax_form (1).pdf", type: "file", id: "taxdup" },
      ]},
      { name: "Documents", type: "folder", children: [] },
      { name: "Pictures", type: "folder", children: [
        { name: "vacation.jpg", type: "file", id: "vac" },
      ]},
      { name: "Trash", type: "folder", children: [], trash: true },
    ],
  };

  const TASKS = [
    { text: "Find tax_form.pdf inside the Downloads folder.", check: (ctx) => ctx.found },
    { text: "Rename tax_form.pdf to tax_2024.pdf.", check: (ctx) => ctx.renamed },
    { text: "Move tax_2024.pdf into the Documents folder.", check: (ctx) => ctx.moved },
    { text: "Trash the duplicate 'tax_form (1).pdf'.", check: (ctx) => ctx.trashed },
  ];

  let round = 0, score = 0, total = TASKS.length;
  let path = [ROOT];
  let selected = null;
  let ctx = { found: false, renamed: false, moved: false, trashed: false };

  function current() { return path[path.length - 1]; }

  function render() {
    const node = current();
    $("#fe-path").textContent = path.map((n) => n.name).join(" / ");
    const list = $("#fe-list");
    list.innerHTML = "";
    if (node.trash) {
      (node.children || []).forEach((c) => {
        const el = document.createElement("div");
        el.textContent = "🗑️ " + c.name;
        el.style.padding = "6px";
        list.appendChild(el);
      });
      if (!node.children.length) list.innerHTML = "<p style='color:var(--muted)'>Trash is empty.</p>";
      return;
    }
    (node.children || []).forEach((c) => {
      const el = document.createElement("div");
      el.style.padding = "6px 8px";
      el.style.cursor = "pointer";
      el.style.borderRadius = "6px";
      el.style.background = selected === c ? "#e8edff" : "";
      el.textContent = (c.type === "folder" ? "📁 " : "📄 ") + c.name;
      el.addEventListener("click", () => { selected = c; render(); });
      list.appendChild(el);
    });
    if (path.length > 1) {
      const back = document.createElement("div");
      back.textContent = "← Back";
      back.style.padding = "6px 8px";
      back.style.cursor = "pointer";
      back.style.color = "var(--primary)";
      back.addEventListener("click", () => { path.pop(); selected = null; render(); });
      list.appendChild(back);
    }
  }

  $("#fe-back").addEventListener("click", () => {
    if (path.length > 1) { path.pop(); selected = null; render(); }
  });

  $("#fe-rename").addEventListener("click", () => {
    if (!selected || selected.type !== "file") { BB.toast("Select a file first.", "warn"); return; }
    const newName = prompt("New name:", selected.name);
    if (!newName) return;
    selected.name = newName;
    if (selected.id === "tax" && newName === "tax_2024.pdf") ctx.renamed = true;
    selected = null;
    render();
    check();
  });

  $("#fe-move").addEventListener("click", () => {
    if (!selected || selected.type !== "file") { BB.toast("Select a file first.", "warn"); return; }
    const docs = ROOT.children.find((c) => c.name === "Documents");
    if (selected.name === "tax_2024.pdf" || selected.id === "tax") {
      if (!docs.children.find((c) => c.id === selected.id)) docs.children.push(selected);
      const parent = path[path.length - 1];
      parent.children = parent.children.filter((c) => c !== selected);
      ctx.moved = true;
    }
    selected = null;
    render();
    check();
  });

  $("#fe-trash").addEventListener("click", () => {
    if (!selected || selected.type !== "file") { BB.toast("Select a file first.", "warn"); return; }
    const parent = path[path.length - 1];
    parent.children = parent.children.filter((c) => c !== selected);
    const trash = ROOT.children.find((c) => c.trash);
    trash.children.push(selected);
    if (selected.id === "taxdup") ctx.trashed = true;
    selected = null;
    render();
    check();
  });

  // double-click to open folder
  $("#fe-list").addEventListener("dblclick", (e) => {
    const target = e.target;
    // find clicked child
  });

  // open folder on click of folder name (single click selects; double-click opens)
  $("#fe-list").addEventListener("click", (e) => {
    // if clicked a folder row, open it
    const text = e.target.textContent;
    const node = current();
    const child = (node.children || []).find((c) => c.type === "folder" && ("📁 " + c.name) === text);
    if (child) {
      path.push(child);
      selected = null;
      if (child.name === "Downloads") ctx.found = true;
      render();
      check();
    }
  });

  function check() {
    const t = TASKS[round];
    if (t.check(ctx)) {
      score++;
      BB.toast("✓ Done!", "good", 1500);
      round++;
      if (round >= total) { endGame(); return; }
      $("#fe-round").textContent = (round + 1) + " / " + total;
      $("#fe-instr").textContent = TASKS[round].text;
    }
  }

  function endGame() {
    const over = $("#fe-over");
    over.style.display = "block";
    over.innerHTML = '<div class="big">🎉</div><h2>Done!</h2><p>Completed <strong>' + score + ' of ' + total + '</strong>.</p><div class="game-actions"><button class="btn btn-primary btn-big" id="fe-replay">Play again</button></div>';
    $("#fe-replay").addEventListener("click", () => { over.style.display = "none"; location.reload(); });
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("#fe-instr").textContent = TASKS[0].text;
    const btn = document.createElement("button");
    btn.className = "btn btn-primary btn-big";
    btn.textContent = "Start game";
    btn.addEventListener("click", () => { btn.style.display = "none"; render(); });
    document.querySelector("main").appendChild(btn);
  });
})();
