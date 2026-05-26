import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://gyuminlee.dev',
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false })
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ko'],
    routing: { prefixDefaultLocale: false }
  },
  output: 'hybrid',
  adapter: cloudflare({ imageService: 'passthrough' }),
  build: { format: 'directory' }
});
