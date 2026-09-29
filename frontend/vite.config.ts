import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Helper for proxying backend API requests while preserving frontend SPA routes on direct reload or browser navigation
const apiProxy = {
  target: 'http://localhost:8001',
  changeOrigin: true,
  bypass: (req: any) => {
    const accept = req.headers?.accept || '';
    const dest = req.headers?.['sec-fetch-dest'];
    const mode = req.headers?.['sec-fetch-mode'];

    // If request accepts text/html, is a browser document navigation, or doesn't explicitly accept json, serve SPA index.html
    if (accept.includes('text/html') || dest === 'document' || mode === 'navigate') {
      return '/index.html';
    }
  },
};

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
      '/alerts': apiProxy,
      '/dashboard': apiProxy,
      '/investigations': apiProxy,
      '/employees': apiProxy,
      '/accounts': apiProxy,
      '/transactions': apiProxy,
      '/cases': apiProxy,
      '/evidence': apiProxy,
      '/evaluation': apiProxy,
      '/metrics': apiProxy,
      '/simulate': apiProxy,
      '/simulation/attack': apiProxy,
      '/detection': apiProxy,
      '/health': apiProxy,
      '/demo': apiProxy,
    },
  },
})
