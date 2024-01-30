const isCodeSandbox =
  "SANDBOX_URL" in process.env || "CODESANDBOX_HOST" in process.env;
import { resolve } from "path";
import { defineConfig } from "vite";
export default defineConfig({
  root: "./",
  publicDir: "../static/",
  base: "./",
  server: {
    host: true,
    open: !isCodeSandbox, // Open if it's not a CodeSandbox
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        // test: resolve(__dirname, "pages", "test", "index.html"),
        // test: resolve(__dirname, "pages", "test/index.html"),
        test: resolve(__dirname, "pages/test/index.html"),
      },
    },
  },
});
