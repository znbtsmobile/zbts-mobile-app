import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    define: {
      __BUILD_TIMESTAMP__: JSON.stringify(Date.now().toString())
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'app-icon.jpg', 'apple-touch-icon.png'],
        manifest: {
          name: 'Blood Bank Zanzibar',
          short_name: 'ZBTS Blood Bank',
          description: 'Zanzibar Blood Transfusion Services (ZNBTS) Blood Request & Inventory App',
          theme_color: '#1976D2',
          background_color: '#cbd5e1',
          display: 'standalone',
          orientation: 'portrait',
          icons: [
            {
              src: '/app-icon.jpg',
              sizes: '192x192',
              type: 'image/jpeg',
              purpose: 'any maskable'
            },
            {
              src: '/app-icon.jpg',
              sizes: '512x512',
              type: 'image/jpeg',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}']
        }
      })
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            'recharts-vendor': ['recharts'],
            'lucide-vendor': ['lucide-react']
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
