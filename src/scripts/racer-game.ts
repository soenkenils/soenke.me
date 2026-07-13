/* BALTIC TURBO CHALLENGE — Konami-code easter egg.
   A homage to Lotus Turbo Challenge 2 (Magnetic Fields / Gremlin, Amiga 1991):
   the classic segmented pseudo-3D road (the Lou's-Pseudo-3d-Page / Out Run
   school) — project road segments, accumulate per-segment curve offsets, paint
   back-to-front. Everything is vector-drawn in the site palette; no image
   assets. This module is dynamic-imported on first unlock, never part of the
   main bundle. */

interface Segment {
  curve: number;
  y1: number; // world elevation at segment start
  y2: number; // world elevation at segment end
}

interface Row {
  n: number; // draw-distance step (fog)
  i: number; // segment index (color striping, pylons)
  x1: number; y1: number; w1: number; // near edge: screen center x, y, half width
  x2: number; y2: number; w2: number; // far edge
}

const W = 640;
const H = 360;
const SEG_LEN = 200;
const ROAD_W = 1000; // half road width in world units
const CAM_H = 900;
const CAM_DEPTH = 1 / Math.tan((100 / 2) * (Math.PI / 180)); // fov 100°
const DRAW_DIST = 140; // segments
const MAX_SPEED = SEG_LEN * 60;
const START_TIME = 45;
const CP_BONUS = 20;
const TOP_KMH = 320;
const BEST_KEY = 'racer.best';

function buildTrack(): Segment[] {
  const segs: Segment[] = [];
  let y = 0;
  const ease = (a: number, b: number, p: number) => a + (b - a) * (0.5 - Math.cos(p * Math.PI) / 2);
  // curve eases in over the first third of a section and out over the last,
  // so consecutive sections always join smoothly
  const add = (count: number, curve: number, dy: number) => {
    const y0 = y;
    const yEnd = y + dy * SEG_LEN;
    for (let n = 0; n < count; n++) {
      const p = n / count;
      const c = p < 1 / 3 ? curve * (p * 3) : p > 2 / 3 ? curve * ((1 - p) * 3) : curve;
      segs.push({ curve: c, y1: ease(y0, yEnd, p), y2: ease(y0, yEnd, (n + 1) / count) });
    }
    y = yEnd;
  };

  add(120, 0, 0); //     starting straight
  add(120, 2.2, 10); //  sweeping right, gentle rise
  add(90, 0, -14); //    downhill straight
  add(140, -3, 0); //    long left
  add(80, 0, 26); //     climb
  add(110, 3.4, -26); // hard right, dropping
  add(90, -2.2, 0); //   left
  add(120, 0, 24); //    big climb
  add(120, -3.6, -20); // hard left downhill
  add(100, 2.6, 0); //   right
  add(140, 0, 0); //     back straight
  add(90, 1.8, 0); //    final kink (elevation sums to 0 → seamless wrap)
  return segs;
}

/* checkpoint crossed between segment indices a → b (handles track wrap) */
function crossed(cp: number, a: number, b: number): boolean {
  return a < b ? cp > a && cp <= b : cp > a || cp <= b;
}

export function initRacer(dialog: HTMLDialogElement): { open(): void } {
  const canvas = dialog.querySelector('#racerCanvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const hudTime = dialog.querySelector('#rcTime') as HTMLElement;
  const hudSpeed = dialog.querySelector('#rcSpeed') as HTMLElement;
  const hudDist = dialog.querySelector('#rcDist') as HTMLElement;
  const hudBest = dialog.querySelector('#rcBest') as HTMLElement;
  const msg = dialog.querySelector('#racerMsg') as HTMLElement;
  const rmTitle = dialog.querySelector('#rmTitle') as HTMLElement;
  const rmSub = dialog.querySelector('#rmSub') as HTMLElement;
  const rmAction = dialog.querySelector('#rmAction') as HTMLElement;
  const flash = dialog.querySelector('#racerFlash') as HTMLElement;

  /* canvas can't use CSS vars directly — read the design tokens once.
     (Shades without a token mirror literals already used in the hero CSS.) */
  const css = getComputedStyle(document.documentElement);
  const tok = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  const PINK = tok('--pink', '#ff2e97');
  const CYAN = tok('--cyan', '#00eaff');
  const YELLOW = tok('--yellow', '#ffd319');
  const ROAD_A = tok('--panel', '#150830');
  const ROAD_B = tok('--panel-2', '#1b0b3d');
  const GROUND_A = tok('--bg-2', '#0c0220');
  const GROUND_B = tok('--bg', '#0a0118');
  const SUN = [tok('--sun-1', '#fff35b'), tok('--sun-2', '#ffab2e'), tok('--sun-3', '#ff5fa2'), tok('--sun-4', '#ff2e97')];
  const GRID = `rgba(${tok('--grid', '0, 234, 255')}, 0.16)`;
  const INK = tok('--ink', '#f3ecff'); // light phase of the rumble strip (red/white in the original)
  const HAZE = '#2a0a4d'; //             horizon haze (hero sky mid stop)

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const segments = buildTrack();
  const trackLen = segments.length * SEG_LEN;
  const cps = [Math.floor(segments.length / 3), Math.floor((2 * segments.length) / 3), 0];

  /* seeded stars, same LCG family as the hero starfield */
  let seed = 1991;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const stars = Array.from({ length: 42 }, () => ({
    x: rnd() * W, y: rnd() * H * 0.42, r: rnd() > 0.85 ? 2 : 1,
  }));

  let state: 'idle' | 'run' | 'over' = 'idle';
  let pos = 0;
  let playerX = 0; // -1..1 = on road
  let speed = 0;
  let time = START_TIME;
  let km = 0;
  let tick = 0;
  let prevIdx = 0;
  let raf = 0;
  let last = 0;
  let flashTimer: ReturnType<typeof setTimeout>;

  let best = 0;
  try { best = parseFloat(localStorage.getItem(BEST_KEY) || '0') || 0; } catch { /* storage blocked — session best only */ }

  const keys = { left: false, right: false, up: false, down: false };
  const KEYMAP: Record<string, keyof typeof keys> = {
    ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right',
    ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down',
  };

  function start() {
    state = 'run';
    pos = 0; playerX = 0; speed = 0; time = START_TIME; km = 0; prevIdx = 0;
    msg.hidden = true;
    updateHud(); // sync, so the HUD is correct even before the next frame
  }

  function gameOver() {
    state = 'over';
    if (km > best) {
      best = km;
      try { localStorage.setItem(BEST_KEY, String(best)); } catch { /* session best only */ }
    }
    rmTitle.textContent = 'GAME OVER';
    rmSub.textContent = `distance ${km.toFixed(2)} km · best ${best.toFixed(2)} km`;
    rmAction.textContent = 'ENTER = RETRY';
    msg.hidden = false;
  }

  function showFlash(text: string) {
    flash.textContent = text;
    flash.hidden = false;
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => { flash.hidden = true; }, 1100);
  }

  function update(dt: number) {
    const idx = Math.floor(pos / SEG_LEN) % segments.length;
    const seg = segments[idx];
    const ratio = speed / MAX_SPEED;

    const dx = dt * 2 * ratio;
    if (keys.left) playerX -= dx;
    if (keys.right) playerX += dx;
    playerX -= dx * ratio * seg.curve * 0.3; // centrifugal pull
    playerX = Math.max(-2.2, Math.min(2.2, playerX));

    if (keys.up) speed += (MAX_SPEED / 5) * dt;
    else if (keys.down) speed -= MAX_SPEED * dt;
    else speed -= (MAX_SPEED / 8) * dt;
    if (Math.abs(playerX) > 1.02 && speed > MAX_SPEED / 4) speed -= MAX_SPEED * 0.9 * dt; // gravel
    speed = Math.max(0, Math.min(MAX_SPEED, speed));

    pos = (pos + speed * dt) % trackLen;
    const newIdx = Math.floor(pos / SEG_LEN) % segments.length;
    if (newIdx !== prevIdx) {
      for (const cp of cps) {
        if (crossed(cp, prevIdx, newIdx)) {
          time = Math.min(time + CP_BONUS, 99);
          showFlash(`CHECKPOINT +${CP_BONUS}`);
        }
      }
      prevIdx = newIdx;
    }

    km += (ratio * TOP_KMH * dt) / 3600;
    time -= dt;
    tick += dt;
    if (time <= 0) { time = 0; gameOver(); }
  }

  function poly(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, fill: string) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.fill();
  }

  function drawSun() {
    const sx = W / 2, sy = H * 0.3, r = 55;
    const g = ctx.createLinearGradient(0, sy - r, 0, sy + r);
    g.addColorStop(0, SUN[0]); g.addColorStop(0.4, SUN[1]); g.addColorStop(0.75, SUN[2]); g.addColorStop(1, SUN[3]);
    ctx.save();
    ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = g;
    ctx.fillRect(sx - r, sy - r, r * 2, r * 2);
    ctx.fillStyle = '#160830'; // band cuts, same as the hero sun
    for (let y = sy; y < sy + r; y += 12) ctx.fillRect(sx - r, y + 7, r * 2, 4);
    ctx.restore();
  }

  function drawMountains() {
    const hy = H * 0.46;
    const pts: Array<[number, number]> = [
      [0.08, -16], [0.17, -6], [0.26, -24], [0.37, -9], [0.46, -20],
      [0.57, -7], [0.67, -22], [0.77, -10], [0.88, -18], [1, -4],
    ];
    ctx.fillStyle = '#34134f'; // hero .mtn fill
    ctx.beginPath();
    ctx.moveTo(0, hy);
    for (const [px, dy] of pts) ctx.lineTo(W * px, hy + dy);
    ctx.lineTo(W, hy + 30); ctx.lineTo(0, hy + 30);
    ctx.closePath();
    ctx.fill();
  }

  function drawPylons(row: Row) {
    const ph = row.w2 * 0.5;
    const pw = Math.max(1.5, row.w2 * 0.03);
    const color = row.i % 18 === 0 ? CYAN : PINK;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    for (const dir of [-1, 1]) {
      const px = row.x2 + dir * row.w2 * 1.45;
      ctx.fillRect(px - pw / 2, row.y2 - ph, pw, ph);
    }
    ctx.shadowBlur = 0;
  }

  function drawCar() {
    const offroad = state === 'run' && Math.abs(playerX) > 1.02 && speed > 0;
    ctx.save();
    ctx.translate(W / 2 + (offroad ? Math.sin(tick * 60) * 2 : 0), H - 48 + (offroad ? Math.sin(tick * 47) * 1.5 : 0));
    if (state === 'run') ctx.rotate(((keys.left ? -1 : 0) + (keys.right ? 1 : 0)) * 0.03);
    ctx.scale(1.35, 1.35); // the original car fills a good chunk of the screen

    /* rear view modelled on the Lotus Esprit tail: boxy shell, wide louvered
       rear window, two segmented tail-light clusters, bumper, shoulder mirrors */
    const DARK = '#08020e';

    ctx.fillStyle = DARK; // wheels peek out under the body
    ctx.fillRect(-44, 10, 16, 12);
    ctx.fillRect(28, 10, 16, 12);

    ctx.beginPath(); // body shell — near-rectangular tail, tapering to the roof
    ctx.moveTo(-48, 16); ctx.lineTo(-46, -10); ctx.lineTo(-40, -14); ctx.lineTo(-28, -30);
    ctx.lineTo(28, -30); ctx.lineTo(40, -14); ctx.lineTo(46, -10); ctx.lineTo(48, 16);
    ctx.closePath();
    ctx.fillStyle = ROAD_B;
    ctx.fill();
    ctx.strokeStyle = PINK; ctx.lineWidth = 2;
    ctx.shadowColor = PINK; ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.beginPath(); // rear window
    ctx.moveTo(-34, -12); ctx.lineTo(-25, -27); ctx.lineTo(25, -27); ctx.lineTo(34, -12);
    ctx.closePath();
    ctx.fillStyle = DARK;
    ctx.fill();
    ctx.strokeStyle = CYAN; ctx.lineWidth = 1.5;
    ctx.shadowColor = CYAN; ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(0, 234, 255, 0.35)'; // glass louvers
    ctx.lineWidth = 1;
    for (const ly of [-16, -20, -24]) {
      const t = (ly + 12) / -15; // 0 at window base, 1 at top
      const hw = 34 + (25 - 34) * t - 2;
      ctx.beginPath();
      ctx.moveTo(-hw, ly); ctx.lineTo(hw, ly);
      ctx.stroke();
    }

    ctx.fillStyle = PINK; // tail-light clusters
    ctx.shadowColor = PINK; ctx.shadowBlur = 12;
    ctx.fillRect(-42, -6, 26, 9);
    ctx.fillRect(16, -6, 26, 9);
    ctx.shadowBlur = 0;
    ctx.fillStyle = DARK; // cluster segment dividers + centre panel
    ctx.fillRect(-34, -6, 2, 9);
    ctx.fillRect(-26, -6, 2, 9);
    ctx.fillRect(24, -6, 2, 9);
    ctx.fillRect(32, -6, 2, 9);
    ctx.fillRect(-16, -6, 32, 9);
    ctx.fillStyle = YELLOW; // badge
    ctx.fillRect(-3, -4, 6, 3);

    ctx.fillStyle = DARK; // bumper strip
    ctx.fillRect(-46, 8, 92, 6);

    ctx.fillStyle = ROAD_B; // shoulder mirrors
    ctx.strokeStyle = PINK; ctx.lineWidth = 1;
    ctx.fillRect(-54, -18, 9, 6); ctx.strokeRect(-54, -18, 9, 6);
    ctx.fillRect(45, -18, 9, 6); ctx.strokeRect(45, -18, 9, 6);

    if (state === 'run' && keys.up && Math.floor(tick * 20) % 2 === 0) {
      ctx.fillStyle = YELLOW; // exhaust flicker
      ctx.fillRect(-11, 17, 7, 5);
      ctx.fillRect(4, 17, 7, 5);
    }
    ctx.restore();
  }

  function render() {
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
    sky.addColorStop(0, '#1a0636'); // hero sky gradient
    sky.addColorStop(1, '#3a0e52');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for (const s of stars) ctx.fillRect(s.x, s.y, s.r, s.r);
    drawSun();
    drawMountains();

    /* project the road: accumulate curve offsets, collect visible rows
       front-to-back (clipY culls segments hidden behind hill crests),
       then paint back-to-front */
    const baseIdx = Math.floor(pos / SEG_LEN) % segments.length;
    const basePct = (pos % SEG_LEN) / SEG_LEN;
    const baseSeg = segments[baseIdx];
    const camY = CAM_H + baseSeg.y1 + (baseSeg.y2 - baseSeg.y1) * basePct;
    const camX = playerX * ROAD_W;

    let x = 0;
    let dxAcc = -(baseSeg.curve * basePct);
    let clipY = H;
    const rows: Row[] = [];

    for (let n = 0; n < DRAW_DIST; n++) {
      const i = (baseIdx + n) % segments.length;
      const seg = segments[i];
      const z1 = n * SEG_LEN - basePct * SEG_LEN;
      const z2 = z1 + SEG_LEN;
      const cx1 = x;
      const cx2 = x + dxAcc;
      x += dxAcc;
      dxAcc += seg.curve;
      if (z1 < 1) continue; // behind / at the camera

      const sc1 = CAM_DEPTH / z1;
      const sc2 = CAM_DEPTH / z2;
      const y1 = Math.round(H / 2 - sc1 * (seg.y1 - camY) * (H / 2));
      const y2 = Math.round(H / 2 - sc2 * (seg.y2 - camY) * (H / 2));
      if (y2 >= clipY || y2 >= y1) continue; // hidden behind a crest
      rows.push({
        n, i,
        x1: Math.round(W / 2 + sc1 * (cx1 - camX) * (W / 2)), y1, w1: Math.round(sc1 * ROAD_W * (W / 2)),
        x2: Math.round(W / 2 + sc2 * (cx2 - camX) * (W / 2)), y2, w2: Math.round(sc2 * ROAD_W * (W / 2)),
      });
      clipY = y2;
    }

    for (let r = rows.length - 1; r >= 0; r--) {
      const row = rows[r];
      const light = Math.floor(row.i / 3) % 2 === 0;

      ctx.fillStyle = light ? GROUND_A : GROUND_B;
      ctx.fillRect(0, row.y2, W, row.y1 - row.y2 + 1);
      if (row.i % 4 === 0) { // ground grid line — echoes the hero grid floor
        ctx.fillStyle = GRID;
        ctx.fillRect(0, row.y1, W, 1);
      }

      poly(row.x1 - row.w1, row.y1, row.x1 + row.w1, row.y1, row.x2 + row.w2, row.y2, row.x2 - row.w2, row.y2, light ? ROAD_A : ROAD_B);
      const r1 = Math.max(1, row.w1 * 0.14);
      const r2 = Math.max(1, row.w2 * 0.14);
      poly(row.x1 - row.w1 - r1, row.y1, row.x1 - row.w1, row.y1, row.x2 - row.w2, row.y2, row.x2 - row.w2 - r2, row.y2, light ? PINK : INK);
      poly(row.x1 + row.w1, row.y1, row.x1 + row.w1 + r1, row.y1, row.x2 + row.w2 + r2, row.y2, row.x2 + row.w2, row.y2, light ? PINK : INK);
      if (row.i % 6 < 2) { // short dashes, two dividers → three lanes, like the Lotus 2 motorway
        for (const lane of [-1 / 3, 1 / 3]) {
          const l1 = row.x1 + row.w1 * lane;
          const l2 = row.x2 + row.w2 * lane;
          poly(l1 - row.w1 * 0.015, row.y1, l1 + row.w1 * 0.015, row.y1, l2 + row.w2 * 0.015, row.y2, l2 - row.w2 * 0.015, row.y2, CYAN);
        }
      }
      if (row.i % 9 === 0) drawPylons(row);

      const fog = row.n > DRAW_DIST * 0.7 ? Math.min(1, (row.n - DRAW_DIST * 0.7) / (DRAW_DIST * 0.3)) : 0;
      if (fog > 0) {
        ctx.globalAlpha = fog;
        ctx.fillStyle = HAZE;
        ctx.fillRect(0, row.y2, W, row.y1 - row.y2 + 1);
        ctx.globalAlpha = 1;
      }
    }

    drawCar();
  }

  function updateHud() {
    hudTime.textContent = state === 'run' ? String(Math.ceil(time)) : '--';
    hudTime.classList.toggle('warn', state === 'run' && time < 10);
    hudSpeed.textContent = String(Math.round((speed / MAX_SPEED) * TOP_KMH));
    hudDist.textContent = km.toFixed(2);
    hudBest.textContent = best.toFixed(2);
  }

  function frame(now: number) {
    if (!dialog.open) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (state === 'run') {
      update(dt);
    } else if (state === 'idle' && !reduced) {
      pos = (pos + MAX_SPEED * 0.12 * dt) % trackLen; // attract-mode cruise
      tick += dt;
    }
    render();
    updateHud();
    raf = requestAnimationFrame(frame);
  }

  function onKey(e: KeyboardEvent, down: boolean) {
    if (!dialog.open) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k in KEYMAP) {
      keys[KEYMAP[k]] = down;
      e.preventDefault();
    } else if (down && !e.repeat && (k === 'Enter' || k === ' ')) {
      e.preventDefault();
      if (state !== 'run') start();
    }
  }
  window.addEventListener('keydown', (e) => onKey(e, true));
  window.addEventListener('keyup', (e) => onKey(e, false));

  dialog.addEventListener('close', () => {
    cancelAnimationFrame(raf);
    keys.left = keys.right = keys.up = keys.down = false;
  });

  return {
    open() {
      state = 'idle';
      pos = 0; playerX = 0; speed = 0; time = START_TIME; km = 0; prevIdx = 0;
      rmTitle.textContent = 'BALTIC TURBO CHALLENGE';
      rmSub.textContent = 'an homage to lotus turbo challenge 2 · amiga 1991';
      rmAction.textContent = 'PRESS ENTER';
      msg.hidden = false;
      flash.hidden = true;
      updateHud();
      dialog.showModal();
      last = performance.now();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    },
  };
}
