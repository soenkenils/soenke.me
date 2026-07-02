# CLAUDE.md - AI Assistant Development Guide

> Comprehensive documentation for AI assistants working on soenke.me

Last Updated: 2026-07-02

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
│       ├── ci.yml              # PR checks: astro check + build
│       └── deploy.yml          # GitHub Actions deployment workflow
├── public/
│   ├── apple-touch-icon.png    # iOS home-screen icon (generated, see scripts/)
│   ├── CNAME                   # Custom domain configuration
│   ├── favicon.svg             # Neon pixel-S favicon (OUTRUN style)
│   ├── og.png                  # Social preview image (generated, see scripts/)
│   └── robots.txt              # Allows all; points to sitemap-index.xml
├── scripts/
│   └── generate-og.mjs         # Dependency-free generator for og.png + apple-touch-icon.png
├── src/
│   ├── assets/
│   │   └── profile.jpg         # (currently unused — design is all-neon, no photos)
│   ├── components/
│   │   ├── About.astro         # 01 · About section
│   │   ├── Contact.astro       # 03 · Contact section
│   │   ├── Footer.astro        # Footer
│   │   ├── Header.astro        # Fixed neon nav + mobile menu (links defined once in frontmatter)
│   │   ├── Hero.astro          # Outrun sunset hero
│   │   ├── Icon.astro          # Shared social icons (email/github/linkedin)
│   │   ├── OffTheClock.astro   # 03 · Off the clock (coffee / cycling / photography)
│   │   └── Projects.astro      # 02 · Projects (MCP servers + walkie-talkie)
│   ├── layouts/
│   │   └── Layout.astro        # Base layout: global CSS, fonts, fx overlays, interaction JS
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
| 04    | Contact         | `Contact.astro`    | `#contact`    |
| —     | Footer          | `Footer.astro`     | —             |

`<main>` carries `id="top"` (the logo links to `/#top`; the skip-link targets `#top`). Nav links: About, Projects, Off the clock, **Say hi** (the `.nav-cta`, → `/#contact`). All nav hrefs use the `/#id` form so they also work from `/datenschutz` and `/404`.

---

## Development Workflow

### Available Scripts

```bash
# Start development server (hot reload on http://localhost:4321)
npm run dev      # or: npm start

# Build for production (outputs to dist/)
npm run build

# Preview production build locally
npm run preview

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

**GitHub Actions** (`.github/workflows/deploy.yml`): checkout → setup Node 22 (npm cache) → setup Pages → `npm ci` → `npm run build` → upload `dist/` → deploy to GitHub Pages.

Pull requests run `.github/workflows/ci.yml` instead: `npm ci` → `npm run check` → `npm run build`.

**Environment**:
- **Runner**: `ubuntu-latest`
- **Node Version**: 22
- **Permissions**: `contents: read`, `pages: write`, `id-token: write`
- **Concurrency**: One deployment at a time (cancel previous on new push)

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
