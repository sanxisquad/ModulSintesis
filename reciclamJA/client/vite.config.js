import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      // Configurar el proxy para las solicitudes a la API
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path
      },
      // Proxy para el sistema de reciclaje
      '/sistema_reciclatge': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      // Proxy para autenticación
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      // Proxy para zonas de reciclaje
      '/zr': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
});
