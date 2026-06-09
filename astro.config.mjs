import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  site: 'https://soenke.me',
  integrations: [
    sitemap({
      // legal page is noindex — keep it out of the sitemap too
      filter: (page) => !page.includes('/impressum'),
    }),
  ],
});
