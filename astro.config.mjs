import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    runtime: 'off',
    platformProxy: 'off'
  }),
  integrations: [tailwind()],
  site: 'https://b484b1fd.my-content-site.pages.dev', // Use your actual Pages URL
});