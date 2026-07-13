# soenke.me

Personal site of Sönke Nommensen — OUTRUN/synthwave aesthetic, built with [Astro](https://astro.build) and deployed to GitHub Pages at [soenke.me](https://soenke.me).

## Stack

- **Astro 7** (static output) + TypeScript (strict)
- Plain CSS with design tokens — no framework; the whole design system lives in `src/layouts/Layout.astro`
- Self-hosted fonts via Fontsource (Press Start 2P + Chakra Petch — no Google Fonts requests)
- `astro:assets` image pipeline for the photo gallery (responsive webp, lazy-loaded, native `<dialog>` lightbox)

## Commands

```bash
npm install
npm run dev       # dev server at http://localhost:4321
npm run check     # astro check (type checking)
npm run build     # production build → dist/
npm run preview   # preview the production build
npm run test:e2e  # Playwright smoke tests (builds + previews automatically)
```

## Deploy

Pushes to `main` deploy via GitHub Actions (`.github/workflows/deploy.yml`): type check → build → GitHub Pages, with retries for the occasional transient Pages backend error and a post-deploy smoke check against the live site. PRs run type check + build (`ci.yml`).

## Structure

- `src/layouts/Layout.astro` — global stylesheet (design tokens), meta/OG tags, interaction JS
- `src/components/` — one component per section (Hero, About, Projects, Off the clock, Frames, Contact)
- `src/pages/` — `index`, `datenschutz`, `404`
- `src/assets/photos/` — committed web masters for the gallery (1600px, EXIF-stripped); camera originals stay local in the gitignored `src/assets/img/`

See `CLAUDE.md` for the full development guide, design-system reference, and changelog.
