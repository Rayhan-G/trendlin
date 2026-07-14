import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'server',

  adapter: cloudflare({
    runtime: 'off',
    platformProxy: 'off'
  }),

  integrations: [
    tailwind(),
    sitemap()
  ],

  site: 'https://trendlin.com',
});