# XPSwap 컴포넌트 및 기능 맵

## 🗺️ 페이지별 기능 매핑

### 1. **홈페이지** (`/`)
- 파일: `client/src/pages/home.tsx`
- 컴포넌트: `MarketOverview`, `TopPairs`, `CryptoTicker`
- 기능: 시장 개요, 인기 거래쌍, 실시간 가격

### 2. **스왑** (`/swap`)
- 파일: `client/src/pages/swap.tsx`
- 컴포넌트: `SwapInterface`, `TokenSelector`
- API: `/api/swap/quote`, `/api/swap/execute`

### 3. **유동성 풀** (`/pool`)
- 파일: `client/src/pages/pool.tsx`
- 컴포넌트: `LiquidityPoolManager`, `LiquidityPools`
- API: `/api/liquidity/pools`, `/api/liquidity/add`

### 4. **파밍** (`/farm`)
- 파일: `client/src/pages/farm.tsx`
- 컴포넌트: `YieldFarmingManager`, `YieldOptimization`
- API: `/api/farming/pools`, `/api/farming/stake`

### 5. **브릿지** (`/bridge`)
- 파일: `client/src/pages/bridge.tsx`
- 컴포넌트: `CrossChainBridge`
- 통합: Li.Fi SDK

### 6. **보안** (`/security`)
- 파일: `client/src/pages/security.tsx`
- 컴포넌트: `SecurityDashboard`, `RiskManagement`
- 기능: MEV 보호, 스마트 컨트랙트 모니터링

### 7. **포트폴리오** (`/multichain-portfolio`)
- 파일: `client/src/pages/multichain-portfolio.tsx`
- 컴포넌트: `MultiChainPortfolio`, `PortfolioManager`
- 기능: 멀티체인 자산 관리

### 8. **고급 DeFi 기능**
- **옵션** (`/options`) - `OptionsTrading/`
- **선물** (`/futures`) - `pages/futures.tsx`
- **플래시론** (`/flashloans`) - `pages/flashloans.tsx`

## 🔧 핵심 서비스 및 유틸리티

### Web3 서비스 (`client/src/lib/`)
```typescript
// web3.ts - Web3 인스턴스 및 연결
// advancedContractService.ts - 스마트 컨트랙트 상호작용
// ammAlgorithms.ts - AMM 계산 알고리즘
// queryClient.ts - React Query 설정
```

### 커스텀 훅 (`client/src/hooks/`)
```typescript
// useWeb3.ts - Web3 연결 상태 관리
// useWallet.ts - 지갑 연결 로직
// useTokenBalance.ts - 토큰 잔액 조회
```

### UI 컴포넌트 (`client/src/components/ui/`)
- shadcn/ui 기반 컴포넌트
- Button, Card, Dialog, Toast 등
- Tailwind CSS 스타일링

## 📊 데이터 흐름

```
사용자 액션 → React 컴포넌트 → API 호출 → Express 서버
     ↓                                      ↓
  지갑 연결 ← 응답 데이터 ← SQLite DB ← 라우트 핸들러
```

## 🛡️ 보안 기능

1. **MEV 보호**: `XPSwapMEVProtection.sol`
2. **플래시론 보안**: `XPSwapFlashLoanSecurity.sol`
3. **Rate Limiting**: Express 미들웨어
4. **입력 검증**: Zod 스키마

## 🎨 스타일링 가이드

- **Primary Color**: `#3b82f6` (blue-500)
- **Dark Mode**: `ThemeProvider` 컴포넌트
- **애니메이션**: Framer Motion
- **아이콘**: Lucide React

## 📱 반응형 디자인

- Mobile: `sm:` prefix
- Tablet: `md:` prefix  
- Desktop: `lg:` prefix
- Wide: `xl:` prefix

## 🔄 상태 관리

- **React Query**: 서버 상태
- **useState/useReducer**: 로컬 상태
- **Context API**: 전역 상태 (테마, 지갑)

## 🚀 성능 최적화

1. **코드 스플리팅**: Vite의 동적 import
2. **이미지 최적화**: WebP 형식 사용
3. **캐싱**: React Query staleTime 설정
4. **번들 크기**: Tree shaking 적용
