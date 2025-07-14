import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import legacy from '@vitejs/plugin-legacy';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Base public path when served in production
    base: env.VITE_BASE_URL || '/',

    // Plugins configuration
    plugins: [
      react({
        fastRefresh: true,       // Enable React Fast Refresh
        jsxRuntime: 'automatic', // Use the new JSX transform in React 17+
      }),
      legacy({
        targets: ['defaults', 'not IE 11'], // Support modern browsers excluding IE11
      }),
    ],

    // Development server settings
    server: {
      port: Number(env.VITE_DEV_PORT) || 3002,
      open: '/',
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (url) => url.replace(/^\/api/, ''),
          secure: false, // Accept self-signed certificates
        },
      },
    },

    // CSS preprocessor options
    css: {
      preprocessorOptions: {
        scss: {
          charset: false, // Disable @charset warnings
        },
      },
    },

    // Resolve path aliases
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },

    // Optimize dependencies for faster cold starts
    optimizeDeps: {
      include: ['react-router-dom'],
    },

    // Production build options
    build: {
      sourcemap: true,
      minify: 'esbuild',
      chunkSizeWarningLimit: 600,
    },
  };
});