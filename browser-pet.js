/* =========================================================
   Browser Buddy — Browser Pet (Tamagotchi)
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  const PETS = [
    { emoji: "🦆", name: "Duckie" },
    { emoji: "🐱", name: "Whiskers" },
    { emoji: "🦊", name: "Foxy" },
    { emoji: "🐸", name: "Froggo" },
    { emoji: "🐙", name: "Inky" },
    { emoji: "🦉", name: "Hoot" },
  ];

  let pet = null;
  let decayInterval = null;

  function loadPet() {
    try {
      const saved = JSON.parse(localStorage.getItem("bb-pet") || "null");
      if (saved) pet = saved;
      else {
        pet = { ...PETS[Math.floor(Math.random() * PETS.length)], hunger: 80, happiness: 90, energy: 70, lastUpdate: Date.now() };
        savePet();
      }
    } catch (e) {
      pet = { ...PETS[0], hunger: 80, happiness: 90, energy: 70, lastUpdate: Date.now() };
    }
    // Apply decay since last update
    const elapsed = (Date.now() - (pet.lastUpdate || Date.now())) / 1000 / 60; // minutes
    const decay = Math.min(50, Math.floor(elapsed * 2)); // 2 per minute, max 50
    pet.hunger = Math.max(0, pet.hunger - decay);
    pet.happiness = Math.max(0, pet.happiness - Math.floor(decay * 0.5));
    pet.energy = Math.max(0, pet.energy - Math.floor(decay * 0.3));
    pet.lastUpdate = Date.now();
    savePet();
  }

  function savePet() {
    try { localStorage.setItem("bb-pet", JSON.stringify(pet)); } catch (e) {}
  }

  function render() {
    if (!pet) return;
    $("#pet-avatar").textContent = pet.emoji;
    $("#pet-name").textContent = pet.name;
    $("#pet-hunger").style.width = pet.hunger + "%";
    $("#pet-happy").style.width = pet.happiness + "%";
    $("#pet-energy").style.width = pet.energy + "%";

    // Status
    const avg = (pet.hunger + pet.happiness + pet.energy) / 3;
    let status = "Happy and well-fed!";
    let avatarClass = "";
    if (pet.hunger < 20) { status = "I'm hungry! 🍖"; avatarClass = "sad"; }
    else if (pet.happiness < 20) { status = "I'm bored... 😢"; avatarClass = "sad"; }
    else if (pet.energy < 20) { status = "So tired... 😴"; avatarClass = "sad"; }
    else if (avg > 70) { status = "Feeling great! 😊"; avatarClass = "happy"; }
    $("#pet-status").textContent = status;
    $("#pet-avatar").className = "pet-avatar " + avatarClass;
  }

  function msg(text) {
    $("#pet-msg").textContent = text;
  }

  function feed() {
    pet.hunger = Math.min(100, pet.hunger + 30);
    pet.happiness = Math.min(100, pet.happiness + 5);
    pet.lastUpdate = Date.now();
    savePet();
    render();
    if (typeof Sound !== "undefined") Sound.success();
    msg("Yum! That was delicious. 🍖");
  }

  function play() {
    if (pet.energy < 10) { msg("Too tired to play... let me rest first. 😴"); return; }
    pet.happiness = Math.min(100, pet.happiness + 25);
    pet.energy = Math.max(0, pet.energy - 10);
    pet.hunger = Math.max(0, pet.hunger - 5);
    pet.lastUpdate = Date.now();
    savePet();
    render();
    if (typeof Sound !== "undefined") Sound.success();
    msg("Wheee! That was fun! 🎮");
  }

  function rest() {
    pet.energy = Math.min(100, pet.energy + 35);
    pet.hunger = Math.max(0, pet.hunger - 3);
    pet.lastUpdate = Date.now();
    savePet();
    render();
    if (typeof Sound !== "undefined") Sound.hint();
    msg("Zzz... feeling rested now. 💤");
  }

  // Challenge: a quick mini-task to earn food
  const CHALLENGES = [
    { q: "What does 🔒 mean?", opts: ["Locked/secure", "Unlocked", "Delete"], ans: 0 },
    { q: "Which is a real download link?", opts: ["⬇ DOWNLOAD NOW!", "Download file.pdf", "GET IT FREE"], ans: 1 },
    { q: "What does ⚙️ mean?", opts: ["Settings", "Delete", "Search"], ans: 0 },
    { q: "Which is safe?", opts: ["Accept all cookies", "Reject all cookies", "Ignore banner"], ans: 1 },
    { q: "What does 🗑️ mean?", opts: ["Download", "Delete", "Share"], ans: 1 },
  ];

  function doChallenge() {
    const ch = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
    const area = $("#pet-challenge");
    area.innerHTML = "<p style='font-weight:600;margin:0 0 8px'>" + ch.q + "</p>";
    const opts = document.createElement("div");
    opts.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;justify-content:center";
    ch.opts.forEach((o, i) => {
      const b = document.createElement("button");
      b.className = "btn btn-ghost";
      b.textContent = o;
      b.addEventListener("click", () => {
        if (i === ch.ans) {
          feed();
          msg("Correct! You earned pet food. 🍖");
          area.innerHTML = '<p style="color:var(--good);font-weight:600">✓ Correct! Your pet was fed.</p>';
        } else {
          if (typeof Sound !== "undefined") Sound.error();
          msg("Oops, wrong answer. Try again!");
          area.innerHTML = '<p style="color:var(--bad);font-weight:600">✗ Try again!</p>';
        }
      });
      opts.appendChild(b);
    });
    area.appendChild(opts);
  }

  // Decay over time
  function startDecay() {
    if (decayInterval) clearInterval(decayInterval);
    decayInterval = setInterval(() => {
      if (!pet) return;
      pet.hunger = Math.max(0, pet.hunger - 1);
      pet.happiness = Math.max(0, pet.happiness - 0.5);
      pet.energy = Math.max(0, pet.energy - 0.3);
      pet.lastUpdate = Date.now();
      savePet();
      render();
    }, 60000); // every minute
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadPet();
    render();
    startDecay();

    $("#pet-feed").addEventListener("click", feed);
    $("#pet-play").addEventListener("click", play);
    $("#pet-rest").addEventListener("click", rest);
    $("#pet-rename").addEventListener("click", () => {
      const newName = prompt("New name for your pet:", pet.name);
      if (newName && newName.trim()) {
        pet.name = newName.trim();
        savePet();
        render();
        BB.toast("Renamed to " + pet.name + "!", "good");
      }
    });
    $("#pet-challengebtn").addEventListener("click", doChallenge);
  });
})();
