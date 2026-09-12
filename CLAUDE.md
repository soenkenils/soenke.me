# CLAUDE.md - AI Assistant Development Guide

> Comprehensive documentation for AI assistants working on soenke.me

Last Updated: 2026-09-12

## Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Build & Deployment](#build--deployment)
- [Design System](#design-system)
- [Code Conventions](#code-conventions)
- [Key Components](#key-components)
- [Configuration Files](#configuration-files)
- [AI Assistant Guidelines](#ai-assistant-guidelines)

---

## Project Overview

**soenke.me** is a personal portfolio website showcasing Sönke Nommensen's professional profile, experience, and personal interests. The site uses an **OUTRUN / synthwave** aesthetic — neon glow, an animated perspective grid, an 80s sunset, and arcade typography.

- **Purpose**: Personal portfolio/resume website
- **Owner**: Sönke Nommensen (Engineering Team Lead at Tomorrow)
- **Domain**: https://soenke.me
- **Repository**: Personal GitHub repository
- **Deployment**: GitHub Pages via GitHub Actions

The design originated from a Claude Design handoff bundle (Synthwave/Outrun direction, "Outrun Sunset"). The HTML/CSS/JS prototype was ported into the Astro component structure: shared CSS and interaction JS live in `Layout.astro`; each page section is its own `.astro` component.

---

## Technology Stack

### Core Framework
- **Astro 5.x**: Static Site Generator (SSG) with component-based architecture
- **TypeScript 5.9.x**: Type-safe JavaScript with strict configuration
- **Node.js 22**: Runtime environment (specified in CI)

### Styling & UI
- **Plain CSS**: A single global stylesheet inside `Layout.astro` (`<style is:global>`), driven by CSS custom properties. **No CSS framework** — Tailwind was removed.
- **Custom Design System**: "OUTRUN" synthwave aesthetic (see [Design System](#design-system))

### Fonts (self-hosted via Fontsource — no requests to Google servers, GDPR)
- **Press Start 2P** (`@fontsource/press-start-2p`): Arcade headers — site name, section headings (`.h2`), kickers, buttons, timeline dates, footer name
- **Chakra Petch** (`@fontsource/chakra-petch`, weights 400/600/700 only, no italics): Body text and UI (default `font-family`)
- Imported in `Layout.astro` frontmatter; do **not** add `<link>`s to fonts.googleapis.com
- The two above-the-fold latin 400 woff2 files are preloaded in `<head>` (via Vite `?url` imports, so the hashed asset URLs match the Fontsource CSS)

### Build Tools
- **npm**: Package manager (package-lock.json present)
- **Astro CLI**: Build and dev server
- **TypeScript Compiler**: Type checking

---

## Project Structure

```
soenke.me/
├── .github/
│   ├── dependabot.yml          # Weekly npm (grouped) + GitHub Actions updates
│   └── workflows/
│       ├── ci.yml              # PR checks: check + build + e2e/a11y + Lighthouse
│       └── deploy.yml          # GitHub Actions deployment workflow
├── e2e/
│   ├── a11y.spec.ts            # axe WCAG 2.1 A/AA scan of every page + both dialogs
│   └── smoke.spec.ts           # Interaction smoke tests (menu, lightbox, reveal, racer)
├── public/
│   ├── apple-touch-icon.png    # iOS home-screen icon (generated, see scripts/)
│   ├── CNAME                   # Custom domain configuration
│   ├── favicon.svg             # Neon pixel-S favicon (OUTRUN style)
│   ├── og.png                  # Social preview image (generated, see scripts/)
│   └── robots.txt              # Allows all; points to sitemap-index.xml
├── scripts/
│   ├── generate-og.mjs         # Dependency-free generator for og.png + apple-touch-icon.png
│   ├── lighthouse.mjs          # Lighthouse category thresholds (CI gate)
│   └── preview-server.mjs      # Foreground static server for dist/ (test harness)
├── src/
│   ├── assets/
│   │   ├── img/                # RAW photo exports (gitignored — originals stay local)
│   │   └── photos/             # Web masters for the Frames gallery (1600px, EXIF-stripped)
│   │       ├── luebeck/        #   Home — Lübeck & the Baltic
│   │       ├── away/           #   Farther out (Dolomites, Venice, …)
│   │       └── glass/          #   Through glass & frost (abstracts)
│   ├── components/
│   │   ├── About.astro         # 01 · About section
│   │   ├── Contact.astro       # 03 · Contact section
│   │   ├── Footer.astro        # Footer
│   │   ├── Header.astro        # Fixed neon nav + mobile menu (links defined once in frontmatter)
│   │   ├── Hero.astro          # Outrun sunset hero
│   │   ├── Icon.astro          # Shared social icons (email/github/linkedin)
│   │   ├── Frames.astro        # 04 · Frames (photo gallery, astro:assets)
│   │   ├── OffTheClock.astro   # 03 · Off the clock (coffee / cycling / photography)
│   │   ├── Projects.astro      # 02 · Projects (MCP servers + walkie-talkie)
│   │   └── Racer.astro         # Konami-code easter egg: dialog + trigger (game lazy-loads)
│   ├── layouts/
│   │   └── Layout.astro        # Base layout: global CSS, fonts, fx overlays, interaction JS
│   ├── scripts/
│   │   └── racer-game.ts       # "Baltic Turbo Challenge" pseudo-3D canvas racer (dynamic import)
│   ├── pages/
│   │   ├── index.astro         # Homepage (main entry point)
│   │   ├── datenschutz.astro   # Privacy policy (DSGVO; lang="de", noindex, uses .legal-prose)
│   │   └── 404.astro           # "GAME OVER" not-found page (reuses the hero scaffold)
│   └── env.d.ts                # TypeScript environment definitions
├── astro.config.mjs            # Astro configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Project dependencies and scripts
├── .gitignore                  # Git ignore rules
└── README.md                   # Project documentation
```

### Section → Component map

The homepage renders in this order (see `src/pages/index.astro`):

| Order | Section label   | Component          | Anchor id     |
|-------|-----------------|--------------------|---------------|
| —     | Nav             | `Header.astro`     | (links below) |
| Hero  | —               | `Hero.astro`       | `#hero`       |
| 01    | About           | `About.astro`      | `#about`      |
| 02    | Projects        | `Projects.astro`   | `#projects`   |
| 03    | Off the clock   | `OffTheClock.astro`| `#play`       |
| 04    | Frames          | `Frames.astro`     | `#frames`     |
| 05    | Contact         | `Contact.astro`    | `#contact`    |
| —     | Footer          | `Footer.astro`     | —             |

`<main>` carries `id="top"` (the logo links to `/#top`; the skip-link targets `#top`). Nav links: About, Projects, Off the clock, Frames, **Say hi** (the `.nav-cta`, → `/#contact`). All nav hrefs use the `/#id` form so they also work from `/datenschutz` and `/404`.

---

## Development Workflow

### Available Scripts

```bash
# Start development server (hot reload on http://localhost:4321)
npm run dev      # or: npm start

# Build for production (outputs to dist/)
npm run build

# Preview production build locally (daemonises — stop with `npx astro preview stop`)
npm run preview

# Smoke + accessibility tests (builds first locally, serves dist/ via astro preview)
npm run test:e2e

# Lighthouse category thresholds against a running preview server
npm run test:lighthouse

# Run Astro CLI commands
npm run astro
```

### Development Server

- **URL**: http://localhost:4321
- **Hot Module Replacement**: Enabled
- **Port**: 4321 (default Astro port)

### Git Workflow

1. **Main Branch**: `main` — production-ready code
2. **Feature Branches**: Use `claude/` prefix for AI-assisted work
3. **Commit Messages**: Clear, descriptive
4. **Push Strategy**: Push to feature branch, then create PR to `main`
5. Always confirm the current branch (`git branch --show-current`) before committing

### Code Quality

- **TypeScript**: Strict mode (`astro/tsconfigs/strict`)
- **Type Checking**: `npm run check` (`astro check`, runs in PR CI via `.github/workflows/ci.yml`)
- **Path Aliases**: `@/*` maps to `src/*` (configured in tsconfig.json)

---

## Build & Deployment

### Build Process

```bash
npm run build      # → dist/ (static HTML, CSS, JS, assets)
```

### Deployment Pipeline

**Trigger**: Push to `main` branch or manual workflow dispatch

**GitHub Actions** (`.github/workflows/deploy.yml`): checkout → setup Node 22 (npm cache) → setup Pages → `npm ci` → `npm run check` → `npm run build` → upload `dist/` → deploy to GitHub Pages. The deploy step retries up to twice (60s waits) on the Pages backend's transient "Deployment failed, try again later." error, then a smoke check curls https://soenke.me and asserts the page content.

Pull requests run `.github/workflows/ci.yml` instead: `npm ci` → `npm run check` → `npm run build` → install chromium → `npm run test:e2e` (smoke + axe accessibility) → `npm run test:lighthouse`. A new push to the same PR cancels the superseded in-flight run (`concurrency` with `cancel-in-progress`).

**Environment**:
- **Runner**: `ubuntu-latest`
- **Node Version**: 22
- **Permissions**: `contents: read`, `pages: write`, `id-token: write`
- **Concurrency**: One deployment at a time (`cancel-in-progress: false` — in-flight deploys finish; only the newest queued run is kept)

**Result**: Site available at https://soenke.me (via CNAME in `public/`)

---

## Design System

### Theme: "OUTRUN" (synthwave / retrowave)

A maximal 80s aesthetic: warm-to-deep-purple background, neon pink/cyan glow, an animated perspective grid floor, a banded sunset, a seeded twinkling starfield, and global scanline + vignette overlays. Arcade font on headers only; readable sans for body.

### Design Tokens

All tokens are **CSS custom properties** declared once in `Layout.astro` `:root`. Change them there to retune the whole site. Per-element accents are set inline via `style="--accent: var(--cyan);"`.

#### Palette
```css
--bg:        #0a0118;   /* page background */
--bg-2:      #0c0220;
--bg-3:      #16092f;
--panel:     #150830;   /* card top gradient */
--panel-2:   #1b0b3d;
--line:      rgba(125, 90, 200, 0.28);  /* borders / dividers */
--ink:       #f3ecff;   /* primary text */
--ink-soft:  #c9b9ec;   /* secondary text */
--ink-mut:   #8f7fb8;   /* muted text */

--pink:      #ff2e97;   /* primary neon */
--cyan:      #00eaff;   /* primary neon */
--cyan-soft: #8af3ff;
--purple:    #b14aed;
--yellow:    #ffd319;
--orange:    #ff7a3d;

/* sunset gradient stops */
--sun-1: #fff35b;  --sun-2: #ffab2e;  --sun-3: #ff5fa2;  --sun-4: #ff2e97;
--grid:  0, 234, 255;   /* rgb triplet for grid lines (used as rgba(var(--grid), …)) */
```

#### Effect controls
```css
--glow: 1;      /* neon glow multiplier (used as calc(Npx*var(--glow))) */
--fx:   1;      /* general effect intensity (stars, vignette) */
--scan: 0.22;   /* scanline strength */
```

#### Layout
```css
--maxw: 1180px;                          /* .wrap max width */
--ease: cubic-bezier(0.16, 1, 0.3, 1);   /* shared easing */
```

### Typography
- **Headers / arcade**: `'Press Start 2P', monospace` — applied by `.arcade`, `.h2`, `.kicker .num`, `.nav-cta`, `.btn-pink`, `.tl-when`, `.logo`'s siblings, `.footer .name`.
- **Body / UI**: `'Chakra Petch', system-ui, sans-serif` — the default on `body`.

### Neon helpers (text glow)
```html
<span class="g-pink">…</span>   <!-- pink glow -->
<span class="g-cyan">…</span>   <!-- cyan glow -->
<span class="g-yellow">…</span> <!-- yellow/orange glow -->
<span class="g-purple">…</span> <!-- purple glow -->
```
Decorative animations: `.flicker` (CRT flicker on the name), `.blink` (cursor blink). Both disabled under `prefers-reduced-motion`.

### Visual Effects
- **Grid floor** (`.grid-floor`): perspective-tilted, infinitely scrolling neon grid in the hero.
- **Sun** (`.sun` + `.bands`): gradient disc with horizontal scanline bands.
- **Starfield** (`#stars`): 60 seeded twinkling stars injected by JS (seed `1337` → stable across reflows).
- **Scanlines** (`.fx-scan`) + **vignette** (`.fx-vig`): fixed, full-viewport overlays rendered in `Layout.astro` (z-index 70 / 69), `pointer-events: none`.

### Scroll Reveal
- Add `.reveal` to any element that should fade/slide in on scroll. Stagger with `.d1` / `.d2` / `.d3` (transition delays).
- JS (in `Layout.astro`) adds `.in` when the element crosses 90% of the viewport. A 1s per-element fallback adds `.shown` so content can never stay hidden.
- Under `prefers-reduced-motion`, all `.reveal` elements are shown immediately.

### Section scaffolding
```astro
<section class="section" id="section-name">
  <div class="wrap">
    <div class="kicker reveal"><span class="num">0X</span><span class="lbl">Label</span><span class="rule"></span></div>
    <h2 class="h2 reveal">Heading with <span class="g-cyan">neon accent</span></h2>
    <!-- content -->
  </div>
</section>
```
`.section + .section` draws a top border between consecutive sections. `.wrap` centers content at `--maxw` with 28px gutters.

### Reusable building blocks
- `.cards` / `.card` — 3-up neon card grid (Off the clock). Add `.cols-2` for a 2-up variant (Projects). Set `--accent` per card. SVG icons use `.emblem` (stroke = accent, neon drop-shadow). `.link-ext` is the "View on GitHub ↗" style link inside a card.
- `.icard` — left-accent-bar info card (About sidebar).
- `.timeline` / `.tl-item` / `.tl-card` — neon experience timeline. `.tl-item.muted` uses purple dot. `.now-pill` is the "Current" badge.
- `.contact-cards` / `.ccard` — icon + label contact cards.
- `.btn-pink` — primary arcade CTA. `.nav-cta` — cyan nav button.

### Responsive Breakpoints
- `max-width: 900px`: nav collapses to the burger/mobile menu; grids go single-column.
- `max-width: 560px`: smaller body/heading/timeline-date type.

---

## Code Conventions

### Astro Components

1. **File Extension**: `.astro`; **Naming**: PascalCase (`Hero.astro`).
2. **Section IDs**: kebab-case (`id="work"`).
3. Most components are pure markup with empty frontmatter — all styling is global (see below).
4. Structure:
   ```astro
   ---
   // frontmatter (often empty)
   ---
   <section class="section" id="…">
     <div class="wrap"> … </div>
   </section>
   ```

### CSS

1. **Single source of truth**: the global stylesheet in `Layout.astro` (`<style is:global>`). Add or change styles there, not in component-scoped `<style>` blocks, so class names resolve across all components.
2. **Use design tokens**: reference the CSS custom properties (`var(--pink)`, `var(--line)`, `calc(Npx*var(--glow))`); never hard-code hex values that duplicate a token.
3. **Per-element accent**: set `style="--accent: var(--cyan);"` on a card/element; the component CSS reads `var(--accent)`.
4. **No utility-class framework**: there is no Tailwind. Write semantic class names and real CSS.
5. **Respect reduced motion**: gate animations behind `@media (prefers-reduced-motion: reduce)` as the existing rules do.

### JavaScript

1. Shared interactions (starfield, scroll reveal, active-nav, mobile menu, footer year) live in **one IIFE** in `Layout.astro`. Keep new global behavior there.
2. The reveal/active-nav throttle is **timer-based** (`setTimeout`), intentionally — it fires even when the tab isn't painting, unlike `requestAnimationFrame`. Don't "optimize" it back to rAF.
3. Use type assertions for DOM elements when adding TypeScript (`as HTMLElement`).

### TypeScript

1. Extends `astro/tsconfigs/strict`; avoid `any`.
2. Path alias `@/` → `src/`.

### Comments

- Frontmatter/JS: `//` or `/* */`; HTML: `<!-- -->`; CSS: `/* */`.

---

## Key Components

### Layout.astro
**Path**: `src/layouts/Layout.astro` · **Props**: `{ title: string; description?: string; lang?: string; noindex?: boolean }`

The backbone. Contains:
- Frontmatter: Fontsource font imports (self-hosted Press Start 2P + Chakra Petch).
- `<head>`: meta, favicon, canonical URL, Open Graph / Twitter Card tags (`/og.png`), optional `noindex`, `<title>`.
- `<style is:global>`: the **entire** design system (tokens, nav, sections, hero, cards, timeline, contact, footer, fx overlays, responsive rules).
- `<body>`: skip-link, `<slot />`, the `.fx-vig` / `.fx-scan` overlays, and the interaction `<script>`.

### Header.astro
Fixed neon nav (`.nav`) with logo, desktop `.nav-links`, the `.nav-cta` "Say hi" button, and the `#burger` toggle. The separate `#mobileMenu` panel follows the header. No theme toggle (the site is dark-only). Behavior is wired in `Layout.astro`.

### Hero.astro
Outrun sunset hero (`#hero`): sky/stars/sun/mountains, animated `.grid-floor`, role badge, glowing arcade name (`SÖNKE` / `NOMMENSEN`), intro copy, `SAY HELLO` CTA + scroll hint, and the bottom ticker.

### About.astro · OffTheClock.astro · Contact.astro
The three numbered sections (01–03). `OffTheClock.astro` (`id="play"`) holds the coffee / cycling / photography cards.

### Footer.astro
Neon footer: name, tagline, social icons, `#year` (build-time year, kept fresh by JS), and the Datenschutz link (`/datenschutz`).

---

## Configuration Files

### astro.config.mjs
```javascript
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  site: 'https://soenke.me',
  integrations: [sitemap({ filter: (page) => !page.includes('/datenschutz') })],
});
```
Only integration: `@astrojs/sitemap` (Datenschutz excluded — it's `noindex`). `output: 'static'` (SSG); `site` drives canonical/OG URLs and the sitemap.

### tsconfig.json
Extends `astro/tsconfigs/strict`; `@/*` → `src/*`.

### package.json
- **Scripts**: `dev` / `start`, `build`, `preview`, `check`, `astro`.
- **Dependencies**: `astro`, `@astrojs/sitemap`, `@fontsource/press-start-2p`, `@fontsource/chakra-petch`.
- **Dev Dependencies**: `@astrojs/check`, `@types/node`, `typescript`. (No `@astrojs/tailwind` / `tailwindcss`.)
- If browserslist ever warns about stale data, run `npx update-browserslist-db` — don't add `caniuse-lite` as a direct dependency.

---

## AI Assistant Guidelines

### When Working on This Project

1. **Read before editing** existing files.
2. **Edit the global stylesheet in `Layout.astro`** for styling changes; use the **design tokens**, don't hard-code colors.
3. **Stay on-aesthetic**: neon glow, arcade headers, dark purple base. Keep arcade type on headers only — body stays in Chakra Petch for readability.
4. **Maintain TypeScript strictness**; avoid `any`.
5. **Test responsiveness** at the 900px and 560px breakpoints.
6. **Respect `prefers-reduced-motion`** for any new animation.
7. **Semantic HTML** + accessibility (ARIA labels, alt text, focus states, the skip-link).
8. Decorative layers (stars, sun, grid, overlays) are `aria-hidden`.

### Common Tasks

#### Adding a New Section
1. Create `src/components/NewSection.astro` using the `.section` / `.wrap` / `.kicker` / `.h2` scaffold.
2. Import it into `src/pages/index.astro` in the right order.
3. Add a nav link in `Header.astro` (desktop `.nav-links` **and** `#mobileMenu`).
4. Give the section a unique kebab-case `id`; the active-nav JS picks it up automatically from the nav `href`.
5. Add `.reveal` (+ `.d1/.d2/.d3`) to elements that should animate in.

#### Retuning Colors / Glow / Effects
1. Edit the CSS custom properties in `Layout.astro` `:root` (palette, `--glow`, `--fx`, `--scan`).
2. For a one-off accent, set `style="--accent: var(--…);"` on the element.

#### Adding New Fonts
1. Install the family: `npm install @fontsource/<family>` (keep fonts self-hosted — do **not** add Google Fonts `<link>`s).
2. Import the needed weights in `Layout.astro` frontmatter (e.g. `import '@fontsource/<family>/600.css';`).
3. Reference the family directly in the global CSS (there is no font-family config file).

#### Adding Photos to the Frames Gallery
1. Export from the photo library into `src/assets/img/` (gitignored scratch space).
2. Create a web master: `magick <src> -auto-orient -strip -resize '1600x1600>' -quality 80 src/assets/photos/<group>/<descriptive-name>.jpg` (**always `-strip`** — removes EXIF incl. any location data).
3. Add an entry (file + alt text) to the matching group in `Frames.astro`. The `import.meta.glob` picks the file up automatically; Astro generates responsive avif (q50) + webp (q75) variants at build time (`widths` 420/800/1200, lazy-loaded), served via `<picture>`. Don't equalise the two quality numbers — see the 2026-08-06 changelog entry.
4. Only commit the prepared masters in `src/assets/photos/` — never the camera originals.

#### Updating Content
- **Favicon**: `public/favicon.svg` · **Domain**: `public/CNAME` + `astro.config.mjs` · **Meta**: `Layout.astro` props (passed from each page).

### Testing Checklist
- [ ] `npm run build` succeeds
- [ ] `npm run preview` looks right
- [ ] Responsive at mobile / tablet / desktop (esp. 900px, 560px)
- [ ] Scroll-reveal fires; nothing stays hidden
- [ ] Nav links scroll to the right sections; active state tracks
- [ ] Mobile menu opens/closes (burger, link click, Escape)
- [ ] `prefers-reduced-motion` disables animations
- [ ] Color contrast is acceptable; external links use `target="_blank"` + `rel="noopener"`

### Don't Do
- ❌ Reintroduce Tailwind or any CSS framework without discussion
- ❌ Hard-code colors (`#fff`, raw hex) — use the design tokens
- ❌ Put shared styling in component-scoped `<style>` blocks (use the global sheet)
- ❌ Add a light/day theme — the site is intentionally dark-only OUTRUN
- ❌ Swap the timer-based scroll throttle back to `requestAnimationFrame`
- ❌ Add dependencies without discussion
- ❌ Commit `dist/` or `node_modules/`

### Do
- ✅ Use the design tokens and the `.section` scaffold
- ✅ Keep arcade type on headers, readable type on body
- ✅ Keep components small and mostly markup-only
- ✅ Gate animations behind `prefers-reduced-motion`
- ✅ Keep accessibility (ARIA, focus, skip-link) intact
- ✅ Document significant changes in this file

---

## Troubleshooting

### Build Failures
1. Delete `node_modules/` + `package-lock.json`, run `npm install`
2. `npx astro check` for TypeScript errors
3. Verify imports exist and `.astro` syntax is valid

### Dev Server Issues
1. Restart `npm run dev`
2. Clear cache: `rm -rf .astro`
3. Hard refresh (Cmd/Ctrl + Shift + R)

### Test Issues
- Port 4321 busy: a preview daemon from `npm run preview` is still running.
  Stop it with `npx astro preview stop` (`npx astro preview status` to check).
  Since Astro 7.2 `astro preview` always backgrounds itself, so the tests use
  `scripts/preview-server.mjs` instead — don't point Playwright's `webServer`
  at `astro preview`, it hangs on Linux.

### Style Issues
1. Confirm the class exists in the global stylesheet in `Layout.astro`
2. Check the token name (e.g. `--ink`, not `--text`)
3. Remember styles are global — a component-scoped `<style>` won't reach other components

### Deployment Issues
1. Check GitHub Actions logs
2. Verify `CNAME` and `site` in `astro.config.mjs` match the domain
3. Check GitHub Pages settings

---

## Changelog

### 2026-09-12
- **Fixed: the racer's road stayed blank / frozen on first open.** Chrome
  stamps rAF callbacks with the frame's *start* time, which can be earlier than
  the `performance.now()` taken in `open()` — most likely on the first open,
  when module init and first layout run right before it. That gave a negative
  first `dt`; the attract-mode cruise rolled `pos` below 0, `render()` read
  `segments[-1].y1`, threw, and the rAF loop never rescheduled. The title text
  (DOM) still showed, so the dialog looked open but the canvas was dead and
  Enter "started" a race nothing drew. `frame()` now clamps `dt` to `>= 0`.
  - e2e: new smoke test shifts every rAF timestamp 20ms early and asserts the
    canvas keeps changing with no page errors.

### 2026-08-08
- **Fixed: the racer sometimes didn't start right away.** Two causes, both in
  the lazy-load of `racer-game.ts`:
  1. The chunk was only fetched *after* the Konami code completed, so on a cold
     cache the dialog sat invisible for the whole round-trip with no feedback
     (measured 1.5s under a 1.5s throttle). The trigger now **warms the module
     at `WARM_AT = 4`** (↑↑↓↓ — deep enough that normal browsing never hits it),
     and **opens the dialog immediately** on unlock showing `LOADING…`, since
     the cabinet markup already ships with the page. Dialog now appears in
     ~10ms regardless of chunk latency.
  2. A failed `import()` is cached as a rejection in the browser's module map,
     so **one network blip killed the egg for the rest of the page load** — and
     it failed silently (unhandled rejection, nothing on screen). `load()` now
     drops the promise on rejection so later attempts retry, and the open
     dialog shows `LOAD FAILED · ESC`.
  - `initRacer().open(autoStart?)` takes an autoStart flag; an Enter pressed
    during the load window is queued and replayed instead of swallowed.
    `open()` guards `showModal()` (throws on an already-open dialog).
  - e2e: new smoke test asserts the dialog is visible <500ms with the chunk
    delayed 1500ms, then that the engine takes over and Enter starts the race.

### 2026-08-06
- **AVIF for the Frames gallery.** Thumbnails and lightbox images are now a
  hand-rolled `<picture>` with an `image/avif` `<source>` over a webp `<img>`
  fallback — **23% fewer bytes** across the thumbnail set. Written by hand
  rather than with `<Picture>` because that component applies one `quality` to
  every format, and **sharp's quality scale is not comparable across formats**:
  at q75 the avif came out *55% larger* than the webp it replaced. Matched on
  measured PSNR, avif q50 ≈ webp q75 for ~25% fewer bytes, so `AVIF_Q = 50` /
  `WEBP_Q = 75` in `Frames.astro`. `<a href>` stays webp (it is the no-JS
  fallback); the avif srcset rides on `data-srcset-avif` and is fed to a
  `<source>` in the viewer — set *before* the `<img>` so avif wins the pick.
  Build time 3s → 10s (two formats). Added `.photo-grid picture { display: block }`
  so the new wrapper does not reintroduce inline layout.
- **Accessibility gate** (`e2e/a11y.spec.ts`, `@axe-core/playwright`): axe
  WCAG 2.1 A/AA scan of `/`, `/datenschutz`, `/404` plus the two open dialogs.
  Caught a real defect — the `/datenschutz` prose links were distinguished by
  colour alone (WCAG 1.4.1); `.legal-prose a` now carries a permanent
  underline that hover only brightens.
- **Lighthouse gate** (`scripts/lighthouse.mjs`, `npm run test:lighthouse`):
  fails CI when a category drops below its threshold (a11y 100, perf/best-
  practices/SEO 90). Performance is the loosest bar on purpose — CI runners are
  noisy. `noindex` pages are exempt from the SEO gate, since Lighthouse scores
  "blocked from indexing" as a defect and there it is intended. Uses the
  chromium Playwright already installs. Site currently scores **100/100/100/100**.
- **Test harness**: `astro preview` daemonises as of Astro 7.2 (returns 0 while
  the server keeps running, and there is no working `--no-background` despite
  what `--help` implies), which Playwright's `webServer` reads as "exited
  early" — and on Linux CI the spawning process never returns at all, hanging
  the job. The tests now serve `dist/` with `scripts/preview-server.mjs`, a
  ~50-line dependency-free foreground static server (directory index, `.html`
  extension fallback, `404.html`, traversal guard). `npm run preview` is still
  `astro preview` for interactive use — stop it with `npx astro preview stop`.
- `npm audit fix`: astro 7.0.6 → 7.2.0, sharp 0.34.4 → 0.35.3, plus postcss /
  svgo / fast-uri. Clears an astro XSS advisory and the libvips CVEs — 10
  vulnerabilities → **0**. New devDeps: `@axe-core/playwright`, `lighthouse`,
  `chrome-launcher`.

### 2026-07-13 (even later)
- **Racer: sportier car + music.** Car redrawn as a low, wide Esprit-SE-style wedge: raked louvered rear window, rear wing on struts, slim segmented tail-lights, wide wheel stance, dual exhausts. **Music** is a procedural 90s-arcade loop in pure Web Audio (`createMusic()` in `racer-game.ts`, no audio assets): A-minor Am/F/C/G, four-on-the-floor kick, offbeat hats, snare on 2 & 4, sawtooth 8th-note bass through a lowpass, square-wave arpeggio lead through a dotted-8th feedback echo; lookahead `setInterval` scheduler. **Off by default** — the `♪ SOUND: OFF/ON` button (`#racerSound`, `.racer-sound`, `aria-pressed`) toggles it; closing the dialog always stops the music and resets the toggle. The `AudioContext` is created on first enable (user gesture — autoplay-safe). Focus model: the dialog itself (`tabindex="-1"`) is focused on open and after the sound toggle so Enter starts/restarts the race; focused buttons keep native Enter/Space activation; no focus ring on the dialog.

### 2026-07-13 (later)
- **"Baltic Turbo Challenge" easter egg**: the Konami code (↑↑↓↓←→←→BA) on the homepage opens a native `<dialog>` (`Racer.astro`) with a small canvas pseudo-3D racer — an homage to Lotus Turbo Challenge 2 (Amiga, 1991). Classic segmented-road renderer (Lou's Pseudo 3d Page / jakesgordon javascript-racer school): projected segments, curves faked via accumulated per-segment X offsets, hills via elevation projection, back-to-front painting with hill-crest culling. All vector-drawn in the design tokens (read from `:root` at init) — neon 3-lane road, pink rumble strips, glowing pylons, sunset/starfield sky, wedge car; no image assets. Arcade rules: 45s timer, +20s per checkpoint (3 per lap), off-road slows hard, best distance in `localStorage` (`racer.best`). Controls: ←→/AD steer, ↑/W gas, ↓/S brake, Enter start, Esc quit (native dialog). The game engine (`src/scripts/racer-game.ts`, ~7 kB chunk) is `import()`ed only on first unlock — the main bundle carries just the ~2 kB trigger. HUD/messages are DOM (Press Start 2P), canvas is `aria-hidden`; attract-mode cruise is skipped under `prefers-reduced-motion`. CSS: `.racer`, `.racer-frame` (own scanline overlay — the global `.fx-scan` sits below the dialog top layer), `.racer-hud`, `.racer-msg`, `.racer-flash`, `.racer-hint` in the global sheet. e2e: Konami open → Enter starts → Escape closes; wrong-key sequence reset.

### 2026-07-13
- **Playwright smoke tests** (`e2e/smoke.spec.ts`, `playwright.config.ts`, `npm run test:e2e`): mobile menu (open / Escape closes + focus returns to burger / link click closes), lightbox (open, arrow-key navigation + counter, Escape close, `src` dropped on close), scroll reveal (below-the-fold content gets `.in` + opacity 1; reduced-motion shows everything immediately). Runs against the production build via `astro preview` — locally `test:e2e` builds first; CI reuses the existing build. `ci.yml` installs chromium and runs the suite after build. Playwright artifacts gitignored.
- `docs/findings.md`: verified site audit (replaces an inaccurate auto-generated one); Impressum question resolved as already-decided (see 2026-06-23).

### 2026-07-06
- **Frames lightbox**: thumbnails are now `<a>` links to a 1600px webp (`getImage`, widths 800/1600 — no-JS fallback opens the image directly); a native `<dialog>` viewer (`#lightbox` in `Frames.astro` + component script) adds ◂/▸ + arrow-key navigation across all 18 frames (wrapping), an arcade `08 / 18` counter, caption from the alt text, backdrop-click close, and body scroll-lock. The frame glow + counter inherit the *group's* `--accent` (JS sets it on the dialog). Escape/focus-restore are native `<dialog>` behavior. CSS: `.ph-link`, `.lightbox`, `.lb-*` in the global sheet; open animation gated behind `prefers-reduced-motion`; nav buttons move to the bottom corners at 560px.

### 2026-07-04
- **Deploy hardening**: `deploy.yml` retries up to twice with 60s waits (single 30s retry lost to the Pages flake twice in a row on 2026-07-04) and finishes with a curl smoke check against https://soenke.me. Deploy also runs `npm run check` before build (direct pushes to main previously bypassed it).
- **CI**: superseded runs on the same PR are cancelled (`concurrency` + `cancel-in-progress`).
- **A11y**: Escape closes the mobile menu *and* returns focus to the burger (previously focus stayed in the hidden menu).
- Deps: astro 7.0.4 → 7.0.6; `npm audit fix` for a dev-only yaml advisory (0 vulnerabilities after).
- Repo hygiene: `.agents/` + `skills-lock.json` gitignored; merged local/remote feature branches cleaned up.

### 2026-07-02 (later)
- New **04 · Frames** photo gallery (`Frames.astro`, `id="frames"`); Contact renumbered 04→05, "Frames" added to nav. Three curated groups of 6: *Home — Lübeck & the Baltic* / *Farther out* / *Through glass & frost*.
- Image pipeline: camera originals live in `src/assets/img/` (**gitignored**, 200MB+); committed web masters in `src/assets/photos/<group>/` (1600px long edge, q80, `-strip`ped EXIF, ~5MB total). `astro:assets` `<Image>` emits 420/800/1200 webp srcset, `loading="lazy"`, `decoding="async"`.
- New CSS: `.photo-group` / `.ph-t` / `.photo-grid` / `.ph` (3-col grid, 3:2 crop, accent hover glow; 2-col at 900px, 1-col at 560px).
- `src/assets/profile.jpg` removed (was unused).

### 2026-07-02
- New **Projects** section (`Projects.astro`, `id="projects"`, 02) — four cards in a 2×2 grid (`.cards.cols-2`): `mailbox-mcp-server` and `soverin-mcp` (both made public on GitHub after a secrets audit, linked), plus `playlists-tidal-mcp` and `walkie-talkie` (both intentionally private — mention only, no GitHub link, don't publish).
- Renumbered: Off the clock 02→03, Contact 03→04. Added "Projects" to desktop nav + mobile menu.
- `.link-ext` (formerly dead timeline CSS) reused as the card GitHub link.

### 2026-06-23
- **Removed all work/employer references — the site is now purely personal.** Deleted the "What I do" (`Projects.astro`, `#work`) and "Experience" (`Experience.astro`, `#experience`) sections; renumbered About→01, Off the clock→02, Contact→03. Nav reduced to About · Off the clock · Say hi.
- Personalized Hero / About / Contact / Footer copy (coffee, steel bikes, photography, family, Lübeck). JSON-LD `Person` trimmed to name / address / email / sameAs (dropped `jobTitle`, `worksFor`, `alumniOf`). Updated `<title>`, meta `description`, and `og:image:alt`.
- Removed the Impressum page (`/impressum`) and its footer link (purely private, non-commercial site). **Datenschutz kept** — the DSGVO privacy-info obligation is independent of business status. Dropped the now-unused `.legal-card` CSS and the `/impressum` sitemap filter.
- Regenerated `og.png` / `apple-touch-icon.png` without the "ENGINEERING TEAM LEAD" line (`scripts/generate-og.mjs`).

### 2026-06-11
- Toned the site down ("bescheidener"): hero name clamp(26/6.4vw/56) → clamp(20/4.5vw/38) (560px: max 28px), section `.h2` max 34 → 26px, `.btn-pink` smaller with softer glow.
- Hero `role-badge` no longer shouts the job title ("Engineering Team Lead" → "Moin from Lübeck"); the role still appears in the hero copy, About, Experience, footer, `<title>` and JSON-LD.

### 2026-06-10 (later)
- New `/datenschutz` page (DSGVO privacy policy: static site, no cookies/tracking, GitHub Pages hosting, contact, data-subject rights). `lang="de"`, `noindex`, excluded from sitemap; linked next to Impressum in the footer (`.legal-links`).
- `.legal-prose` styles for long-form legal text in the global stylesheet.
- Font preloading: the latin 400 woff2 of both families is preloaded in `<head>` via Vite `?url` imports.

### 2026-06-10
- New `Icon.astro` (shared email/GitHub/LinkedIn SVGs, used by `Contact` and `Footer`); `Header.astro` nav links defined once in frontmatter.
- Impressum styled via `.legal` / `.legal-card` in the global stylesheet (inline styles removed).
- JSON-LD `Person` schema on the homepage (via the new `<slot name="head" />` in `Layout.astro`).
- `theme-color` meta + `apple-touch-icon.png`; `favicon.svg` redesigned in OUTRUN style (was the old blue "Nordic" leftover).
- `scripts/generate-og.mjs` now also renders the touch icon and uses adaptive PNG row filtering (og.png: 594 → 296 kB).
- Removed `baseline-browser-mapping` / `caniuse-lite` direct deps; added `.github/dependabot.yml` (weekly, npm updates grouped).

### 2026-06-09
- **Self-hosted fonts** via Fontsource (GDPR — no more requests to Google Fonts); only the used weights (PS2P 400; Chakra Petch 400/600/700, no italics).
- **SEO/social metadata** in `Layout.astro`: canonical URL, Open Graph + Twitter Card tags, generated `public/og.png` (regenerate with `node scripts/generate-og.mjs`).
- Added `@astrojs/sitemap` + `public/robots.txt`; Impressum is `lang="de"`, `noindex`, excluded from the sitemap.
- Added `404.astro` ("GAME OVER" page reusing the hero scaffold).
- Nav/logo hrefs changed to `/#id` so the header works from `/impressum` and `/404`; active-nav JS parses the hash accordingly.
- A11y: skip-link now targets `#top` (was a dead `#about` on subpages); closed mobile menu is `visibility: hidden` (out of tab order); burger has `aria-controls` and a state-aware `aria-label`.
- Footer year rendered at build time (JS still keeps it current).
- CI: new `ci.yml` runs `astro check` + build on PRs (`@astrojs/check` added); Node 18 → 22 in workflows; removed the stray `bun.lock`.

### 2026-06-04
- Full redesign: replaced the "Nordic Editorial" theme with the **OUTRUN / synthwave** design (Claude Design handoff, "Outrun Sunset" direction).
- Ported the HTML/CSS/JS prototype into Astro: global stylesheet + interaction JS in `Layout.astro`, one component per section.
- Added `OffTheClock.astro` ("Off the clock" — coffee / cycling / photography).
- Fonts switched to Press Start 2P + Chakra Petch.
- Removed the day/night theme toggle (dark-only).
- **Removed Tailwind** (`@astrojs/tailwind`, `tailwindcss`, `tailwind.config.mjs`) — styling is now plain CSS with custom properties.
- The "Tweaks" live-editing panel from the prototype (React/Babel) was intentionally not ported.

### 2026-01-23
- Initial CLAUDE.md (documented the prior Nordic Editorial design).

---

*This documentation is maintained by AI assistants working on the project. Keep it updated when making significant changes.*
