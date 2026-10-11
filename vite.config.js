import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// إعدادات PWA (سيتم تفعيلها فقط إذا كانت المكتبات مثبتة)
const pwaConfig = {
  registerType: 'prompt',  // تغيير إلى 'prompt' لمزيد من التحكم
  includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
  manifest: {
    name: 'متتبع الوقت',
    short_name: 'متتبع الوقت',
    description: 'تطبيق لتتبع الوقت وتنظيم المهام',
    theme_color: '#1F2937',
    background_color: '#111827',
    display: 'standalone',
    orientation: 'portrait',
    start_url: '/',
    icons: [
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  },
  workbox: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      {
        urlPattern: /\.(js|css|html)$/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'app-static-resources'
        },
      }
    ]
  }
};

// تكوين Vite
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // تجربة تحميل مكتبة PWA فقط إذا كانت مثبتة
    {
      ...(() => {
        try {
          return require('vite-plugin-pwa').VitePWA(pwaConfig);
        } catch (e) {
          console.warn('vite-plugin-pwa is not installed - PWA features will be disabled');
          return {};
        }
      })(),
      apply: 'build' // تطبيق فقط في وضع البناء
    }
  ],
  server: {
    historyApiFallback: true
  }
});
