import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { handleApiRequest } from "./api/index";

function apiPlugin() {
  const middleware = (req, res, next) => {
    if (req.url && req.url.startsWith("/api")) {
      handleApiRequest(req, res).catch(next);
      return;
    }
    next();
  };
  return {
    name: "needle-collection-api",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiPlugin()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
});
