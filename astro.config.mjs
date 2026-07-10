import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    runtime: 'off',
  }),
  integrations: [tailwind()],
  site: 'https://your-site.pages.dev',
});