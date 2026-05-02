import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devHost = env.DEV_HOST || env.HOST || '0.0.0.0';
  const devPort = Number(env.DEV_PORT || env.PORT || 5173);
  const strictPort = env.DEV_STRICT_PORT === 'true';

  return {
    plugins: [react()],
    server: {
      host: devHost,
      open: true,
      // Honor DEV_PORT/PORT when set; fall back to Vite default
      port: devPort,
      strictPort,
    },
  };
});
