# Chetan Sawale — Web Developer Portfolio

Awwwards-inspired, loud black / off-white / signal-red portfolio, in the
spirit of unbelievablycrap.com. Vanilla HTML/CSS/JS — no build step, no
framework — so it deploys as a Render Static Site.

## Structure

```
web-dev-portfolio/
├── index.html          # hero, about, skills, projects, journey, contact
├── css/style.css       # all styles (near-black / off-white / signal-red palette)
├── js/main.js          # preloader, transform-only reveals, counters, project
│                       # slider + filters + lightbox, IST clock, mouse coords,
│                       # GSAP parallax, Lenis, Three.js (red/white), mailto form
│                       # VISIBILITY RULE: content is visible by default; a
│                       # 1200ms safety timer forces .in on everything, so no
│                       # card or heading can ever be stuck invisible.
├── assets/
│   ├── me.png                              # portrait
│   ├── paperbull-preview.png               # PaperBull screenshot
│   └── Chetan-Sawale-Web-Developer-Resume.pdf
├── render.yaml         # Render static site config
└── README.md
```

## Live projects linked

- **PaperBull** — https://paperbull.online (verified 200 on 2026-11-03)
- **AsuraGPT** — https://asuragpt-2.onrender.com — Render free tier cold start;
  the page notes "may take a moment to wake" so recruiters aren't confused
  (first hit timed out after 15s on 2026-11-03; the link is kept live).

## Deploy on Render

1. Push this folder to a GitHub repo (e.g. `web-dev-portfolio`).
2. Render dashboard → **New + → Static Site** → connect the repo.
3. Publish directory: `.` (root). Build command: leave empty.
   (`render.yaml` in the repo already declares this — Render can pick it up
   via Blueprint: **New + → Blueprint**, select the repo.)
4. Deploy. The site serves `index.html` at the root.

## Run locally

```bash
cd web-dev-portfolio
python3 -m http.server 8000
# open http://localhost:8000
```
