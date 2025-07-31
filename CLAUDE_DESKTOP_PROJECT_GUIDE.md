# 🚀 XPSwap 프로젝트 - 클로드 데스크탑 통합 지침 (v2.0)
# 최종 업데이트: 2025년 8월 1일

## 📋 프로젝트 개요

**XPSwap**은 Xphere 블록체인 기반의 고급 DeFi 플랫폼으로, 토큰 스왑, 유동성 풀, 수익률 파밍, 크로스체인 브릿지 등을 제공합니다.

### 🔗 중요 링크
- **GitHub**: https://github.com/loganko83/xpswapmcp
- **로컬 개발**: http://localhost:5000/xpswap/ (백엔드), http://localhost:5195/xpswap/ (프론트엔드)
- **프로덕션**: https://trendy.storydot.kr/xpswap/
- **프로젝트 경로**: C:\Users\vincent\Downloads\XPswap\XPswap

### 🆕 최신 업데이트 (2025-08-01)
- ✅ **Xphere RPC URL 변경**: `https://www.ankr.com/rpc/xphere/`
- ✅ **지갑 연결 상태 유지**: WalletContext 구현
- ✅ **PWA 지원**: manifest.json, Service Worker 추가
- ✅ **에러 핸들링**: ErrorBoundary, LoadingSpinner 구현
- ✅ **실제 블록체인 서비스**: realBlockchain.js 통합

---

## 🛠️ 개발 환경 설정

### 시스템 요구사항
- **OS**: Windows (PowerShell 환경)
- **Node.js**: v18+ 권장
- **Package Manager**: npm
- **Git**: CLI 설치 완료 (gh 명령어 사용 가능)

### 환경 변수 (.env)
```bash
DATABASE_URL=./test.db
PORT=5000
NODE_ENV=development
XPHERE_RPC_URL=https://www.ankr.com/rpc/xphere/
BASE_PATH=/xpswap
```

### 프로덕션 환경 (.env.production)
```bash
DATABASE_URL=./test.db
PORT=5000
NODE_ENV=production
XPHERE_RPC_URL=https://www.ankr.com/rpc/xphere/
BASE_PATH=/xpswap
```

---

## 🚀 개발 명령어

### 기본 개발 명령어
```powershell
# 프로젝트 경로로 이동
cd "C:\Users\vincent\Downloads\XPswap\XPswap"

# 전체 개발 서버 실행 (권장)
npm run dev:full

# 개별 실행
npm run dev:client  # Vite 개발 서버 (포트 5173)
npm run dev:server  # Express 서버 (포트 5000)

# 빌드
npm run build       # 전체 빌드
npm run build:client # 클라이언트만
npm run build:server # 서버만

# 테스트
npm run test        # 전체 테스트
npm run test:api    # API 테스트
npm run test:security # 보안 테스트
```

### 문제 해결 명령어
```powershell
# 포트 충돌 확인
netstat -ano | findstr :5000

# 의존성 재설치
rm -rf node_modules ; npm install

# 서버에서는 legacy-peer-deps 필요
npm install --legacy-peer-deps

# 데이터베이스 초기화
rm test.db

# 캐시 초기화
rm -rf dist ; rm -rf client/dist
```

---

## 📁 프로젝트 구조

```
C:\Users\vincent\Downloads\XPswap\XPswap\
├── client/                     # React 프론트엔드
│   ├── src/
│   │   ├── App.tsx            # 메인 라우팅 (Wouter 사용)
│   │   ├── components/        # 재사용 컴포넌트
│   │   │   ├── Layout.tsx     # 전체 레이아웃 & 네비게이션
│   │   │   ├── SwapInterface.tsx     # 토큰 스왑 UI
│   │   │   ├── CryptoTicker.tsx      # 실시간 가격 티커
│   │   │   ├── ErrorBoundary.tsx     # 에러 처리
│   │   │   ├── LoadingSpinner.tsx    # 로딩 표시
│   │   │   └── ui/            # shadcn/ui 컴포넌트
│   │   ├── pages/             # 페이지 컴포넌트 (25개+)
│   │   ├── lib/               # 서비스 & 유틸리티
│   │   │   ├── apiUrl.ts      # API URL 설정 (BASE_PATH 적용)
│   │   │   ├── constants.ts   # RPC URL 등 상수
│   │   │   └── metamask.ts    # 지갑 연결 로직
│   │   ├── hooks/             # React Hooks
│   │   ├── contexts/          # React Context
│   │   │   └── WalletContext.tsx  # 지갑 상태 관리
│   │   └── types/             # TypeScript 타입
│   ├── public/
│   │   ├── manifest.json      # PWA 설정
│   │   └── sw.js              # Service Worker
│   └── dist/                  # 빌드된 파일
│
├── server/                    # Node.js 백엔드
│   ├── index.ts              # Express 서버 진입점
│   ├── routes.ts             # 메인 API 라우트 (2500+ 라인)
│   ├── routes/               # 모듈화된 라우트
│   │   ├── trading.ts        # market-stats 등 거래 API
│   │   ├── security.ts       # 보안 관련 API
│   │   └── ...
│   ├── services/             # 비즈니스 로직
│   │   └── realBlockchain.js # 실제 블록체인 연동
│   ├── middleware/           # Express 미들웨어
│   ├── abi/                  # 스마트 컨트랙트 ABI
│   │   ├── dex.js
│   │   └── token.js
│   └── db.ts                 # SQLite 설정
│
├── contracts/                # 스마트 컨트랙트 (16개)
├── doc/                      # 프로젝트 문서
│   ├── progress/            # 일일 진행 상황
│   ├── CLAUDE.md            # 작업 일지
│   └── CLAUDE_DESKTOP_PROJECT_GUIDE.md
│
├── tests/                    # 테스트 파일
├── dist/                     # 빌드된 서버 파일
├── .env                      # 환경 변수
├── .env.production           # 프로덕션 환경 변수
├── package.json             # NPM 설정
├── vite.config.ts           # Vite 설정
└── ecosystem.config.js      # PM2 설정
```

---

## 🔧 주요 작업 위치

### 파일 수정 가이드
- **메뉴 수정**: `client/src/components/Layout.tsx`
- **홈페이지**: `client/src/pages/home.tsx`
- **API 추가**: `server/routes.ts` 또는 `server/routes/*.ts`
- **새 페이지**: `client/src/pages/` + `client/src/App.tsx` 라우트 추가
- **스타일링**: Tailwind CSS + shadcn/ui
- **상태 관리**: React Query + Zustand + WalletContext
- **RPC URL**: `client/src/lib/constants.ts`, `.env` 파일

### 중요 API 엔드포인트 (BASE_PATH: /xpswap)
- `GET /xpswap/api/health` - 서버 상태 확인
- `GET /xpswap/api/xp-price` - XP 토큰 가격 (캐싱 적용)
- `GET /xpswap/api/market-stats` - 시장 통계 (실제 블록체인 데이터)
- `POST /xpswap/api/swap/quote` - 스왑 견적 계산
- `GET /xpswap/api/pools` - 유동성 풀 목록
- `GET /xpswap/api/farms` - 파밍 풀 목록
- `GET /xpswap/api/crypto-ticker` - 실시간 가격 티커

---

## 📝 작업 진행 규칙

### 1. 문서화 규칙
- **일일 진행상황**: `doc/progress/progress_{날짜}.md` 파일 생성
- **중요 변경사항**: `doc/CLAUDE.md`에 기록
- **작업 완료 시**: 해당 문서에 상태 업데이트

### 2. Git 작업 플로우
```powershell
# 파일 수정 후 항상 커밋
git add .
git commit -m "feat: 기능 설명"

# GitHub 동기화
git push origin main

# 브랜치 전략
git checkout -b feature/새기능명  # 새 기능 개발
git checkout -b fix/버그수정명    # 버그 수정
```

### 3. 개발 환경별 주의사항

#### Windows PowerShell 환경
- `&&` 대신 `;` 사용: `npm install ; npm start`
- `curl` 사용 시 CMD 권장 (PowerShell의 Invoke-WebRequest와 충돌)
- 경로 구분자: `\` 또는 `/` 모두 사용 가능

#### API 테스트
```powershell
# CMD에서 실행 (권장)
curl http://localhost:5000/xpswap/api/health
curl http://localhost:5000/xpswap/api/xp-price
curl http://localhost:5000/xpswap/api/crypto-ticker

# 프로덕션 테스트
curl https://trendy.storydot.kr/xpswap/api/health
```

---

## 🔐 보안 및 성능

### 적용된 보안 기능
- **Helmet.js**: HTTP 헤더 보안
- **CORS**: 크로스 오리진 제어
- **Rate Limiting**: API 속도 제한 (프로덕션 환경에서 활성화)
- **Input Validation**: 입력값 검증
- **MEV Protection**: 최대 추출 가능 가치 보호
- **ErrorBoundary**: 전역 에러 처리

### 성능 최적화
- **캐싱**: 메모리 캐시 (TTL: 60초)
- **XP Price API**: 297ms → 2-4ms 응답 시간
- **캐시 히트율**: 95%+
- **코드 스플리팅**: Vite 적용
- **Service Worker**: 오프라인 지원

---

## 🚀 배포 가이드

### 로컬 빌드
```powershell
cd "C:\Users\vincent\Downloads\XPswap\XPswap"
npm run build
# dist/ 폴더와 client/dist/ 폴더 생성 확인
```

### 서버 배포
```bash
# 서버 SSH 접속
ssh ubuntu@trendy.storydot.kr

# 프로젝트 경로
cd /var/www/storage/xpswap

# Git 업데이트
git pull origin main

# 의존성 설치 (legacy-peer-deps 필요)
npm install --legacy-peer-deps

# 빌드
npm run build

# PM2 프로세스 관리
pm2 list
pm2 stop xpswap-api
pm2 start ecosystem.config.js --env production
pm2 logs xpswap-api --lines 50
```

### Apache 설정 (/etc/apache2/sites-available/xpswap.conf)
```apache
# XPSwap DEX Configuration

# API Proxy - MUST come before Alias
ProxyRequests Off
ProxyPreserveHost On
ProxyPass /xpswap/api http://localhost:5000/xpswap/api
ProxyPassReverse /xpswap/api http://localhost:5000/xpswap/api

# Static files - client/dist 사용 (dist/public 아님!)
Alias /xpswap /var/www/storage/xpswap/client/dist

<Directory /var/www/storage/xpswap/client/dist>
    Options FollowSymLinks
    AllowOverride None
    Require all granted
    DirectoryIndex index.html
    
    RewriteEngine On
    RewriteBase /xpswap
    
    # Handle React Router - serve index.html for all routes except files
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^.*$ /xpswap/index.html [L]
</Directory>
```

### 배포 확인사항
- [ ] https://trendy.storydot.kr/xpswap/ 접속 확인
- [ ] 상단 암호화폐 티커 표시 확인
- [ ] 메뉴 네비게이션 작동 확인
- [ ] API 응답 확인 (/xpswap/api/health)
- [ ] 콘솔 에러 없음 확인
- [ ] 새로고침 시 정상 작동 확인

---

## 🐛 디버깅 및 테스트

### 디버깅 도구
- **API 테스트**: `client/public/debug.html`
- **서버 로그**: `pm2 logs xpswap-api`
- **브라우저 개발자 도구**: F12

### 일반적인 문제 해결

#### 1. 포트 충돌 (EADDRINUSE)
```powershell
netstat -ano | findstr :5000
# 프로세스 ID 확인 후 종료
taskkill /PID [프로세스ID] /F
```

#### 2. API 호출 실패
- 서버 실행 상태 확인: `npm run dev:server`
- 포트 설정 확인: `.env` 파일의 PORT=5000
- BASE_PATH 확인: 프로덕션에서는 `/xpswap/api`
- CORS 설정 확인: `server/index.ts`

#### 3. 빌드 오류
```powershell
# TypeScript 타입 체크
npx tsc --noEmit

# 의존성 문제 해결 (서버)
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# import 오류 해결
# realBlockchain.js의 CONTRACT_ADDRESSES import 주석 처리
```

#### 4. 데이터베이스 문제
```powershell
# SQLite DB 초기화
rm test.db
npm run dev:server  # 자동으로 DB 재생성
```

#### 5. 크립토 티커 미표시
- 캐시 삭제: Ctrl+F5
- Service Worker 업데이트: 개발자 도구 > Application > Service Workers > Update

---

## 📊 현재 프로젝트 상태

### ✅ 완료된 기능
1. **토큰 스왑**: XP ↔ XPS 및 멀티체인 토큰
2. **유동성 풀**: 추가/제거 및 수수료 수익
3. **수익률 파밍**: 최대 400% APY
4. **크로스체인 브릿지**: Li.Fi SDK 통합
5. **실시간 데이터**: 암호화폐 가격 티커
6. **보안 대시보드**: MEV 보호, 컨트랙트 모니터링
7. **고급 DeFi**: Options, Futures, Flash Loans
8. **캐싱 시스템**: 성능 최적화 완료
9. **지갑 연결 유지**: WalletContext 구현
10. **PWA 지원**: 모바일 최적화, Service Worker
11. **에러 핸들링**: ErrorBoundary, LoadingSpinner

### 🚧 진행 중인 작업
1. Mock 데이터 → 실제 블록체인 데이터 전환
2. 스마트 컨트랙트 배포
3. 프론트엔드 티커 표시 문제 해결
4. Apache RewriteRule 개선

### 🎯 우선순위 작업
1. **HIGH**: 프론트엔드 디버깅 (티커, 라우팅)
2. **MEDIUM**: 실제 블록체인 데이터 연동
3. **LOW**: UI/UX 개선 및 추가 기능

---

## 🔍 주요 도구 및 MCP 사용법

### Desktop Commander 사용
- **파일 작업**: `desktop-commander:read_file`, `write_file`, `edit_block`
- **프로세스 관리**: `start_process`, `interact_with_process`
- **API 테스트**: `start_process("cmd")` → `curl` 명령어 실행

### GitHub MCP 사용
```javascript
// 파일 생성/수정 후 자동 커밋
github-mcp-official:create_or_update_file
github-mcp-official:push_files
```

### SSH MCP 사용
```javascript
// 서버 접속 및 명령 실행
ssh-mcp:exec
```

### 권장하지 않는 도구
- ❌ **Playwright MCP**: 브라우저 자동화 불필요
- ❌ **Analysis Tool**: 로컬 파일 접근 불가

---

## 📞 문제 발생 시 대응

### 긴급 문제 해결 순서
1. **서버 다운**: PM2 재시작 → Apache 재시작 → 서버 재부팅
2. **API 오류**: 로그 확인 → 환경변수 점검 → DB 상태 확인
3. **빌드 실패**: 의존성 재설치 → TypeScript 오류 수정
4. **Git 충돌**: `git status` → 충돌 해결 → 강제 푸시

### 백업 및 복구
```bash
# 백업 생성
cp -r /var/www/storage/xpswap /var/www/storage/xpswap_backup_$(date +%Y%m%d)

# 롤백
pm2 stop xpswap-api
rm -rf /var/www/storage/xpswap
mv /var/www/storage/xpswap_backup_YYYYMMDD /var/www/storage/xpswap
pm2 start xpswap-api
```

---

## 📈 모니터링 및 로그

### 실시간 모니터링
```bash
# PM2 모니터링
pm2 monit

# 실시간 로그
pm2 logs xpswap-api --lines 50 -f

# 시스템 리소스
htop
df -h
```

### 성능 지표
- **메모리 사용량**: ~115MB (안정적)
- **API 응답 시간**: 2-4ms (캐싱 적용)
- **디스크 사용량**: 스토리지 13% (여유 충분)
- **캐시 히트율**: 95%+

---

## 📋 체크리스트

### 일일 작업 전 체크리스트
- [ ] Git 상태 확인: `git status`
- [ ] 서버 상태 확인: `npm run dev:server`
- [ ] 의존성 업데이트: `npm audit`
- [ ] 환경변수 확인: `.env` 파일

### 작업 완료 후 체크리스트
- [ ] 로컬 테스트: 모든 페이지 정상 작동
- [ ] API 테스트: 주요 엔드포인트 응답 확인
- [ ] Git 커밋: 변경사항 저장
- [ ] 문서 업데이트: `doc/progress/progress_{날짜}.md`
- [ ] 배포 (필요시): 빌드 → 서버 업로드 → PM2 재시작

---

## 🎯 최종 목표

XPSwap은 **안전하고 효율적인 DeFi 플랫폼**을 목표로 합니다:

1. **사용자 친화적 UI/UX**
2. **실시간 시장 데이터 제공**
3. **고급 DeFi 기능 통합**
4. **최고 수준의 보안**
5. **멀티체인 지원**

---

## 📚 참고 문서

- **작업 일지**: `doc/CLAUDE.md`
- **진행 상황**: `doc/progress/` 디렉토리
- **스마트 컨트랙트**: `doc/SMART_CONTRACT_DEPLOYMENT.md`
- **API 문서**: `doc/API_DOCUMENTATION.md`
- **보안 가이드**: `doc/SECURITY_GUIDE.md`

---

*이 지침서는 XPSwap 프로젝트의 모든 개발 작업에 대한 종합적인 가이드입니다. 지속적으로 업데이트하며 최신 상태를 유지합니다.*

**📞 프로젝트 문의**: GitHub Issues를 통해 제출해주세요.
**🔗 저장소**: https://github.com/loganko83/xpswapmcp
**📅 최종 업데이트**: 2025년 8월 1일
