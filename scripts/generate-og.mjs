/**
 * generate-og.mjs — renders public/og.png (1200×630 social preview)
 * and public/apple-touch-icon.png (180×180).
 *
 * Dependency-free: draws the synthwave scene (sky, stars, half-set sun,
 * perspective grid) plus text in a hand-defined arcade pixel font, then
 * encodes the PNGs manually via node:zlib (adaptive row filtering keeps
 * the gradient-heavy images small).
 *
 * Regenerate with:  node scripts/generate-og.mjs
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PUB = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

/* ---------- tiny float-RGB canvas ---------- */
const hex = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
const lerp = (a, b, t) => a + (b - a) * t;
const mix = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];

function canvas(W, H) {
  const fb = new Float64Array(W * H * 3);
  return {
    W, H, fb,
    put(x, y, [r, g, b]) {
      const i = (y * W + x) * 3;
      fb[i] = r; fb[i + 1] = g; fb[i + 2] = b;
    },
    add(x, y, [r, g, b], a) {
      const i = (y * W + x) * 3;
      fb[i] += r * a; fb[i + 1] += g * a; fb[i + 2] += b * a;
    },
  };
}

/* vertical gradient over y0..y1 from color stops [(t, rgb), …] */
function gradientRows(c, y0, y1, stops) {
  for (let y = y0; y < y1; y++) {
    const t = (y - y0) / (y1 - y0);
    let k = 0;
    while (k < stops.length - 2 && t > stops[k + 1][0]) k++;
    const col = mix(stops[k][1], stops[k + 1][1], (t - stops[k][0]) / (stops[k + 1][0] - stops[k][0]));
    for (let x = 0; x < c.W; x++) c.put(x, y, col);
  }
}

/* perspective grid floor below `horizon`, vanishing point at (vpx, horizon) */
function gridFloor(c, horizon, vpx, spacing, color, gain) {
  const hLines = [];
  for (let n = 1; n <= 28; n++) hLines.push(horizon + (c.H - horizon) / n);
  for (let y = horizon + 1; y < c.H; y++) {
    const t = (y - horizon) / (c.H - horizon);
    const fade = Math.min(1, t * 2.6);
    let dh = 1e9;
    for (const ly of hLines) dh = Math.min(dh, Math.abs(y - ly));
    const hI = Math.exp(-(dh * dh) / (2 * 1.2 * 1.2)) + Math.exp(-(dh * dh) / (2 * 5 * 5)) * 0.3;
    for (let x = 0; x < c.W; x++) {
      const u = (x - vpx) / (spacing * t);
      const du = Math.abs(u - Math.round(u)) * spacing * t;
      const vI = Math.exp(-(du * du) / (2 * 1.2 * 1.2)) + Math.exp(-(du * du) / (2 * 5 * 5)) * 0.3;
      const I = Math.min(1.4, hI + vI) * gain * fade;
      if (I > 0.004) c.add(x, y, color, I);
    }
  }
  for (let y = Math.max(0, horizon - 6); y < Math.min(c.H, horizon + 7); y++) {
    const g = Math.exp(-((y - horizon) * (y - horizon)) / (2 * 2.2 * 2.2)) * gain;
    for (let x = 0; x < c.W; x++) c.add(x, y, color, g);
  }
}

/* CRT scanlines + vignette, multiplied over the whole frame */
function crt(c, cx, cy) {
  for (let y = 0; y < c.H; y++) {
    const scan = y % 4 < 2 ? 0.84 : 1;
    for (let x = 0; x < c.W; x++) {
      const dx = (x - cx) / (c.W * 0.65), dy = (y - cy) / (c.H * 0.89);
      const d = Math.sqrt(dx * dx + dy * dy);
      const vig = 1 - 0.5 * Math.min(1, Math.max(0, (d - 0.55) / 0.45));
      const i = (y * c.W + x) * 3;
      c.fb[i] *= scan * vig; c.fb[i + 1] *= scan * vig; c.fb[i + 2] *= scan * vig;
    }
  }
}

/* ---------- arcade pixel font (5×7, '.'=2 wide, Ö = O + umlaut) ---------- */
const FONT = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  G: ['01111', '10000', '10000', '10111', '10001', '10001', '01110'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '11001', '10101', '10011', '10011', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  '.': ['00', '00', '00', '00', '00', '11', '11'],
  ' ': ['000', '000', '000', '000', '000', '000', '000'],
};
const glyphW = (ch) => FONT[ch === 'Ö' ? 'O' : ch][0].length;

function drawTextMask(c, mask, text, centerX, topY, scale) {
  const cells = [...text].reduce((w, ch, i) => w + glyphW(ch) + (i ? 1 : 0), 0);
  let x = Math.round(centerX - (cells * scale) / 2);
  const fill = (cx, cy) => {
    for (let dy = 0; dy < scale; dy++)
      for (let dx = 0; dx < scale; dx++) {
        const px = cx + dx, py = cy + dy;
        if (px >= 0 && px < c.W && py >= 0 && py < c.H) mask[py * c.W + px] = 1;
      }
  };
  for (const ch of text) {
    const rows = FONT[ch === 'Ö' ? 'O' : ch];
    if (ch === 'Ö') { fill(x + scale, topY - 2 * scale); fill(x + 3 * scale, topY - 2 * scale); }
    rows.forEach((row, ry) => {
      [...row].forEach((bit, rx) => { if (bit === '1') fill(x + rx * scale, topY + ry * scale); });
    });
    x += (glyphW(ch) + 1) * scale;
  }
}

function boxBlur(src, W, H, r, passes) {
  let a = Float64Array.from(src);
  let b = new Float64Array(a.length);
  const win = 2 * r + 1;
  for (let p = 0; p < passes; p++) {
    for (let y = 0; y < H; y++) {
      let sum = 0;
      const row = y * W;
      for (let x = -r; x <= r; x++) sum += a[row + Math.min(W - 1, Math.max(0, x))];
      for (let x = 0; x < W; x++) {
        b[row + x] = sum / win;
        sum += a[row + Math.min(W - 1, x + r + 1)] - a[row + Math.max(0, x - r)];
      }
    }
    for (let x = 0; x < W; x++) {
      let sum = 0;
      for (let y = -r; y <= r; y++) sum += b[Math.min(H - 1, Math.max(0, y)) * W + x];
      for (let y = 0; y < H; y++) {
        a[y * W + x] = sum / win;
        sum += b[Math.min(H - 1, y + r + 1) * W + x] - b[Math.max(0, y - r) * W + x];
      }
    }
  }
  return a;
}

function neonText(c, text, centerX, topY, scale, glowRGB, coreRGB, gain) {
  const mask = new Float64Array(c.W * c.H);
  drawTextMask(c, mask, text, centerX, topY, scale);
  const tight = boxBlur(mask, c.W, c.H, Math.max(2, Math.round(scale * 0.5)), 3);
  const wide = boxBlur(mask, c.W, c.H, Math.max(5, Math.round(scale * 1.6)), 3);
  for (let i = 0; i < mask.length; i++) {
    const g = Math.min(1, tight[i] * 2.0) * 0.85 * gain + Math.min(1, wide[i] * 3.0) * 0.45 * gain;
    if (g > 0.004) c.add(i % c.W, (i / c.W) | 0, glowRGB, g);
  }
  for (let i = 0; i < mask.length; i++)
    if (mask[i] > 0.5) c.put(i % c.W, (i / c.W) | 0, coreRGB);
}

/* ---------- PNG encode (RGB8, adaptive row filtering, no deps) ---------- */
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let v = n;
  for (let k = 0; k < 8; k++) v = v & 1 ? 0xedb88320 ^ (v >>> 1) : v >>> 1;
  crcTable[n] = v;
}
const crc32 = (buf) => {
  let v = ~0;
  for (const byte of buf) v = crcTable[(v ^ byte) & 0xff] ^ (v >>> 8);
  return ~v >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};
const paeth = (a, b, p) => {
  const q = a + b - p, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - p);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : p;
};

function encodePNG(c) {
  const { W, H, fb } = c;
  const bpr = W * 3;
  const cur = Buffer.alloc(bpr);
  let prev = Buffer.alloc(bpr); // zero row above the image, per spec
  const out = Buffer.alloc(H * (bpr + 1));
  const cand = [0, 1, 2, 3, 4].map(() => Buffer.alloc(bpr));
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < bpr; x++)
      cur[x] = Math.min(255, Math.max(0, Math.round(fb[y * bpr + x])));
    for (let x = 0; x < bpr; x++) {
      const left = x >= 3 ? cur[x - 3] : 0;
      const upLeft = x >= 3 ? prev[x - 3] : 0;
      cand[0][x] = cur[x];
      cand[1][x] = (cur[x] - left) & 0xff;
      cand[2][x] = (cur[x] - prev[x]) & 0xff;
      cand[3][x] = (cur[x] - ((left + prev[x]) >> 1)) & 0xff;
      cand[4][x] = (cur[x] - paeth(left, prev[x], upLeft)) & 0xff;
    }
    let best = 0, bestScore = Infinity;
    for (let f = 0; f < 5; f++) {
      let score = 0;
      const cf = cand[f];
      for (let x = 0; x < bpr; x++) { const v = cf[x]; score += v < 128 ? v : 256 - v; }
      if (score < bestScore) { bestScore = score; best = f; }
    }
    out[y * (bpr + 1)] = best;
    cand[best].copy(out, y * (bpr + 1) + 1);
    cur.copy(prev);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(out, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function write(name, c) {
  const png = encodePNG(c);
  writeFileSync(join(PUB, name), png);
  console.log(`wrote public/${name} (${(png.length / 1024).toFixed(1)} kB)`);
}

/* =================================================================
   og.png — 1200×630 social preview
   ================================================================= */
{
  const c = canvas(1200, 630);
  const HORIZON = 470;

  gradientRows(c, 0, HORIZON, [
    [0.0, hex('#1a0636')], [0.45, hex('#2a0a4d')], [0.78, hex('#3a0e52')], [1.0, hex('#2b0a40')],
  ]);
  gradientRows(c, HORIZON, 630, [[0, hex('#140628')], [1, hex('#07010f')]]);

  /* stars (same LCG as the site, seed 1337) */
  let seed = 1337;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280), seed / 233280);
  for (let i = 0; i < 90; i++) {
    const sx = Math.floor(rnd() * (c.W - 2));
    const sy = Math.floor(rnd() * 320);
    const b = 0.25 + rnd() * 0.75;
    const size = rnd() > 0.85 ? 2 : 1;
    for (let dy = 0; dy < size; dy++)
      for (let dx = 0; dx < size; dx++) c.add(sx + dx, sy + dy, [255, 255, 255], b * 0.8);
  }

  /* sun: half-set on the horizon, banded */
  const SUN_CX = 600, SUN_CY = 560, SUN_R = 170; // visible arc: y 390..470
  const sun1 = hex('#fff35b'), sun2 = hex('#ffab2e'), sun3 = hex('#ff5fa2');
  for (let y = SUN_CY - SUN_R; y < HORIZON; y++) {
    if (y > 408 && (HORIZON - y) % 14 < 4) continue; // sky bands near the horizon
    const half = Math.sqrt(SUN_R * SUN_R - (SUN_CY - y) * (SUN_CY - y));
    const v = (y - (SUN_CY - SUN_R)) / (HORIZON - (SUN_CY - SUN_R));
    const col = v < 0.5 ? mix(sun1, sun2, v * 2) : mix(sun2, sun3, (v - 0.5) * 2);
    for (let x = Math.ceil(SUN_CX - half); x <= SUN_CX + half; x++) c.put(x, y, col);
  }
  for (let y = 0; y < c.H; y++)
    for (let x = 0; x < c.W; x++) {
      const d = Math.hypot(x - SUN_CX, y - HORIZON);
      c.add(x, y, [255, 90, 160], Math.exp(-(d * d) / (230 * 230)) * 0.32);
      c.add(x, y, [177, 74, 237], Math.exp(-(d * d) / (430 * 430)) * 0.16);
    }

  gridFloor(c, HORIZON, 600, 80, [0, 234, 255], 0.5);

  neonText(c, 'SÖNKE', 600, 175, 15, [255, 46, 151], [255, 255, 255], 1);
  neonText(c, 'NOMMENSEN', 600, 315, 11, [0, 234, 255], [234, 253, 255], 1);
  neonText(c, 'SOENKE.ME', 600, 560, 3, [255, 211, 25], [255, 247, 214], 0.7);

  crt(c, 600, 113);
  write('og.png', c);
}

/* =================================================================
   apple-touch-icon.png — 180×180 neon pixel S
   ================================================================= */
{
  const c = canvas(180, 180);
  const HORIZON = 138;

  gradientRows(c, 0, HORIZON, [[0, hex('#1f0840')], [1, hex('#16092f')]]);
  gradientRows(c, HORIZON, 180, [[0, hex('#10051f')], [1, hex('#07010f')]]);

  let seed = 1337;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280), seed / 233280);
  for (let i = 0; i < 24; i++)
    c.add(Math.floor(rnd() * 179), Math.floor(rnd() * 90), [255, 255, 255], 0.25 + rnd() * 0.6);

  gridFloor(c, HORIZON, 90, 36, [0, 234, 255], 0.45);
  neonText(c, 'S', 90, 16, 14, [255, 46, 151], [255, 255, 255], 1);

  crt(c, 90, 60);
  write('apple-touch-icon.png', c);
}
