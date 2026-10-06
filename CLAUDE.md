# CLAUDE.md

**soenke.me** is Sönke Nommensen's personal site (purely personal — no employer/work references) in an **OUTRUN / synthwave** aesthetic: neon glow, animated perspective grid, 80s sunset, arcade typography. It's dark-only by design. Static Astro site deployed to GitHub Pages.

The design came from a Claude Design handoff bundle ("Outrun Sunset"). The HTML/CSS/JS prototype was ported into Astro: shared CSS and interaction JS live in `src/layouts/Layout.astro`; each page section is its own `.astro` component.

- Design-system reference and step-by-step recipes (new section, fonts, gallery photos, testing checklist): the `outrun-site` skill.
- History and the reasoning behind past decisions: `CHANGELOG.md`.

## Commands & Tooling

- **Package manager is npm** (`package-lock.json`, CI uses `npm ci`), not bun.
- `npm run check` (`astro check`) is the type-check gate in CI and deploy.
- `npm run preview` **daemonises** (Astro ≥ 7.2) — stop it with `npx astro preview stop` (`npx astro preview status` to check). If port 4321 is busy, a preview daemon is still running.
- `npm run test:e2e` builds first locally, then runs smoke + axe a11y tests. The tests serve `dist/` via `scripts/preview-server.mjs` — don't point Playwright's `webServer` at `astro preview`; it hangs on Linux.
- `npm run test:lighthouse` needs a running preview server.
- If browserslist warns about stale data, run `npx update-browserslist-db` — don't add `caniuse-lite` as a direct dependency.

## Git Workflow

1. `main` is production (every push deploys).
2. Use the `claude/` prefix for AI-assisted feature branches.
3. Push to the feature branch, then open a PR to `main`.
4. Always confirm the current branch (`git branch --show-current`) before committing.

## Conventions

- **CSS single source of truth**: the global stylesheet in `Layout.astro` (`<style is:global>`). Add or change styles there, not in component-scoped `<style>` blocks, so class names resolve across all components.
- **Design tokens**: all colors/effects are CSS custom properties on `Layout.astro` `:root`. Use `var(--pink)`, `var(--line)`, `calc(Npx*var(--glow))`; set per-element accents inline via `style="--accent: var(--cyan);"`.
- Most components are pure markup with empty frontmatter — all styling is global.
- Shared interactions (starfield, scroll reveal, active-nav, mobile menu, footer year) live in **one IIFE** in `Layout.astro`. Keep new global behavior there.
- The reveal/active-nav throttle is **timer-based** (`setTimeout`), intentionally — it fires even when the tab isn't painting, unlike `requestAnimationFrame`.
- Nav hrefs use the `/#id` form so they also work from `/datenschutz` and `/404`. `<main>` carries `id="top"` (logo and skip-link target).
- Stay on-aesthetic: arcade type (Press Start 2P) on headers only; body stays in Chakra Petch for readability.
- Test responsiveness at the 900px and 560px breakpoints. Respect `prefers-reduced-motion` for any new animation.
- Semantic HTML + accessibility (ARIA labels, alt text, focus states, skip-link). Decorative layers (stars, sun, grid, overlays) are `aria-hidden`.

### Don't Do
- ❌ Reintroduce Tailwind or any CSS framework without discussion
- ❌ Hard-code colors (`#fff`, raw hex) — use the design tokens
- ❌ Put shared styling in component-scoped `<style>` blocks (use the global sheet)
- ❌ Add a light/day theme — the site is intentionally dark-only OUTRUN
- ❌ Swap the timer-based scroll throttle back to `requestAnimationFrame`
- ❌ Add Google Fonts `<link>`s — fonts are self-hosted via Fontsource (GDPR)
- ❌ Add dependencies without discussion
- ❌ Commit `dist/` or `node_modules/`
- ❌ Commit camera originals (`src/assets/img/` is gitignored) — only the prepared masters in `src/assets/photos/`, always EXIF-stripped (`magick … -strip`)
- ❌ Link or publish `playlists-tidal-mcp` / `walkie-talkie` in Projects — they're intentionally private (mention only)

### Do
- ✅ Use the design tokens and the `.section` scaffold
- ✅ Keep components small and mostly markup-only
- ✅ Gate animations behind `prefers-reduced-motion`
- ✅ Keep accessibility (ARIA, focus, skip-link) intact
- ✅ Record significant changes (and the *why*) in `CHANGELOG.md`
