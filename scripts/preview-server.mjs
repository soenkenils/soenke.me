#!/usr/bin/env node
// Minimal foreground static server for dist/, used by the test harness.
//
// `astro preview` daemonises as of Astro 7.2 and has no working way to stay in
// the foreground, which Playwright's `webServer` reads as "exited early" — and
// on Linux CI the spawning process never returns at all. A ~50-line server
// removes that whole class of problem and behaves identically everywhere.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, extname, normalize, sep } from 'node:path';

const ROOT = fileURLToPath(new URL('../dist/', import.meta.url));
const PORT = Number(process.env.PORT || 4321);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ico': 'image/x-icon',
};

// "/" -> index.html, "/datenschutz" -> datenschutz/index.html, "/404" -> 404.html
const resolveFile = async (pathname) => {
  const clean = normalize(decodeURIComponent(pathname));
  const candidates = [join(ROOT, clean)];
  if (!extname(clean)) {
    candidates.push(join(ROOT, clean, 'index.html'), join(ROOT, `${clean}.html`));
  }
  for (const candidate of candidates) {
    if (!candidate.startsWith(ROOT.endsWith(sep) ? ROOT : ROOT + sep)) continue; // no traversal
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch {
      /* try the next shape */
    }
  }
  return null;
};

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  const file = await resolveFile(pathname);

  if (file) {
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(await readFile(file));
    return;
  }

  try {
    const body = await readFile(join(ROOT, '404.html'));
    res.writeHead(404, { 'content-type': TYPES['.html'] });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': TYPES['.txt'] });
    res.end('Not found');
  }
});

server.listen(PORT, () => console.log(`preview server on http://localhost:${PORT}`));
