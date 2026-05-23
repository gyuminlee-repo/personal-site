import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

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
  output: 'static',
  build: { format: 'directory' }
});
