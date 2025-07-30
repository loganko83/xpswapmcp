import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from 'url';
import { visualizer } from 'rollup-plugin-visualizer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: '/xpswap/',
  plugins: [
    react(),
    runtimeErrorOverlay(),
    // 번들 분석기 추가 (프로덕션 빌드 시에만)
    process.env.ANALYZE === 'true' && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React와 관련 라이브러리를 별도 청크로 분리
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react';
          }
          // 라우팅 관련
          if (id.includes('wouter')) {
            return 'router';
          }
          // UI 라이브러리
          if (id.includes('@radix-ui')) {
            return 'ui';
          }
          // 차트 라이브러리 
          if (id.includes('lightweight-charts')) {
            return 'charts';
          }
          // 유틸리티 라이브러리
          if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('lucide-react')) {
            return 'utils';
          }
          // DeFi/Web3 관련
          if (id.includes('ethers') || id.includes('web3')) {
            return 'web3';
          }
          // node_modules 일반 청크
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    // 청크 크기 경고 임계값 조정
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5179,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/xpswap/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace('/xpswap', ''),
      },
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
