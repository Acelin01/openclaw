import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["index.ts"],
  format: ["cjs", "esm"],
  dts: false,
  clean: true,
  external: ["react", "react-dom", "i18next", "react-i18next", "i18next-browser-languagedetector"],
});
