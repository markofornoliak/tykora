import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const base = process.env.VITE_BASE_PATH || '/';
if (!/^\/(?:[a-zA-Z0-9._-]+\/)?$/.test(base)) throw new Error('Invalid VITE_BASE_PATH. Use / or /repository/.');

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon.svg','apple-touch-icon.png'],
      manifest: {
        name: 'TYKORA — The art and science of typing',
        short_name: 'TYKORA',
        description: 'Free, private, local-first typing education',
        theme_color: '#f7f7f3',
        background_color: '#f7f7f3',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{html,js,css,svg,png,woff2,json}'],
        navigateFallback: `${base}index.html`,
        cleanupOutdatedCaches: true
      }
    })
  ],
  test: { environment: 'jsdom', include: ['src/**/*.test.ts'] }
});
