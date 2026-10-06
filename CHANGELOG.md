# Changelog

Moved out of CLAUDE.md so it isn't loaded into every session. Newest first; record significant changes (and the *why*) here.

### 2026-09-24
- **Racer: rivals + a more varied track.**
  - **8 CPU rivals** (`Rival`, `gridRivals` / `updateRivals` / `resolveRivals`
    in `racer-game.ts`). They start on a staggered two-column grid ahead of the
    player (middle lane open) and cruise at 42–72% of the player's top speed
    (~135–230 vs 320 km/h), accelerating more slowly off the line. Tuned to be
    *easy* to pass on purpose — keep it that way: a rival never changes lane
    while the player is within 10 segments behind it (`guard`), contact is a
    gentle tap (speed → 80% of the rival's, small sideways nudge, no time
    penalty), and the hitbox is a little narrower than the drawn cars. Passed
    rivals respawn beyond the draw distance, so traffic never runs out. HUD
    shows net overtakes (`#rcPass`); game-over line includes them.
  - Rivals reuse the player's car drawing (`drawCar(x, y, s, accent)`) in
    cyan / yellow / purple / orange, painted with their road row so hill
    crests hide them; cars between camera and player are painted over the
    player's car. `PLAYER_Z` / `PLAYER_W` derive the player's world depth from
    where the car is drawn, so collisions match what you see.
  - **Track ~1.7× longer (2250 segments) with four scenery zones:** Coast
    (pylons, striped lighthouses with a sweeping beam), Forest (neon pines,
    rolling hills, a tight left), a **Tunnel** (walls, ceiling light bars, neon
    wall rails, portal cut into a hill face — tunnels must stay flat, the
    ceiling projection assumes it) and City (lit blocks, chicane, old-town
    hill). New S-bends, crests and chicanes; elevation still sums to 0.
    Checkpoints now show a chequered gantry. Longer laps also tighten the
    timer balance a bit (3 checkpoints per lap, unchanged).
  - e2e: new smoke test — full gas from the grid passes at least one rival.
- **Racer: easier to find, playable on phones.**
  - **Three quick taps/clicks on the hero sun** (within 800ms of each other)
    open the game — the only way in on touch devices, where the Konami code
    can't be typed. The listener sits on `.hero` and hit-tests the sun circle
    by coordinates, because `.hero-content` covers the sun and would be the
    event target. Each tap flashes the sun (`.sun.poke`); the second tap
    warms the engine chunk. `.hero` has `touch-action: manipulation` so
    double-tap zoom doesn't swallow taps.
  - **Touch pad** (`.rp-group` / `.rp-btn` with `data-key`) shown only under
    `(hover: none) and (pointer: coarse)`: ◀ ▶ steer, GAS (also starts the
    race) and BRAKE. Portrait: pad row under the screen; landscape: steering
    left, pedals right (`.racer-stage` grid). Buttons drop the implicit touch
    pointer capture, so a thumb can slide ◀ → ▶. Tapping the screen also
    (re)starts; start/retry labels read `TAP …` on touch. The ✕ button is the
    phone's Escape.
  - Canvas width is now also capped by viewport height, and the HUD/title
    type shrinks at ≤560px so the overlay fits a ~360px-wide screen.
  - e2e: desktop triple-click on the sun; phone (390×844, touch) — tap the
    sun ×3, GAS starts the race, ✕ closes.

### 2026-09-12
- astro 7.2.9 → 7.3.2, @astrojs/sitemap 3.7.3 → 3.7.4 (`npx @astrojs/upgrade`).
  `npm audit fix` for fast-uri / nanoid / svgo (3 high, all build-time) →
  **0** vulnerabilities. check, build, e2e all green; no code changes needed.
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
