import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import svgr from "vite-plugin-svgr";
import viteCompression from "vite-plugin-compression";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  plugins: [
    react(),
    svgr(), // Import SVGs as React components
    viteCompression(), // Gzip compression for build assets
  ],
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
    outDir: "dist", // Custom build output directory
    chunkSizeWarningLimit: 800, // Warn if chunk size exceeds 800kb
  },
});
