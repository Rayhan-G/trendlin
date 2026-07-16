import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'server',

  adapter: cloudflare({
    runtime: 'off',           // Keep off for Pages
    platformProxy: 'enabled'  // CHANGE: Enable platform proxy
  }),

  integrations: [
    tailwind(),
    sitemap()
  ],

  site: 'https://trendlin.com',
});