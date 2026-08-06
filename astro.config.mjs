import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  site: 'https://soenke.me',
  integrations: [
    sitemap({
      // legal pages are noindex — keep them out of the sitemap too
      filter: (page) => !page.includes('/datenschutz'),
    }),
  ],
  vite: {
    build: {
      // Never inline assets as base64. Fontsource's small woff subsets were
      // getting baked into the render-blocking stylesheet (56 kB → 28 kB),
      // even though the woff2 in the same src list always wins.
      assetsInlineLimit: 0,
    },
  },
});
