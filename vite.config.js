import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    open: "/", // Automatically open the app in the browser
    host: "0.0.0.0", // Allow access from network
    proxy: {
      "/api": {
        target: "https://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""), // Remove /api prefix when forwarding
        secure: false, // Allow self-signed certificates for local development
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        charset: false, // Disable charset in SCSS to avoid warnings
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // Create alias for src directory
    },
  },
  optimizeDeps: {
    include: ["react-router-dom"], // Pre-bundle react-router-dom for faster development
  },
  build: {
    sourcemap: true, // Enable source maps for easier debugging
  },
});
