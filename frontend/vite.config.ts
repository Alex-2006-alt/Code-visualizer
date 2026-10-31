/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/run': 'http://127.0.0.1:8000',
      '/api': 'http://127.0.0.1:8000',
      '/compare': 'http://127.0.0.1:8000',
      '/complexity': 'http://127.0.0.1:8000',
      '/snippets': 'http://127.0.0.1:8000',
      '/examples': 'http://127.0.0.1:8000',
    },
  },
  preview: {
    proxy: {
      '/run': 'http://127.0.0.1:8000',
      '/api': 'http://127.0.0.1:8000',
      '/compare': 'http://127.0.0.1:8000',
      '/complexity': 'http://127.0.0.1:8000',
      '/snippets': 'http://127.0.0.1:8000',
      '/examples': 'http://127.0.0.1:8000',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [path.resolve(import.meta.dirname, './src/test/setup.ts')],
    testTimeout: 15000,
  },
})
