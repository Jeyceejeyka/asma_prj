import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

function normalizePackageName(id: string) {
  const match = id.match(/\/node_modules\/(?:@[^/]+\/[^/]+|[^/]+)/);
  if (!match) return undefined;
  return match[0].replace("/node_modules/", "").replace("/", "_");
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/sonner/")) {
            return "vendor_sonner";
          }
          if (id.includes("/node_modules/recharts/")) {
            return "vendor_recharts";
          }
          if (id.includes("/node_modules/react-dom/")) {
            return "vendor_react_dom";
          }
          if (id.includes("/node_modules/framer-motion/")) {
            return "vendor_framer_motion";
          }
          if (id.includes("/node_modules/@tanstack/react-query/") || id.includes("/node_modules/@tanstack/query-core/")) {
            return "vendor_tanstack_query";
          }
          if (id.includes("/node_modules/react-router-dom/")) {
            return "vendor_react_router_dom";
          }
          if (id.includes("/node_modules/lucide-react/")) {
            return "vendor_lucide_react";
          }
          if (id.includes("/node_modules/next-themes/")) {
            return "vendor_next_themes";
          }
          if (id.endsWith("/src/store/cartStore.ts")) {
            return "cart_store";
          }
          if (id.includes("/node_modules/")) {
            return "vendor";
          }
        },
      },
    },
  },
}));
