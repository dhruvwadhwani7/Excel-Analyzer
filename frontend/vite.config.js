import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  },
  // Handle base URL for production
  base: '/',
  // Configure server for development
  server: {
    proxy: {
      '/api': {
        target: 'https://excel-analyzer-1.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
