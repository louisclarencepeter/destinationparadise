import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devHost = env.DEV_HOST || env.HOST || '0.0.0.0';
  const devPort = Number(env.DEV_PORT || env.PORT || 5173);
  const strictPort = env.DEV_STRICT_PORT === 'true';

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        // Register the service worker manually (see src/utils/registerServiceWorker.js)
        // so registration failures are caught instead of surfacing as unhandled
        // promise rejections (Sentry DESTINATIONPARADISE-2). The auto-injected
        // registerSW.js called navigator.serviceWorker.register() with no .catch().
        injectRegister: false,
        workbox: {
          clientsClaim: true,
          skipWaiting: true,
        },
        devOptions: {
          enabled: false
        },
        manifest: false // We already have a static manifest in public/manifest.json
      })
    ],
    server: {
      host: devHost,
      open: true,
      // Honor DEV_PORT/PORT when set; fall back to Vite default
      port: devPort,
      strictPort,
    },
  };
});
