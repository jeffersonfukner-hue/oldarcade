import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const site = process.env.SITE_URL;
export default defineConfig({
  site: site || 'https://example.invalid',
  integrations: site ? [sitemap()] : [],
  output: 'static',
});
