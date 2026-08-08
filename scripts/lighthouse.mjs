#!/usr/bin/env node
// Lighthouse gate for CI. Runs against the production build served by
// `astro preview`, and fails the run if a category drops below its threshold.
//
// Usage: node scripts/lighthouse.mjs [baseUrl]
//
// Performance is deliberately the loosest bar: CI runners are noisy and a
// shared-vCPU hiccup should not block a PR. The other three categories are
// stable enough to gate hard on.

import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { chromium } from '@playwright/test';

const BASE = process.argv[2] || 'http://localhost:4321';

// `noindex` pages are excluded from the SEO gate: Lighthouse scores "Page is
// blocked from indexing" as a defect, but for the legal page and the 404 it is
// the intended behaviour.
const PATHS = [
  { path: '/' },
  { path: '/datenschutz', noindex: true },
  { path: '/404', noindex: true },
];

const THRESHOLDS = {
  performance: 0.9,
  accessibility: 1.0,
  'best-practices': 0.9,
  seo: 0.9,
};

// reuse the chromium Playwright already installs, so this needs no separate
// browser download and behaves the same locally and on the CI runner
const chrome = await launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
});

let failed = false;

try {
  for (const { path, noindex } of PATHS) {
    const url = `${BASE}${path}`;
    const { lhr } = await lighthouse(url, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      // mobile emulation + throttling is Lighthouse's default and the harsher
      // of the two profiles — if it passes here, desktop is fine
      onlyCategories: Object.keys(THRESHOLDS),
    });

    console.log(`\n${url}`);
    for (const [id, min] of Object.entries(THRESHOLDS)) {
      const score = lhr.categories[id].score ?? 0;
      if (id === 'seo' && noindex) {
        console.log(`  – ${lhr.categories[id].title.padEnd(16)} ${(score * 100).toFixed(0).padStart(3)}  (skipped: noindex by design)`);
        continue;
      }
      const ok = score >= min;
      if (!ok) failed = true;
      console.log(
        `  ${ok ? '✓' : '✗'} ${lhr.categories[id].title.padEnd(16)} ${(score * 100).toFixed(0).padStart(3)}  (min ${(min * 100).toFixed(0)})`
      );
    }

    // surface what actually cost points, so a failure is actionable
    const misses = Object.values(lhr.audits).filter(
      (a) => a.score !== null && a.score < 1 && a.scoreDisplayMode !== 'informative'
    );
    if (misses.length) {
      console.log('  ── audits below 100:');
      for (const a of misses.slice(0, 10)) console.log(`     · ${a.title}`);
    }
  }
} finally {
  await chrome.kill();
}

if (failed) {
  console.error('\nLighthouse thresholds not met.');
  process.exit(1);
}
console.log('\nLighthouse thresholds met.');
