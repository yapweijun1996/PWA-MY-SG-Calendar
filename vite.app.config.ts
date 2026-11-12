import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

const buildId = process.env.CALENDAR_BUILD_ID ?? `local-${new Date().toISOString()}`;

export default defineConfig({
  root: fileURLToPath(new URL('./app', import.meta.url)),
  base: './',
  define: { __APP_BUILD__: JSON.stringify(buildId) },
  plugins: [react(), VitePWA({
    strategies: 'injectManifest',
    srcDir: 'src/pwa',
    filename: 'sw.ts',
    injectRegister: false,
    registerType: 'prompt',
    manifest: {
      id: './', name: 'MY / SG Calendar', short_name: 'MY / SG',
      description: 'Gregorian and multicultural dates for Malaysia and Singapore',
      start_url: './', scope: './', display: 'standalone', lang: 'en',
      background_color: '#f5f4ef', theme_color: '#f5f4ef',
      icons: [
        { src: 'icons/calendar-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: 'icons/calendar-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: 'icons/calendar-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,webmanifest,txt}'],
      globIgnores: ['data/**'],
    },
  })],
  build: {
    outDir: '../dist-app',
    emptyOutDir: true,
  },
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  preview: { host: '127.0.0.1', port: 4175, strictPort: true },
  test: {
    environment: 'jsdom',
    maxWorkers: 2,
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
});
