import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: false,
  clean: true,
  external: ["react", "react-dom", "lucide-react"],
  banner: {
    js: "// OperaBot Client SDK - AI Chatbot for Business Operations",
  },
});
