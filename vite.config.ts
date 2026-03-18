import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'next/link': path.resolve(__dirname, './src/shims/next-link.tsx'),
      'next/navigation': path.resolve(__dirname, './src/shims/next-navigation.ts'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 3005,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3006',
        changeOrigin: true,
      },
    },
  },
})
