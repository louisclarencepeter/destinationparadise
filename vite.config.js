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
