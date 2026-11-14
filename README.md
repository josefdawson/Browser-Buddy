# Browser Buddy 🧭

A friendly practice ground for learning everyday apps and screens — built for
beginners of any age. Everything runs in the browser with plain HTML, CSS, and
JavaScript. No installs, no build step, no accounts.

## Run it

**Option 1 (easiest):** Double-click `index.html` to open it in your browser.

**Option 2 (recommended for saving progress):** Serve the folder from a local server
so progress persists across pages:
```
cd "C:\VS Code Folders\Browser Buddy"
python -m http.server 8123
```
Then open http://localhost:8123 in your browser.

> Note: When opening files directly (file://), some browsers don't share saved
> progress between pages. Using a local server (Option 2) fixes this. Progress is
> also saved to your browser's storage and can be exported/imported via the
> Account page.

## What's inside

| File | What it does |
| --- | --- |
| `index.html` | Home hub — the front door with all the modules. |
| `styles.css` | Shared design: big buttons, friendly colors, hint ring, toast. |
| `app.js` | Shared helpers: saved progress, hints, "everyday words" mode. |
| `home.js` | Fills in the progress bars on the home page. |
| `simulator.html` | The Safe-Mode Simulator page. |
| `simulator.css` | Styles for the three pretend apps. |
| `simulator.js` | The pretend apps, missions, hints, and feedback. |
| `coming-soon.html` | Placeholder page for modules still being built. |

## Module 1: Safe-Mode Simulator ✅

Practice inside three pretend apps. Nothing is real, so nothing can go wrong.

- **📧 Pretend email** — folders, reading pane, delete, move to Spam, block sender
  (with a confirmation dialog).
- **🌐 Pretend browser** — tabs, back/forward, address bar, bookmarks, zoom.
- **⚙️ Pretend settings** — Display (dark mode, text size), Sound, Privacy.

Each app has guided **missions** with step-by-step instructions.

### Good features already built in

- **💡 "Show me where" button** — points at the next step with a pulsing circle.
- **⏱️ Automatic hint** — if you sit still for 10 seconds during a mission, the
  next step lights up by itself.
- **💬 Gentle feedback** — a short "Not that one" message when you click the wrong
  thing, and a "✓ Nice!" when you get it right.
- **🔤 Everyday words mode** — the switch in the top bar swaps technical names for
  plain descriptions (e.g. "Privacy" becomes just "Privacy", "Display" becomes
  "Screen look", "Settings" becomes "Pretend settings").
- **🏆 Saved progress** — completed missions are remembered on this device
  (browser `localStorage`), and the home page shows how far along you are.
- **🎉 Celebration screen** — with a "Next mission" button to keep going.

## Modules still to come

- 🔣 **Icon Dictionary** — what common icons mean, plus flashcards and quizzes.
- 🧩 **Click-Through Builder** — make your own lessons from screenshots.
- 🌐 **Browser & Tab Survival Trainer** — pop-ups, downloads, permissions.
- 🕵️ **Scam or Safe?** — spot tricky download buttons and suspicious pop-ups.

## Notes

- All data stays on the device. Nothing is sent anywhere.
- The pretend apps are intentionally simple so the steps are easy to follow.
- Ideas, fixes, and new missions are welcome — this is meant to grow.
