import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from 'url';
import { visualizer } from 'rollup-plugin-visualizer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 환경에 따른 BASE_PATH 설정
const isDevelopment = process.env.NODE_ENV === 'development';
const basePath = isDevelopment ? '/' : '/xpswap/';

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    // runtimeErrorOverlay(), // 임시 비활성화
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
    outDir: path.resolve(__dirname, "client/dist"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React와 React 의존 라이브러리를 같은 청크로 그룹화
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') || 
              id.includes('lucide-react')) {
            return 'react-vendor';
          }
          // 라우팅 관련
          if (id.includes('wouter')) {
            return 'router';
          }
          // UI 라이브러리 (React 의존성)
          if (id.includes('@radix-ui')) {
            return 'ui';
          }
          // 차트 라이브러리 
          if (id.includes('lightweight-charts')) {
            return 'charts';
          }
          // 순수 유틸리티 라이브러리 (React 의존성 없음)
          if (id.includes('clsx') || id.includes('tailwind-merge')) {
            return 'utils';
          }
          // DeFi/Web3 관련
          if (id.includes('ethers') || id.includes('web3')) {
            return 'web3';
          }
          // node_modules 일반 청크 (React 제외)
          if (id.includes('node_modules') && 
              !id.includes('react') && 
              !id.includes('lucide-react')) {
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
