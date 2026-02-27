import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: false,
  clean: true,
  external: ["react", "react-dom"],
  sourcemap: true,
  minify: false,
  splitting: false,
  target: "es2020",
});
