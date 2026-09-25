# Tbilisi, September 2026 — A Photoreport

A magazine-style photo report about Tbilisi, Georgia, built as a static site and deployed with **GitHub Pages** from the `/docs` folder (free, no build step).

## Live site

After enabling GitHub Pages on the repo (see below), the site is served at:

```
https://DGoncalves123.github.io/tbilisi-2026/
```

## Structure

```
docs/
  index.html           # magazine article page
  assets/
    css/style.css      # editorial styles
    js/main.js         # loads photos.json and renders the article
    photos/            # web-sized images (resized from originals)
  data/
    photos.json        # source of truth: order, captions, tags, layout hints
```

The article is data-driven: `docs/data/photos.json` holds the photo order, captions, tags, sections, and layout hints. `main.js` reads it and renders the page, so you edit the JSON to change the story without touching HTML.

## Local development

Serve the `docs` folder with any static server, then open the printed URL:

```bash
cd docs && python3 -m http.server 8080
# open http://127.0.0.1:8080/
```

## Deploy with GitHub Pages (`/docs`)

1. Create a new repo on GitHub (e.g. `tbilisi-2026`) — **do not** add a README or `.gitignore` if you already have them locally.
2. Push this folder as the repo root:

   ```bash
   git init
   git add .
   git commit -m "Tbilisi photoreport"
   git branch -M main
   git remote add origin https://github.com/DGoncalves123/tbilisi-2026.git
   git push -u origin main
   ```

3. On GitHub: **Settings → Pages → Source** → choose **"Deploy from a branch"** → branch `main` → folder **`/docs`** → Save.
4. The site goes live at `https://DGoncalves123.github.io/tbilisi-2026/` (allow a minute or two).

## Editing the story

- **Tags / captions / include / section**: edit per-photo fields in `docs/data/photos.json` (or use the local review page during drafting).
- **Title / subtitle / lede / byline**: edit the top-level fields in the same JSON.

> Note: only photos with `"include": true` are shown, in the order they appear in the `photos` array.
