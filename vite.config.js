import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Use environment variables if available (.env or Netlify dashboard)
const PORT = parseInt(process.env.VITE_PORT) || 3002;
const API_URL = process.env.VITE_API_URL || "https://localhost:8000";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: PORT,
    open: "/",                  // Auto-open in browser
    host: "0.0.0.0",             // Accessible on local network
    proxy: mode === "development" ? {
      "/api": {
        target: API_URL,
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ""), // Strip /api prefix
        secure: false, // Allow self-signed certs locally
      },
    } : undefined,
  },
  css: {
    preprocessorOptions: {
      scss: {
        charset: false, // Prevent @charset warnings in SCSS
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // Alias for src/
    },
  },
  optimizeDeps: {
    include: ["react-router-dom"], // Pre-bundle for faster dev start
  },
  build: {
    sourcemap: process.env.VITE_SOURCEMAP === "true" || false, // Only enable when needed
    chunkSizeWarningLimit: 1000, // Avoid large bundle warnings
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"], // Separate vendor chunk
        },
      },
    },
  },
}));
