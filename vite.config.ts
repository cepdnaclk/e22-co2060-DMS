import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite configuration updated to serve the React frontend folder.
export default defineConfig({
  root: "frontend",
  plugins: [react()],
  server: {
    // you can override the default port here if you like
    port: 5173,
  },
  resolve: {
    alias: {
      // allow importing with '@/...'
      "@": "/frontend/src",
    },
  },
});
