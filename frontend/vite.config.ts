import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Helper for proxying backend API requests while preserving frontend SPA routes on direct reload or browser navigation
const apiProxy = {
  target: 'http://localhost:8001',
  changeOrigin: true,
  bypass: (req: any) => {
    // If request is from our API client or is an XHR/fetch explicitly accepting JSON, ALWAYS proxy to backend
    if (
      req.headers?.['x-insidertrace-api'] ||
      req.headers?.['x-requested-with'] === 'XMLHttpRequest' ||
      (req.headers?.['sec-fetch-dest'] === 'empty' && req.headers?.accept?.includes('application/json'))
    ) {
      return null;
    }

    const accept = req.headers?.accept || '';
    const dest = req.headers?.['sec-fetch-dest'];
    const mode = req.headers?.['sec-fetch-mode'];

    // Only serve index.html for direct browser document navigations (e.g. typing URL in address bar or page reload)
    if (dest === 'document' || mode === 'navigate' || (accept.includes('text/html') && !accept.includes('application/json'))) {
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
