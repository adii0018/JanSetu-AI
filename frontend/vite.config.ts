import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  // Load env vars at config-definition time so we can use them in workbox
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:8000'

  // Build a regex that matches the API origin so the SW never caches API calls
  const apiOrigin = (() => {
    try {
      return new URL(apiBaseUrl).origin
    } catch {
      return apiBaseUrl
    }
  })()

  // Escape special regex chars in the origin string
  const escapedOrigin = apiOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const apiRegex = new RegExp(`^${escapedOrigin}`)

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        // 'prompt' = show an in-app update banner when a new SW is available.
        // This prevents users from getting stuck on stale cached versions.
        registerType: 'prompt',

        // Include additional files from `public/` in the service-worker precache
        includeAssets: [
          'favicon.svg',
          'icons/icon.svg',
          'icons/maskable-icon.svg',
          'icons/apple-touch-icon.png',
        ],

        manifest: {
          name: 'JanSetu — AI for Public Governance',
          short_name: 'JanSetu',
          description:
            'Turning citizen voices into ranked, explainable public investment decisions. AI-powered platform for Digital Public Infrastructure & Governance.',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait-primary',
          theme_color: '#1F3A24',
          background_color: '#EFF9EE',
          lang: 'en',
          categories: ['government', 'productivity', 'utilities'],
          icons: [
            {
              src: '/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icons/maskable-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/icons/maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },

        workbox: {
          // ── Precache ─────────────────────────────────────────────
          // Workbox auto-precaches all Vite-generated files (JS, CSS, HTML)
          // These have content-hash filenames, so they never serve stale code.
          globPatterns: ['**/*.{js,css,html,ico,svg,png,woff2}'],

          // ── Runtime Caching Rules ────────────────────────────────
          runtimeCaching: [
            // 1. NEVER cache API calls — auth-sensitive, always network
            {
              urlPattern: apiRegex,
              handler: 'NetworkOnly',
              options: {
                cacheName: 'jansetu-api-no-cache',
              },
            },

            // 2. Google Fonts stylesheet — StaleWhileRevalidate
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'google-fonts-stylesheets',
                expiration: {
                  maxEntries: 5,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
              },
            },

            // 3. Google Fonts webfonts — CacheFirst (files never change)
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },

            // 4. OpenStreetMap / Leaflet map tiles — CacheFirst for offline maps
            {
              urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'leaflet-map-tiles',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },

            // 5. Google Identity Services SDK — NetworkFirst (keep fresh for auth)
            {
              urlPattern: /^https:\/\/accounts\.google\.com\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'google-identity',
                networkTimeoutSeconds: 5,
                expiration: {
                  maxEntries: 5,
                  maxAgeSeconds: 60 * 60 * 24, // 1 day
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },

            // 6. Static assets (images, icons) — StaleWhileRevalidate
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'jansetu-assets',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
              },
            },
          ],

          // Navigation fallback: /dashboard, /profile etc. all fall back to
          // index.html in standalone PWA mode (avoids 404 on direct navigation)
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [
            // Don't intercept service-worker-related files
            /\/sw\.js$/,
            /\/workbox-.*\.js$/,
          ],

          // Clean up old caches from previous service worker versions
          cleanupOutdatedCaches: true,

          // Don't auto-skip waiting — the user is prompted to update first
          skipWaiting: false,
          clientsClaim: true,
        },

        // Dev: disable to avoid noise during development
        devOptions: {
          enabled: false,
        },
      }),
    ],
  }
})
