import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  ssr: {
    optimizeDeps: {
      include: ["@prisma-app/client", "@prisma-app/client/sql"],
    },
  },
  build: {
    rollupOptions: {
      external: ["@prisma-app/client", "@prisma-app/client/sql"], // 👈 Also here
    },
  },
});
