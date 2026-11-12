import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default defineConfig([
  { ignores: ['dist/**', 'dist-app/**', 'coverage/**'] },
  {
    files: ['app/**/*.{ts,tsx}', 'vite.app.config.ts', 'playwright.config.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended, reactHooks.configs.flat.recommended],
  },
]);
