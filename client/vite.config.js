import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Simple Vite config for local development
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
