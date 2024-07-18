import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    open: '/',
    host: '0.0.0.0',
    proxy: {
      "/api": {
        target: "https://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/styles/variables";
          @import "@/styles/mixins";
        `
      },
      css: {
        charset: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
