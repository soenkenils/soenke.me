import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  site: 'https://soenke.me',
  integrations: [
    sitemap({
      // legal pages are noindex — keep them out of the sitemap too
      filter: (page) => !page.includes('/impressum') && !page.includes('/datenschutz'),
    }),
  ],
});
