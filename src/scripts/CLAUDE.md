# Racer ("Baltic Turbo Challenge") — gotchas

Full history and rationale: `CHANGELOG.md` (2026-07-13 … 2026-09-24 entries).

- **Rivals must stay easy to pass** — deliberate tuning: they cruise at 42–72% of the player's top speed, never change lane while the player is within 10 segments behind (`guard`), contact is a gentle tap with no time penalty, and the hitbox is narrower than the drawn cars. Don't make them harder.
- **Tunnels must stay flat** — the ceiling projection assumes zero elevation. Track elevation must still sum to 0.
- `PLAYER_Z` / `PLAYER_W` derive the player's world depth from where the car is drawn — keep collisions matching what is on screen.
- `frame()` clamps `dt` to `>= 0`: Chrome can stamp the first rAF callback earlier than the `performance.now()` taken in `open()`; a negative `dt` rolled `pos` below 0, `render()` threw on `segments[-1]`, and the loop died silently. Keep the clamp.
- Lazy load: the trigger warms the chunk at `WARM_AT = 4` (↑↑↓↓) and opens the dialog immediately with `LOADING…`. `load()` drops a rejected `import()` promise so a network blip doesn't kill the egg for the rest of the page load. Keep both.
- Entry points: Konami code, or three taps/clicks on the hero sun within 800ms (hit-tested by coordinates on `.hero`, because `.hero-content` covers the sun). Touch pad only under `(hover: none) and (pointer: coarse)`.
- Music is procedural Web Audio, **off by default**; the `AudioContext` is only created on first enable (autoplay policy). Closing the dialog stops it and resets the toggle.
