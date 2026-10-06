---
name: outrun-site
description: OUTRUN design-system reference and step-by-step recipes for soenke.me — use when adding or restyling a section, retuning colors/glow, adding fonts or gallery photos, or running the pre-merge testing checklist.
---

# OUTRUN design system & common tasks

All styles live in the global stylesheet in `src/layouts/Layout.astro` (`<style is:global>`); tokens are CSS custom properties on `:root` there.

## Design reference

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

## Common Tasks

### Adding a New Section
1. Create `src/components/NewSection.astro` using the `.section` / `.wrap` / `.kicker` / `.h2` scaffold.
2. Import it into `src/pages/index.astro` in the right order.
3. Add a nav link in `Header.astro` (desktop `.nav-links` **and** `#mobileMenu`).
4. Give the section a unique kebab-case `id`; the active-nav JS picks it up automatically from the nav `href`.
5. Add `.reveal` (+ `.d1/.d2/.d3`) to elements that should animate in.

### Retuning Colors / Glow / Effects
1. Edit the CSS custom properties in `Layout.astro` `:root` (palette, `--glow`, `--fx`, `--scan`).
2. For a one-off accent, set `style="--accent: var(--…);"` on the element.

### Adding New Fonts
1. Install the family: `npm install @fontsource/<family>` (keep fonts self-hosted — do **not** add Google Fonts `<link>`s).
2. Import the needed weights in `Layout.astro` frontmatter (e.g. `import '@fontsource/<family>/600.css';`).
3. Reference the family directly in the global CSS (there is no font-family config file).

### Adding Photos to the Frames Gallery
1. Export from the photo library into `src/assets/img/` (gitignored scratch space).
2. Create a web master: `magick <src> -auto-orient -strip -resize '1600x1600>' -quality 80 src/assets/photos/<group>/<descriptive-name>.jpg` (**always `-strip`** — removes EXIF incl. any location data).
3. Add an entry (file + alt text) to the matching group in `Frames.astro`. The `import.meta.glob` picks the file up automatically; Astro generates responsive avif (q50) + webp (q75) variants at build time (`widths` 420/800/1200, lazy-loaded), served via `<picture>`. Don't equalise the two quality numbers — see the 2026-08-06 entry in `CHANGELOG.md`.
4. Only commit the prepared masters in `src/assets/photos/` — never the camera originals.

### Updating Content
- **Favicon**: `public/favicon.svg` · **Domain**: `public/CNAME` + `astro.config.mjs` · **Meta**: `Layout.astro` props (passed from each page).

## Testing Checklist
- [ ] `npm run build` succeeds
- [ ] `npm run preview` looks right
- [ ] Responsive at mobile / tablet / desktop (esp. 900px, 560px)
- [ ] Scroll-reveal fires; nothing stays hidden
- [ ] Nav links scroll to the right sections; active state tracks
- [ ] Mobile menu opens/closes (burger, link click, Escape)
- [ ] `prefers-reduced-motion` disables animations
- [ ] Color contrast is acceptable; external links use `target="_blank"` + `rel="noopener"`
