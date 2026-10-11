import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

// إعداد مسارات المشروع
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// إعدادات PWA
const pwaConfig = {
  registerType: "prompt",
  includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
  manifest: {
    name: "متتبع الوقت",
    short_name: "متتبع الوقت",
    description: "تطبيق لتتبع الوقت وتنظيم المهام",
    theme_color: "#1F2937",
    background_color: "#111827",
    display: "standalone",
    orientation: "portrait",
    start_url: "/",
    icons: [
      {
        src: "pwa-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  },
  workbox: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts-cache",
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365,
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /\.(js|css|html)$/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "app-static-resources",
        },
      },
    ],
  },
};

// تحميل إضافة PWA لو متاحة
let pwaPlugin = null;

try {
  const { VitePWA } = await import("vite-plugin-pwa");
  pwaPlugin = VitePWA(pwaConfig);
} catch (error) {
  console.warn(
    "vite-plugin-pwa is not installed - PWA features will be disabled",
  );
}

// تكوين Vite
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...(pwaPlugin ? [{ ...pwaPlugin, apply: "build" }] : []),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    historyApiFallback: true,
  },
});
