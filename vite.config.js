const isCodeSandbox =
  "SANDBOX_URL" in process.env || "CODESANDBOX_HOST" in process.env;
import { resolve } from "path";
import { defineConfig } from "vite";

import usePHP from "vite-plugin-php";

export default defineConfig({
  root: "./",
  publicDir: "../static/",
  base: "./",
  server: {
    host: true,
    open: !isCodeSandbox, // Open if it's not a CodeSandbox
  },
  build: {
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        compraventa: resolve(__dirname, "pages", "compraventa", "index.html"),
        maradona: resolve(__dirname, "pages", "maradona", "index.html"),
        zine1: resolve(__dirname, "pages", "zine1", "index.html"),
        voca: resolve(__dirname, "pages", "voca", "index.html"),
        screenshots: resolve(__dirname, "pages", "screenshots", "index.html"),
        zarandraca: resolve(__dirname, "pages", "zarandraca", "index.html"),
        dibuja: resolve(__dirname, "pages", "dibuja", "index.html"),
      },
    },
  },
});
