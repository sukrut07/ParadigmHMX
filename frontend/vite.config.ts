import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/alerts': { target: 'http://localhost:8001', changeOrigin: true },
      '/dashboard': { target: 'http://localhost:8001', changeOrigin: true },
      '/investigations': { target: 'http://localhost:8001', changeOrigin: true },
      '/employees': { target: 'http://localhost:8001', changeOrigin: true },
      '/accounts': { target: 'http://localhost:8001', changeOrigin: true },
      '/transactions': { target: 'http://localhost:8001', changeOrigin: true },
      '/cases': { target: 'http://localhost:8001', changeOrigin: true },
      '/evidence': { target: 'http://localhost:8001', changeOrigin: true },
      '/evaluation': { target: 'http://localhost:8001', changeOrigin: true },
      '/metrics': { target: 'http://localhost:8001', changeOrigin: true },
      '/simulation': { target: 'http://localhost:8001', changeOrigin: true },
      '/simulate': { target: 'http://localhost:8001', changeOrigin: true },
      '/detection': { target: 'http://localhost:8001', changeOrigin: true },
      '/health': { target: 'http://localhost:8001', changeOrigin: true },
      '/demo': { target: 'http://localhost:8001', changeOrigin: true },
    },
  },
})
