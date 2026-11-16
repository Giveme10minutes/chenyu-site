import { defineConfig } from "vite";

export default defineConfig({
  publicDir: false,
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    outDir: "docs/blog/assets/react",
    emptyOutDir: true,
    lib: {
      entry: "homepage/client.jsx",
      name: "PersonalHomepage",
      formats: ["iife"],
      fileName: () => "homepage.js",
    },
  },
});
