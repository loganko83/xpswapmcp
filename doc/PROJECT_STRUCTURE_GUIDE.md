# XPSwap 프로젝트 구조 및 기능 가이드

## 📁 프로젝트 디렉토리 구조

```
C:\Users\vincent\Downloads\XPswap\XPswap\
├── client/                     # React 프론트엔드
│   ├── src/
│   │   ├── App.tsx            # 메인 라우팅 설정 (Wouter 사용)
│   │   ├── main.tsx           # React 진입점
│   │   ├── components/        # 재사용 가능한 컴포넌트
│   │   │   ├── Layout.tsx     # 전체 레이아웃 및 네비게이션
│   │   │   ├── SwapInterface.tsx     # 토큰 스왑 UI
│   │   │   ├── LiquidityPoolManager.tsx # 유동성 풀 관리
│   │   │   ├── CrossChainBridge.tsx  # 크로스체인 브릿지
│   │   │   ├── SecurityDashboard.tsx # 보안 대시보드
│   │   │   ├── TokenSelector.tsx     # 토큰 선택 모달
│   │   │   ├── CryptoTicker.tsx      # 실시간 가격 티커
│   │   │   └── ui/            # shadcn/ui 컴포넌트
│   │   ├── pages/             # 라우트별 페이지 (25개+)
│   │   │   ├── home.tsx       # 홈페이지
│   │   │   ├── swap.tsx       # 스왑 페이지
│   │   │   ├── pool.tsx       # 유동성 풀
│   │   │   ├── farm.tsx       # 수익률 파밍
│   │   │   ├── bridge.tsx     # 브릿지
│   │   │   ├── trading.tsx    # 고급 트레이딩
│   │   │   ├── xps-purchase.tsx # XPS 구매
│   │   │   ├── security.tsx   # 보안 페이지
│   │   │   ├── analytics.tsx  # 분석
│   │   │   ├── options.tsx    # 옵션 거래
│   │   │   ├── futures.tsx    # 선물 거래
│   │   │   └── flashloans.tsx # 플래시론
│   │   ├── lib/               # 서비스 및 유틸리티
│   │   │   ├── web3.ts        # Web3 인스턴스
│   │   │   ├── contracts.ts   # 스마트 컨트랙트 상호작용
│   │   │   └── queryClient.ts # React Query 설정
│   │   ├── hooks/             # 커스텀 React Hooks
│   │   │   ├── useWeb3.ts     # Web3 연결 관리
│   │   │   ├── useWallet.ts   # 지갑 상태 관리
│   │   │   └── useTokenBalance.ts # 토큰 잔액
│   │   ├── types/             # TypeScript 타입 정의
│   │   └── utils/             # 유틸리티 함수
│   └── dist/                  # 빌드된 프론트엔드 파일
│
├── server/                    # Node.js 백엔드
│   ├── index.ts              # Express 서버 진입점
│   ├── routes.ts             # 메인 API 라우트 (2500+ 라인)
│   ├── routes/               # 모듈화된 라우트
│   │   ├── trading.ts        # 거래 관련 API
│   │   ├── farm.ts           # 파밍 API
│   │   ├── advanced.ts       # 고급 DeFi API
│   │   ├── security.ts       # 보안 API
│   │   └── cache.ts          # 캐시 관리 API
│   ├── services/             # 비즈니스 로직
│   │   └── cache.ts          # 캐싱 서비스
│   ├── middleware/           # Express 미들웨어
│   │   └── enhanced-security.ts # 보안 미들웨어
│   ├── db.ts                 # SQLite 데이터베이스 설정
│   └── utils/                # 서버 유틸리티
│
├── contracts/                # 스마트 컨트랙트 (16개)
│   ├── XpSwapAdvancedAMM.sol
│   ├── XpSwapLiquidityPool.sol
│   ├── XpSwapGovernanceToken.sol
│   ├── XPSwapMEVProtection.sol
│   ├── XPSwapFlashLoanSecurity.sol
│   └── ... (11개 추가)
│
├── shared/                   # 공유 타입 및 스키마
├── tests/                    # 테스트 파일
├── scripts/                  # 배포 및 유틸리티 스크립트
├── doc/                      # 프로젝트 문서
├── dist/                     # 빌드된 서버 파일
├── .env                      # 환경 변수
├── .env.production          # 프로덕션 환경 변수
├── package.json             # NPM 설정
├── tsconfig.json            # TypeScript 설정
├── vite.config.ts           # Vite 설정
└── ecosystem.config.js      # PM2 설정
```

## 🔧 주요 기능 및 API 엔드포인트

### 1. 기본 API (/api)
- `GET /api/health` - 서버 상태 확인
- `GET /api/xp-price` - XP 토큰 가격 (캐싱 적용)
- `GET /api/market-stats` - 시장 통계 (캐싱 적용)

### 2. 스왑 API (/api/swap)
- `POST /api/swap/quote` - 스왑 견적 계산
- `POST /api/swap/execute` - 스왑 실행
- `GET /api/swap/history` - 스왑 내역
- `GET /api/xphere-tokens` - Xphere 토큰 리스트
- `GET /api/ethereum-tokens` - 이더리움 토큰 리스트
- `GET /api/bsc-tokens` - BSC 토큰 리스트

### 3. 유동성 풀 API (/api/liquidity)
- `GET /api/pools` - 풀 목록 조회
- `POST /api/liquidity/add` - 유동성 추가
- `POST /api/liquidity/remove` - 유동성 제거
- `GET /api/liquidity/positions` - 내 포지션

### 4. 파밍 API (/api/farming)
- `GET /api/farms` - 파밍 풀 목록
- `POST /api/farming/stake` - 스테이킹
- `POST /api/farming/unstake` - 언스테이킹
- `POST /api/farming/claim` - 보상 청구

### 5. 브릿지 API (/api/bridge)
- `GET /api/bridge/networks` - 지원 네트워크
- `POST /api/bridge/quote` - 브릿지 견적
- `POST /api/bridge/transfer` - 크로스체인 전송
- `GET /api/bridge/status/:txId` - 전송 상태

### 6. 고급 DeFi API
- **옵션**: `/api/options/*`
- **선물**: `/api/futures/*`
- **플래시론**: `/api/flashloans/*`

### 7. 보안 API (/api/security)
- `GET /api/security/status` - 보안 상태
- `GET /api/security/mev-protection` - MEV 보호 상태
- `GET /api/security/audit-log` - 감사 로그
- `POST /api/security/verify-contract` - 컨트랙트 검증

### 8. 캐시 관리 API (/api/cache)
- `GET /api/cache/stats` - 캐시 통계
- `DELETE /api/cache/clear` - 캐시 초기화

## 🚀 개발 명령어

### 개발 서버 실행
```powershell
cd "C:\Users\vincent\Downloads\XPswap\XPswap"
npm run dev:full  # 프론트엔드 + 백엔드 동시 실행
```

### 개별 실행
```powershell
npm run dev:client  # 프론트엔드만 (포트 5173)
npm run dev:server  # 백엔드만 (포트 5000)
```

### 빌드
```powershell
npm run build         # 전체 빌드
npm run build:client  # 프론트엔드만
npm run build:server  # 백엔드만
```

### 테스트
```powershell
npm run test           # 전체 테스트
npm run test:security  # 보안 테스트
npm run test:api      # API 테스트
```

## 🔑 핵심 기능 구현 상태

### ✅ 완료된 기능
1. **토큰 스왑** - XP ↔ XPS 및 멀티체인 토큰
2. **유동성 풀** - 추가/제거 및 수수료 수익
3. **수익률 파밍** - 최대 400% APY
4. **크로스체인 브릿지** - Li.Fi SDK 통합
5. **거버넌스** - XPS 토큰 투표
6. **실시간 시장 데이터** - 암호화폐 가격 티커
7. **멀티체인 포트폴리오** - 자산 관리
8. **고급 DeFi** - Options, Futures, Flash Loans
9. **보안 대시보드** - MEV 보호, 컨트랙트 모니터링
10. **캐싱 시스템** - 성능 최적화 (2-4ms 응답)

### 🚧 진행 중
1. 실제 블록체인 연동 (현재 시뮬레이션)
2. 프로덕션 환경 설정
3. 통합 테스트

### 📋 미구현
1. 실제 스마트 컨트랙트 배포
2. KYC/AML 통합
3. 다국어 지원
4. 모바일 앱

## 🛡️ 보안 설정

### 적용된 보안 미들웨어
- Helmet.js - HTTP 헤더 보안
- CORS - 크로스 오리진 제어
- Rate Limiting - API 속도 제한
- Input Validation - 입력값 검증
- SQL Injection 방지
- XSS/CSRF 보호

### 스마트 컨트랙트 보안
- MEV 보호 메커니즘
- 플래시론 보안
- 재진입 공격 방지
- 권한 관리 시스템

## 📊 성능 최적화

### 캐싱 전략
- 메모리 캐시 (TTL: 60초)
- XP Price API: 297ms → 2-4ms
- Market Stats API: 캐싱 적용
- 캐시 히트율: 95%+

### 최적화 기법
- 코드 스플리팅 (Vite)
- 이미지 최적화 (WebP)
- React Query 캐싱
- Tree Shaking
- Gzip 압축

## 🔗 외부 통합

### 블록체인
- Xphere Network (RPC: https://en-bkk.x-phere.com)
- Ethereum Mainnet
- Binance Smart Chain

### 외부 서비스
- CoinMarketCap API - 가격 데이터
- Li.Fi SDK - 크로스체인 브릿지
- Web3 Provider - 지갑 연결

## 📝 Git 정보

### 저장소
- URL: https://github.com/loganko83/xpswapmcp
- 브랜치: main
- 최신 커밋: 캐시 시스템 간소화

### 브랜치 전략
- `main` - 프로덕션
- `develop` - 개발
- `feature/*` - 기능 개발
- `fix/*` - 버그 수정

## 🚨 알려진 이슈 및 해결 방법

### 1. 포트 충돌
```powershell
# 5000번 포트 사용 중인 프로세스 확인
netstat -ano | findstr :5000
```

### 2. 의존성 문제
```powershell
# node_modules 재설치
rm -rf node_modules ; npm install
```

### 3. 데이터베이스 초기화
```powershell
rm test.db ; touch test.db
```

## 📞 문의 및 지원

프로젝트 관련 문의사항은 GitHub Issues를 통해 제출해주세요.

---
최종 업데이트: 2025년 7월 26일