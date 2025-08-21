/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    include: ['src/tests/**/*.{test,spec}.{js,ts,tsx}'],
    typecheck: {
      tsconfig: 'tsconfig.json'
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'react-native': 'react-native-web',
    },
  },
  define: {
    '__DEV__': true,
  },
});
