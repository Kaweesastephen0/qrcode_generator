import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Use ngrok URL for development
const NGROK_URL = 'https://unmoving-lucca-pseudoeconomically.ngrok-free.dev';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    host: true, // Allow external access
    allowedHosts: ['unmoving-lucca-pseudoeconomically.ngrok-free.dev'], // Allow ngrok host
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  define: {
    __NGROK_URL__: JSON.stringify(NGROK_URL)
  }
});
