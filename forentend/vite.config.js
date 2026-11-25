import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During development the React app runs on :5173 and the API on :5000.
// The proxy forwards /api and /uploads to the backend, so the browser
// only ever talks to :5173 (no CORS headaches).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:5000",
      "/uploads": "http://localhost:5000",
    },
  },
});
