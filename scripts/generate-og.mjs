/**
 * generate-og.mjs — renders public/og.png (1200×630 social preview)
 *
 * Dependency-free: draws the synthwave scene (sky, stars, half-set sun,
 * perspective grid) plus the name in a hand-defined arcade pixel font,
 * then encodes the PNG manually via node:zlib.
 *
 * Regenerate with:  node scripts/generate-og.mjs
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const W = 1200;
const H = 630;
const HORIZON = 470;

/* ---------- framebuffer (float RGB, 0..255) ---------- */
const fb = new Float64Array(W * H * 3);
const put = (x, y, r, g, b) => {
  const i = (y * W + x) * 3;
  fb[i] = r; fb[i + 1] = g; fb[i + 2] = b;
};
const add = (x, y, r, g, b, a) => {
  const i = (y * W + x) * 3;
  fb[i] += r * a; fb[i + 1] += g * a; fb[i + 2] += b * a;
};
const hex = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
const lerp = (a, b, t) => a + (b - a) * t;
const mix = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];

/* ---------- sky + below-horizon gradients ---------- */
const skyStops = [
  [0.0, hex('#1a0636')],
  [0.45, hex('#2a0a4d')],
  [0.78, hex('#3a0e52')],
  [1.0, hex('#2b0a40')],
];
for (let y = 0; y < H; y++) {
  let c;
  if (y < HORIZON) {
    const t = y / HORIZON;
    let k = 0;
    while (k < skyStops.length - 2 && t > skyStops[k + 1][0]) k++;
    const [t0, c0] = skyStops[k];
    const [t1, c1] = skyStops[k + 1];
    c = mix(c0, c1, (t - t0) / (t1 - t0));
  } else {
    c = mix(hex('#140628'), hex('#07010f'), (y - HORIZON) / (H - HORIZON));
  }
  for (let x = 0; x < W; x++) put(x, y, c[0], c[1], c[2]);
}

/* ---------- stars (same LCG as the site, seed 1337) ---------- */
let seed = 1337;
const rnd = () => ((seed = (seed * 9301 + 49297) % 233280), seed / 233280);
for (let i = 0; i < 90; i++) {
  const sx = Math.floor(rnd() * (W - 2));
  const sy = Math.floor(rnd() * 320);
  const b = 0.25 + rnd() * 0.75;
  const size = rnd() > 0.85 ? 2 : 1;
  for (let dy = 0; dy < size; dy++)
    for (let dx = 0; dx < size; dx++) add(sx + dx, sy + dy, 255, 255, 255, b * 0.8);
}

/* ---------- sun: half-set on the horizon, banded ---------- */
const SUN_CX = 600, SUN_CY = 560, SUN_R = 170; // visible arc: y 390..470
const sun1 = hex('#fff35b'), sun2 = hex('#ffab2e'), sun3 = hex('#ff5fa2');
for (let y = SUN_CY - SUN_R; y < HORIZON; y++) {
  const half = Math.sqrt(SUN_R * SUN_R - (SUN_CY - y) * (SUN_CY - y));
  const v = (y - (SUN_CY - SUN_R)) / (HORIZON - (SUN_CY - SUN_R)); // 0 top .. 1 horizon
  const band = y > 408 && (HORIZON - y) % 14 < 4; // sky gaps near the horizon
  if (band) continue;
  const c = v < 0.5 ? mix(sun1, sun2, v * 2) : mix(sun2, sun3, (v - 0.5) * 2);
  for (let x = Math.ceil(SUN_CX - half); x <= SUN_CX + half; x++) put(x, y, c[0], c[1], c[2]);
}
/* sun glow (pink + wide purple), additive over everything */
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const d = Math.hypot(x - SUN_CX, y - HORIZON);
    const g1 = Math.exp(-(d * d) / (230 * 230)) * 0.32;
    const g2 = Math.exp(-(d * d) / (430 * 430)) * 0.16;
    add(x, y, 255, 90, 160, g1);
    add(x, y, 177, 74, 237, g2);
  }

/* ---------- perspective grid floor ---------- */
const hLines = [];
for (let n = 1; n <= 28; n++) hLines.push(HORIZON + 160 / n);
for (let y = HORIZON + 1; y < H; y++) {
  const t = (y - HORIZON) / (H - HORIZON);
  const fade = Math.min(1, t * 2.6); // merge-fade near the horizon
  let dh = 1e9;
  for (const ly of hLines) dh = Math.min(dh, Math.abs(y - ly));
  const hI = Math.exp(-(dh * dh) / (2 * 1.2 * 1.2)) + Math.exp(-(dh * dh) / (2 * 5 * 5)) * 0.3;
  for (let x = 0; x < W; x++) {
    const u = (x - SUN_CX) / (80 * t);
    const du = Math.abs(u - Math.round(u)) * 80 * t;
    const vI = Math.exp(-(du * du) / (2 * 1.2 * 1.2)) + Math.exp(-(du * du) / (2 * 5 * 5)) * 0.3;
    const I = Math.min(1.4, hI + vI) * 0.5 * fade;
    if (I > 0.004) add(x, y, 0, 234, 255, I);
  }
}
/* horizon glow line */
for (let y = HORIZON - 6; y < HORIZON + 7; y++) {
  const g = Math.exp(-((y - HORIZON) * (y - HORIZON)) / (2 * 2.2 * 2.2)) * 0.5;
  for (let x = 0; x < W; x++) add(x, y, 0, 234, 255, g);
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

function drawTextMask(mask, text, centerX, topY, scale) {
  const cells = [...text].reduce((w, ch, i) => w + glyphW(ch) + (i ? 1 : 0), 0);
  let x = Math.round(centerX - (cells * scale) / 2);
  const fill = (cx, cy) => {
    for (let dy = 0; dy < scale; dy++)
      for (let dx = 0; dx < scale; dx++) {
        const px = cx + dx, py = cy + dy;
        if (px >= 0 && px < W && py >= 0 && py < H) mask[py * W + px] = 1;
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

function boxBlur(src, r, passes) {
  let a = Float64Array.from(src);
  let b = new Float64Array(a.length);
  const win = 2 * r + 1;
  for (let p = 0; p < passes; p++) {
    for (let y = 0; y < H; y++) { // horizontal
      let sum = 0;
      const row = y * W;
      for (let x = -r; x <= r; x++) sum += a[row + Math.min(W - 1, Math.max(0, x))];
      for (let x = 0; x < W; x++) {
        b[row + x] = sum / win;
        sum += a[row + Math.min(W - 1, x + r + 1)] - a[row + Math.max(0, x - r)];
      }
    }
    for (let x = 0; x < W; x++) { // vertical
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

function neonText(text, centerX, topY, scale, glowRGB, coreRGB, gain) {
  const mask = new Float64Array(W * H);
  drawTextMask(mask, text, centerX, topY, scale);
  const tight = boxBlur(mask, Math.max(2, Math.round(scale * 0.5)), 3);
  const wide = boxBlur(mask, Math.max(5, Math.round(scale * 1.6)), 3);
  for (let i = 0; i < mask.length; i++) {
    const g = Math.min(1, tight[i] * 2.0) * 0.85 * gain + Math.min(1, wide[i] * 3.0) * 0.45 * gain;
    if (g > 0.004) {
      const x = i % W, y = (i / W) | 0;
      add(x, y, glowRGB[0], glowRGB[1], glowRGB[2], g);
    }
  }
  for (let i = 0; i < mask.length; i++)
    if (mask[i] > 0.5) put(i % W, (i / W) | 0, coreRGB[0], coreRGB[1], coreRGB[2]);
}

/* ---------- text layers ---------- */
neonText('ENGINEERING TEAM LEAD', 600, 112, 3, [0, 234, 255], [138, 243, 255], 0.7);
neonText('SÖNKE', 600, 175, 15, [255, 46, 151], [255, 255, 255], 1);
neonText('NOMMENSEN', 600, 315, 11, [0, 234, 255], [234, 253, 255], 1);
neonText('SOENKE.ME', 600, 560, 3, [255, 211, 25], [255, 247, 214], 0.7);

/* ---------- CRT scanlines + vignette ---------- */
for (let y = 0; y < H; y++) {
  const scan = y % 4 < 2 ? 0.84 : 1;
  for (let x = 0; x < W; x++) {
    const dx = (x - 600) / 780, dy = (y - 113) / 560;
    const d = Math.sqrt(dx * dx + dy * dy);
    const vig = 1 - 0.5 * Math.min(1, Math.max(0, (d - 0.55) / 0.45));
    const i = (y * W + x) * 3;
    fb[i] *= scan * vig; fb[i + 1] *= scan * vig; fb[i + 2] *= scan * vig;
  }
}

/* ---------- PNG encode (RGB8, no deps) ---------- */
const raw = Buffer.alloc(H * (W * 3 + 1));
for (let y = 0; y < H; y++) {
  const off = y * (W * 3 + 1);
  raw[off] = 0; // filter: none
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    raw[off + 1 + x * 3] = Math.min(255, Math.max(0, Math.round(fb[i])));
    raw[off + 2 + x * 3] = Math.min(255, Math.max(0, Math.round(fb[i + 1])));
    raw[off + 3 + x * 3] = Math.min(255, Math.max(0, Math.round(fb[i + 2])));
  }
}
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c;
}
const crc32 = (buf) => {
  let c = ~0;
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return ~c >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8;  // bit depth
ihdr[9] = 2;  // color type: RGB
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'og.png');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, png);
console.log(`wrote ${out} (${(png.length / 1024).toFixed(1)} kB)`);
