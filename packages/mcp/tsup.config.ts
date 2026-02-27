import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  external: ["react", "react-dom", "next", "@tanstack/react-query"],
  minify: true,
  sourcemap: true,
  treeshake: true,
});
