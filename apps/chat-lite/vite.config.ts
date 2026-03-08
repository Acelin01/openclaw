import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    commonjsOptions: {
      include: [/lit/, /node_modules/],
    },
  },
  // 支持 Lit
  optimizeDeps: {
    include: ['lit', '@lit/reactive-element', 'lit/decorators.js'],
    esbuildOptions: {
      target: 'es2022',
    },
  },
  // 使用 esbuild 处理 TypeScript 和装饰器（而不是 Babel）
  esbuild: {
    target: 'es2022',
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
        useDefineForClassFields: false,
      },
    },
  },
  // 自定义处理 .tsx 文件用于 Lit 组件
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
