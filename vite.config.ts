import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';
import { visualizer } from 'rollup-plugin-visualizer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 환경에 따른 BASE_PATH 설정
const isDevelopment = process.env.NODE_ENV === 'development';
const basePath = isDevelopment ? '/' : '/xpswap/';

export default defineConfig({
  base: basePath,
  plugins: [
    react({
      // React 최적화 설정
      fastRefresh: false, // 프로덕션에서 fast refresh 비활성화
      jsxRuntime: 'automatic', // 자동 JSX 런타임 사용
    }),
    // 번들 분석기 추가 (프로덕션 빌드 시에만)
    process.env.ANALYZE === 'true' && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
    // React 중복 인스턴스 방지를 위한 dedupe (가장 중요!)
    dedupe: ['react', 'react-dom', 'react/jsx-runtime']
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "client/dist"),
    emptyOutDir: true,
    // 소스맵 활성화 (디버깅용)
    sourcemap: false,
    rollupOptions: {
      // React 관련 외부 의존성 처리 방식 변경
      external: [],
      output: {
        // 더 세밀한 청크 분할 전략
        manualChunks: {
          // React 핵심을 별도 청크로 분리
          'react-core': ['react', 'react-dom', 'react/jsx-runtime'],
          // React Router 등 라우팅 관련
          'react-router': ['wouter'],
          // UI 라이브러리들
          'ui-components': [
            'lucide-react',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip'
          ],
          // 차트 라이브러리
          'charts': ['lightweight-charts', 'recharts'],
          // DeFi/Web3 관련
          'web3': ['ethers', 'web3', '@lifi/sdk'],
          // 기타 큰 라이브러리들
          'vendor': ['framer-motion', '@tanstack/react-query'],
        },
        // 모든 청크에서 consistent한 imports 보장
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    // 청크 크기 경고 임계값 조정
    chunkSizeWarningLimit: 800,
    // ESBuild 사용 (더 안정적)
    minify: 'esbuild',
    // Target 설정 (최신 브라우저 지원)
    target: 'esnext',
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
  // 최적화 설정 - React 중복 방지 강화
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime'],
    exclude: [],
    // 강제로 사전 번들링
    force: true,
  },
  // 정의 추가
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    __DEV__: JSON.stringify(false),
  },
});
