# NoteFlow

A productivity suite prototype — **handwriting notebook**, **rich-text editor**, **infinite whiteboard**, **quick (sticky) notes**, and a **home library** (notebooks / whiteboards / documents) with card & table views, search-free pagination, favourites, templates and settings.

Built as a **static web app** — plain HTML + CSS + JavaScript, no build step, no backend. All data is saved in the browser via `localStorage`.

## ▶ Run locally
Just open `index.html` in a browser.
For the notebook microphone (voice recording) you need `localhost` or `https`, so prefer a tiny local server:
```bash
npx serve .        # or:  python -m http.server 8080
```
Then open `http://localhost:8080`.

## 🌐 Host on GitHub Pages (free, gives you a link)
1. Create a new GitHub repo and push **the contents of this folder** to it (so `index.html` is at the repo root).
   ```bash
   git init
   git add .
   git commit -m "NoteFlow app"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
2. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` / `root` → Save**.
3. Wait ~1 minute. Your app is live at:
   ```
   https://<you>.github.io/<repo>/
   ```
That URL opens `index.html` (the Home page) and the whole app works from there.

> Tip: pushing this folder as the repo root is simplest. If instead you keep it in a subfolder, either move `index.html` to the root, or select the `/docs` folder in the Pages settings (rename this folder to `docs`).

## ✅ Will it work as a hosted app?
Yes — it's fully static, so GitHub Pages runs it over **HTTPS** and everything works:
- Notebook / whiteboard / editor / quick notes / settings — all client-side.
- **Microphone** recording works (HTTPS is required and Pages provides it).
- Data persists in each visitor's own browser (`localStorage`).

**Needs internet:** a few libraries load from CDNs at runtime — `perfect-freehand` (ink), Tiptap (editor), `mammoth` + `pdf.js` (Word/PDF import). They load automatically online.

## 📁 Structure
```
index.html            Home (libraries, quick notes)
editor-orange.html    Rich-text document editor (Tiptap)
notebook-demo.html    Handwriting notebook (canvas + audio)
whiteboard-demo.html  Infinite-canvas whiteboard
settings.html         Appearance / library / profile / data
recent.html · favourites.html · templates.html · trash.html
css/  styles.css · orange.css · editor.css
js/   app.js (home) · shell.js (shared chrome)
```

## Notes / limits (prototype)
- Data lives in the browser only (no cloud sync yet).
- Deleting is permanent (no restore-from-trash yet).
- Import of `.docx`/`.pdf` extracts text; full fidelity comes later.
