# XPSwap DEX 프로젝트 개발 가이드 (Claude Desktop)

## 📁 프로젝트 개요

**XPSwap**은 Xphere 블록체인 기반의 차세대 탈중앙화 거래소(DEX)입니다.

### 주요 정보
- **로컬 경로**: `C:\Users\vincent\Downloads\XPswap\XPswap`
- **서버 경로**: `/var/www/storage/xpswap`
- **접속 URL**: https://trendy.storydot.kr/xpswap/
- **기술 스택**: React + TypeScript + Vite (Frontend), Node.js + Express (Backend)
- **데이터베이스**: SQLite (test.db)
- **라우터**: Wouter with basename="/xpswap"

## 🏗️ 프로젝트 구조

```
XPSwap/
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/    # UI 컴포넌트 (30+ 컴포넌트)
│   │   ├── pages/        # 라우트 페이지 (20+ 페이지)
│   │   ├── lib/          # 서비스 및 유틸리티
│   │   ├── hooks/        # React 커스텀 훅
│   │   ├── types/        # TypeScript 타입 정의
│   │   └── utils/        # 유틸리티 함수
│   └── dist/             # 빌드된 클라이언트 파일
│
├── server/                # Node.js 백엔드
│   ├── index.ts          # 서버 진입점
│   ├── routes.ts         # API 라우트 (2,500+ 라인)
│   ├── db.ts            # 데이터베이스 설정
│   ├── middleware/       # Express 미들웨어
│   └── utils/           # 서버 유틸리티
│
├── contracts/            # 스마트 컨트랙트 (16개)
│   ├── XpSwapAdvancedAMM.sol
│   ├── XpSwapLiquidityPool.sol
│   ├── XpSwapGovernanceToken.sol
│   └── ... (13개 추가 컨트랙트)
│
├── shared/              # 공유 타입 및 스키마
├── tests/               # 테스트 파일
├── scripts/             # 배포 및 유틸리티 스크립트
└── dist/               # 빌드된 서버 파일
```

## 🚀 개발 명령어

### 개발 환경 실행
```powershell
# 로컬 디렉토리로 이동
cd "C:\Users\vincent\Downloads\XPswap\XPswap"

# 의존성 설치
npm install

# 개발 서버 실행 (프론트엔드 + 백엔드)
npm run dev:full

# 또는 개별 실행
npm run dev:client  # Vite 개발 서버 (포트 5173)
npm run dev:server  # Express 서버 (포트 5000)
```

### 빌드 명령어
```powershell
# 전체 빌드
npm run build

# 개별 빌드
npm run build:client  # 클라이언트 빌드
npm run build:server  # 서버 빌드
```

### 테스트 실행
```powershell
npm run test           # 전체 테스트
npm run test:security  # 보안 테스트
npm run test:api      # API 테스트
npm run test:components # 컴포넌트 테스트
```

## 📄 주요 파일 및 기능

### 1. **라우팅 구조** (`client/src/App.tsx`)
- Wouter 라우터 사용 (basename="/xpswap")
- 20개 이상의 페이지 라우트
- 주요 페이지:
  - `/` - 홈페이지
  - `/swap` - 토큰 스왑
  - `/pool` - 유동성 풀
  - `/farm` - 수익률 파밍
  - `/bridge` - 크로스체인 브릿지
  - `/security` - 보안 대시보드
  - `/options`, `/futures`, `/flashloans` - 고급 DeFi 기능

### 2. **주요 컴포넌트** (`client/src/components/`)
- **SwapInterface.tsx** - 토큰 스왑 인터페이스
- **LiquidityPoolManager.tsx** - 유동성 풀 관리
- **CrossChainBridge.tsx** - 크로스체인 브릿지
- **SecurityDashboard.tsx** - 보안 모니터링
- **MultiChainPortfolio.tsx** - 멀티체인 포트폴리오
- **OptionsTrading/** - 옵션 거래 컴포넌트
- **CryptoTicker.tsx** - 실시간 암호화폐 가격 티커

### 3. **API 엔드포인트** (`server/routes.ts`)
- 100+ API 엔드포인트
- 주요 기능:
  - `/api/swap` - 스왑 관련
  - `/api/liquidity` - 유동성 풀
  - `/api/farming` - 수익률 파밍
  - `/api/bridge` - 브릿지 트랜잭션
  - `/api/market-stats` - 시장 통계
  - `/api/xp-price` - XP 토큰 가격

### 4. **스마트 컨트랙트** (`contracts/`)
16개의 프로덕션 준비 완료 컨트랙트:
- **XpSwapAdvancedAMM.sol** - AMM 알고리즘
- **XpSwapLiquidityPool.sol** - 유동성 풀
- **XpSwapGovernanceToken.sol** - 거버넌스 토큰
- **XPSwapMEVProtection.sol** - MEV 보호
- **XPSwapFlashLoanSecurity.sol** - 플래시론 보안

## 🔧 환경 설정

### 환경 변수 파일
```env
# .env
NODE_ENV=development
PORT=5000
DATABASE_URL=./test.db
COINMARKETCAP_API_KEY=your_api_key
BASE_PATH=/xpswap

# .env.production
NODE_ENV=production
PORT=5000
DATABASE_URL=./test.db
COINMARKETCAP_API_KEY=your_api_key
BASE_PATH=/xpswap
```

### PM2 설정 (`ecosystem.config.js`)
- 프로세스 이름: `xpswap-api`
- 메모리 제한: 500MB
- 자동 재시작 설정
- 로그 경로: `./logs/`

## 🛠️ 개발 가이드라인

### 1. **코드 스타일**
- TypeScript 사용
- React 함수형 컴포넌트
- Tailwind CSS + shadcn/ui 컴포넌트
- ESLint + Prettier 적용

### 2. **Git 브랜치 전략**
- `main` - 프로덕션 브랜치
- `develop` - 개발 브랜치
- `feature/*` - 기능 개발
- `fix/*` - 버그 수정

### 3. **테스트 작성**
- Vitest 사용
- 컴포넌트 테스트: React Testing Library
- API 테스트: Supertest
- 보안 테스트 필수

### 4. **보안 고려사항**
- Helmet.js 미들웨어 적용
- Rate limiting 설정
- Input validation
- XSS/CSRF 보호

## 📝 주요 개발 작업

### 현재 구현된 기능
✅ 토큰 스왑 (XP ↔ XPS)
✅ 유동성 풀 관리
✅ 수익률 파밍 (APY 최대 400%)
✅ 크로스체인 브릿지 (Li.Fi 통합)
✅ 거버넌스 투표
✅ 실시간 시장 데이터
✅ 멀티체인 포트폴리오
✅ 고급 DeFi 기능 (Options, Futures, Flash Loans)
✅ 보안 대시보드
✅ MEV 보호

### 개발 예정 기능
- [ ] 실제 블록체인 연동 (현재 시뮬레이션)
- [ ] XPS 토큰 실제 발행
- [ ] 스마트 컨트랙트 메인넷 배포
- [ ] KYC/AML 통합
- [ ] 다국어 지원

## 🚨 문제 해결

### 일반적인 이슈
1. **포트 충돌**: 5000번 포트 사용 중인 프로세스 확인
2. **빌드 실패**: node_modules 삭제 후 재설치
3. **데이터베이스 오류**: test.db 파일 권한 확인

### 디버깅 명령어
```powershell
# 로그 확인
npm run dev 2>&1 | tee debug.log

# 프로세스 확인 (Windows)
netstat -ano | findstr :5000

# 캐시 정리
npm cache clean --force
```

## 📞 추가 리소스

- **개발자 가이드**: `DEVELOPERS_GUIDE.md`
- **배포 가이드**: `DEPLOYMENT.md`
- **보안 감사 보고서**: `FINAL_SECURITY_AUDIT_REPORT.md`
- **API 레퍼런스**: `API_REFERENCE.md`

---

**참고**: 이 프로젝트는 현재 데모/테스트 환경으로 운영 중이며, 실제 메인넷 배포를 위해서는 스마트 컨트랙트 배포 및 블록체인 연동이 필요합니다.
