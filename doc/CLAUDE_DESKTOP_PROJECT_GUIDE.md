# 🚀 XPSwap 프로젝트 - 클로드 데스크탑 통합 지침 (v2.1)
# 최종 업데이트: 2025년 8월 2일

## 📋 프로젝트 개요

**XPSwap**은 Xphere 블록체인 기반의 고급 DeFi 플랫폼으로, 토큰 스왑, 유동성 풀, 수익률 파밍, 크로스체인 브릿지 등을 제공합니다.

### 🌐 서버 구성 (trendy.storydot.kr)
**단일 서버 멀티 서비스 환경**:
- **메인 사이트**: trendy.storydot.kr → WordPress 뉴스 사이트
- **DEX 서비스**: trendy.storydot.kr/xpswap → XPSwap DeFi 플랫폼 (포트 5000)
- **전자서명**: trendy.storydot.kr/signchain → SignChain 전자서명 서비스

각 서비스는 독립적인 Node.js 프로세스와 API 엔드포인트를 가지며, Apache 프록시를 통해 라우팅됩니다.

### 🔗 중요 링크
- **GitHub**: https://github.com/loganko83/xpswapmcp
- **로컬 개발**: http://localhost:5000/xpswap/ (백엔드), http://localhost:5173/xpswap/ (프론트엔드)
- **프로덕션**: https://trendy.storydot.kr/xpswap/
- **프로젝트 경로**: C:\Users\vincent\Downloads\XPswap\XPswap

### 🆕 최신 업데이트 (2025-08-02)
- ✅ **멀티 서비스 분리**: XPSwap, SignChain 독립 실행
- ✅ **PM2 프로세스 관리**: 각 서비스별 독립적 모니터링
- ✅ **Apache 프록시 설정**: 경로별 서비스 라우팅
- ✅ **포트 분리**: XPSwap(5000), SignChain(다른 포트)
- ✅ **BASE_PATH 설정**: /xpswap 경로 고정

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

### 멀티 서비스 환경 명령어
```powershell
# XPSwap 서비스만 실행 (개발)
npm run dev:server

# 다른 서비스와 포트 충돌 확인
netstat -ano | findstr :5000
netstat -ano | findstr :5001  # SignChain 등 다른 서비스

# PM2를 통한 프로덕션 서비스 관리
pm2 list                      # 모든 서비스 상태 확인
pm2 logs xpswap-api          # XPSwap 로그만
pm2 logs signchain-api       # SignChain 로그만 (예시)
pm2 restart xpswap-api       # XPSwap만 재시작
```

### 문제 해결 명령어
```powershell
# 포트 충돌 확인 및 해결
netstat -ano | findstr :5000
taskkill /PID [프로세스ID] /F

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
│   ├── index.ts              # Express 서버 진입점 (BASE_PATH 지원)
│   ├── routes.ts             # 메인 API 라우트 (2500+ 라인)
│   ├── routes/               # 모듈화된 라우트
│   │   ├── trading.ts        # market-stats 등 거래 API
│   │   ├── security.ts       # 보안 관련 API
│   │   └── ...
│   ├── services/             # 비즈니스 로직
│   │   └── realBlockchain.js # 실제 블록체인 연동
│   ├── middleware/           # Express 미들웨어
│   │   └── enhanced-security.ts # 보안 강화 미들웨어
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
├── ecosystem.config.js      # PM2 설정 (xpswap-api)
├── .env                      # 환경 변수
├── .env.production           # 프로덕션 환경 변수
├── package.json             # NPM 설정
└── vite.config.ts           # Vite 설정
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
- **서버 설정**: `server/index.ts` (BASE_PATH, 포트 설정)

### 중요 API 엔드포인트 (BASE_PATH: /xpswap)
- `GET /xpswap/api/health` - 서버 상태 확인
- `GET /xpswap/api/xp-price` - XP 토큰 가격 (캐싱 적용)
- `GET /xpswap/api/market-stats` - 시장 통계 (실제 블록체인 데이터)
- `POST /xpswap/api/swap/quote` - 스왑 견적 계산
- `GET /xpswap/api/pools` - 유동성 풀 목록
- `GET /xpswap/api/farms` - 파밍 풀 목록
- `GET /xpswap/api/crypto-ticker` - 실시간 가격 티커

---

## 🌐 멀티 서비스 서버 관리

### PM2 프로세스 관리
```bash
# 전체 서비스 상태 확인
pm2 list

# XPSwap 서비스 관리
pm2 start ecosystem.config.js --name xpswap-api
pm2 stop xpswap-api
pm2 restart xpswap-api
pm2 logs xpswap-api --lines 50

# 다른 서비스들과 리소스 모니터링
pm2 monit
htop
df -h
```

### Apache 가상 호스트 설정
**⚠️ 중요: 각 서비스별 프록시 순서가 중요합니다**

```apache
# /etc/apache2/sites-available/trendy.storydot.kr.conf

<VirtualHost *:80>
    ServerName trendy.storydot.kr
    DocumentRoot /var/www/html
    
    # XPSwap API 프록시 (MUST come first - most specific)
    ProxyRequests Off
    ProxyPreserveHost On
    ProxyPass /xpswap/api http://localhost:5000/xpswap/api
    ProxyPassReverse /xpswap/api http://localhost:5000/xpswap/api
    
    # SignChain API 프록시 (예시)
    ProxyPass /signchain/api http://localhost:5001/signchain/api
    ProxyPassReverse /signchain/api http://localhost:5001/signchain/api
    
    # XPSwap 정적 파일
    Alias /xpswap /var/www/storage/xpswap/client/dist
    <Directory /var/www/storage/xpswap/client/dist>
        Options FollowSymLinks
        AllowOverride None
        Require all granted
        DirectoryIndex index.html
        
        RewriteEngine On
        RewriteBase /xpswap
        
        # React Router 지원
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^.*$ /xpswap/index.html [L]
    </Directory>
    
    # SignChain 정적 파일 (예시)
    Alias /signchain /var/www/storage/signchain/client/dist
    <Directory /var/www/storage/signchain/client/dist>
        Options FollowSymLinks
        AllowOverride None
        Require all granted
        DirectoryIndex index.html
        
        RewriteEngine On
        RewriteBase /signchain
        
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^.*$ /signchain/index.html [L]
    </Directory>
    
    # WordPress 메인 사이트 (기본 경로)
    <Directory /var/www/html>
        Options FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### 포트 분리 및 충돌 방지
```bash
# 포트 사용 현황 확인
netstat -tulpn | grep LISTEN

# 예상 포트 배치
# 5000: XPSwap API
# 5001: SignChain API  
# 80: Apache HTTP
# 443: Apache HTTPS
# 3306: MySQL (WordPress)

# 포트 충돌 시 프로세스 확인
lsof -i :5000
lsof -i :5001
```

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

#### API 테스트 (멀티 서비스 환경)
```powershell
# CMD에서 실행 (권장)
# XPSwap 서비스 테스트
curl http://localhost:5000/xpswap/api/health
curl http://localhost:5000/xpswap/api/xp-price
curl http://localhost:5000/xpswap/api/crypto-ticker

# 프로덕션 테스트
curl https://trendy.storydot.kr/xpswap/api/health

# SignChain 서비스 테스트 (예시)
curl http://localhost:5001/signchain/api/health
curl https://trendy.storydot.kr/signchain/api/health
```

---

## 🔐 보안 및 성능

### 적용된 보안 기능
- **Helmet.js**: HTTP 헤더 보안
- **CORS**: 크로스 오리진 제어 (서비스별 분리)
- **Rate Limiting**: API 속도 제한 (프로덕션 환경에서 활성화)
- **Input Validation**: 입력값 검증
- **MEV Protection**: 최대 추출 가능 가치 보호
- **ErrorBoundary**: 전역 에러 처리
- **Enhanced Security Middleware**: 고급 보안 기능

### 성능 최적화
- **캐싱**: 메모리 캐시 (TTL: 60초)
- **XP Price API**: 297ms → 2-4ms 응답 시간
- **캐시 히트율**: 95%+
- **코드 스플리팅**: Vite 적용
- **Service Worker**: 오프라인 지원
- **멀티 프로세스**: 서비스별 독립적 확장

### 멀티 서비스 리소스 관리
```bash
# 메모리 사용량 모니터링
pm2 monit

# 서비스별 메모리 제한 (ecosystem.config.js)
max_memory_restart: '500M'  # XPSwap
max_memory_restart: '300M'  # SignChain (예시)

# 디스크 사용량
du -sh /var/www/storage/xpswap
du -sh /var/www/storage/signchain
```

---

## 🚀 배포 가이드

### 로컬 빌드
```powershell
cd "C:\Users\vincent\Downloads\XPswap\XPswap"
npm run build
# dist/ 폴더와 client/dist/ 폴더 생성 확인
```

### 멀티 서비스 서버 배포
```bash
# 서버 SSH 접속
ssh ubuntu@trendy.storydot.kr

# XPSwap 서비스 배포
cd /var/www/storage/xpswap
git pull origin main
npm install --legacy-peer-deps
npm run build

# PM2 재시작 (XPSwap만)
pm2 stop xpswap-api
pm2 start ecosystem.config.js --env production
pm2 save

# SignChain 서비스 배포 (예시)
cd /var/www/storage/signchain
git pull origin main
npm install --legacy-peer-deps
npm run build
pm2 restart signchain-api

# Apache 설정 검증
sudo apache2ctl configtest
sudo systemctl reload apache2

# 전체 서비스 상태 확인
pm2 list
systemctl status apache2
```

### 배포 순서 (중요)
1. **서비스 중단**: `pm2 stop service-name`
2. **코드 업데이트**: `git pull`
3. **의존성 설치**: `npm install --legacy-peer-deps`
4. **빌드**: `npm run build`
5. **서비스 시작**: `pm2 start ecosystem.config.js`
6. **상태 확인**: `pm2 logs service-name`
7. **Apache 재로드**: `sudo systemctl reload apache2`

### 배포 확인사항
- [ ] https://trendy.storydot.kr/xpswap/ 접속 확인
- [ ] https://trendy.storydot.kr/signchain/ 접속 확인 (해당되는 경우)
- [ ] 상단 암호화폐 티커 표시 확인
- [ ] 메뉴 네비게이션 작동 확인
- [ ] API 응답 확인 (/xpswap/api/health)
- [ ] 콘솔 에러 없음 확인
- [ ] 새로고침 시 정상 작동 확인
- [ ] 다른 서비스와 충돌 없음 확인

---

## 🐛 디버깅 및 테스트

### 디버깅 도구
- **API 테스트**: `client/public/debug.html`
- **서버 로그**: `pm2 logs xpswap-api`
- **브라우저 개발자 도구**: F12
- **멀티 서비스 모니터링**: `pm2 monit`

### 일반적인 문제 해결

#### 1. 포트 충돌 (EADDRINUSE)
```powershell
# Windows
netstat -ano | findstr :5000
taskkill /PID [프로세스ID] /F

# Linux 서버
lsof -i :5000
kill -9 [PID]

# PM2로 관리되는 경우
pm2 stop xpswap-api
pm2 delete xpswap-api
pm2 start ecosystem.config.js
```

#### 2. 멀티 서비스 API 호출 실패
```bash
# 서비스별 상태 확인
pm2 list
pm2 logs xpswap-api --lines 20
pm2 logs signchain-api --lines 20

# Apache 프록시 로그 확인
tail -f /var/log/apache2/error.log
tail -f /var/log/apache2/access.log

# 프록시 테스트
curl -v http://localhost:5000/xpswap/api/health
curl -v https://trendy.storydot.kr/xpswap/api/health
```

#### 3. Apache 프록시 설정 문제
```bash
# 설정 파일 구문 검사
sudo apache2ctl configtest

# 모듈 확인
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite

# 서비스 재시작
sudo systemctl restart apache2
```

#### 4. 서비스별 메모리 부족
```bash
# 메모리 사용량 확인
pm2 monit
free -h

# 메모리 제한 조정 (ecosystem.config.js)
max_memory_restart: '1G'  # 필요에 따라 증가

# 프로세스 재시작
pm2 restart xpswap-api
```

#### 5. 빌드 오류 (멀티 서비스)
```powershell
# 서비스별 독립적 빌드
cd /path/to/xpswap
npm run build

cd /path/to/signchain  
npm run build

# 의존성 충돌 해결
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

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
12. **멀티 서비스 아키텍처**: 독립적 프로세스 관리

### 🚧 진행 중인 작업
1. Mock 데이터 → 실제 블록체인 데이터 전환
2. 스마트 컨트랙트 배포
3. 프론트엔드 티커 표시 문제 해결
4. Apache RewriteRule 개선
5. SignChain과의 리소스 분리 최적화

### 🎯 우선순위 작업
1. **HIGH**: 프론트엔드 디버깅 (티커, 라우팅)
2. **HIGH**: 멀티 서비스 충돌 방지 검증
3. **MEDIUM**: 실제 블록체인 데이터 연동
4. **LOW**: UI/UX 개선 및 추가 기능

---

## 🔍 주요 도구 및 MCP 사용법

### Desktop Commander 사용
- **파일 작업**: `filesystem-mcp-official:read_file`, `write_file`, `edit_file`
- **프로세스 관리**: `desktop:execute_command`
- **API 테스트**: CMD 명령어를 통한 curl 실행

### SSH MCP 사용 (서버 관리)
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
1. **전체 서비스 다운**: Apache 재시작 → 모든 PM2 프로세스 재시작 → 서버 재부팅
2. **XPSwap만 다운**: `pm2 restart xpswap-api` → 로그 확인
3. **API 오류**: 서비스별 로그 확인 → 환경변수 점검 → DB 상태 확인
4. **프록시 오류**: Apache 설정 검증 → 프록시 모듈 확인

### 서비스별 백업 및 복구
```bash
# XPSwap 백업
cp -r /var/www/storage/xpswap /var/www/storage/xpswap_backup_$(date +%Y%m%d)

# SignChain 백업 (예시)
cp -r /var/www/storage/signchain /var/www/storage/signchain_backup_$(date +%Y%m%d)

# 롤백 (XPSwap)
pm2 stop xpswap-api
rm -rf /var/www/storage/xpswap
mv /var/www/storage/xpswap_backup_YYYYMMDD /var/www/storage/xpswap
pm2 start xpswap-api
```

### 서비스 독립성 확인
```bash
# XPSwap 독립 테스트
pm2 stop signchain-api  # 다른 서비스 중단
curl https://trendy.storydot.kr/xpswap/api/health  # XPSwap 정상 동작 확인

# SignChain 독립 테스트
pm2 stop xpswap-api     # XPSwap 중단
curl https://trendy.storydot.kr/signchain/api/health  # SignChain 정상 동작 확인

# 모든 서비스 재시작
pm2 restart all
```

---

## 📈 모니터링 및 로그

### 멀티 서비스 실시간 모니터링
```bash
# 전체 서비스 상태
pm2 monit

# 개별 서비스 로그
pm2 logs xpswap-api --lines 50 -f
pm2 logs signchain-api --lines 50 -f

# 시스템 리소스
htop
df -h
iostat 1  # I/O 모니터링
```

### 성능 지표 (멀티 서비스)
- **XPSwap 메모리**: ~115MB (안정적)
- **SignChain 메모리**: ~80MB (예상)
- **전체 Node.js 메모리**: ~200MB
- **API 응답 시간**: 2-4ms (캐싱 적용)
- **디스크 사용량**: 스토리지 13% (여유 충분)
- **캐시 히트율**: 95%+

### 알림 및 모니터링 자동화
```bash
# PM2 모니터링 대시보드 (선택사항)
pm2 install pm2-server-monit

# 로그 로테이션
pm2 install pm2-logrotate

# 이메일 알림 (프로세스 재시작 시)
pm2 install pm2-auto-pull
```

---

## 📋 체크리스트

### 일일 작업 전 체크리스트
- [ ] Git 상태 확인: `git status`
- [ ] 전체 서비스 상태: `pm2 list`
- [ ] XPSwap 서버 상태: `npm run dev:server`
- [ ] 포트 충돌 없음: `netstat -ano | findstr :5000`
- [ ] 의존성 업데이트: `npm audit`
- [ ] 환경변수 확인: `.env` 파일

### 멀티 서비스 작업 후 체크리스트
- [ ] XPSwap 로컬 테스트: 모든 페이지 정상 작동
- [ ] API 테스트: 주요 엔드포인트 응답 확인
- [ ] 다른 서비스 영향 없음: SignChain 등 정상 동작
- [ ] Apache 프록시 정상: 모든 경로 라우팅 확인
- [ ] Git 커밋: 변경사항 저장
- [ ] 문서 업데이트: `doc/progress/progress_{날짜}.md`
- [ ] 배포 (필요시): 빌드 → 서버 업로드 → PM2 재시작

### 서버 배포 전 체크리스트
- [ ] 로컬 빌드 성공: `npm run build`
- [ ] 모든 테스트 통과: `npm run test`
- [ ] 환경변수 확인: `.env.production`
- [ ] 백업 생성: 현재 서비스 상태 백업
- [ ] 의존성 검증: `npm audit --audit-level=high`

### 배포 후 검증 체크리스트
- [ ] https://trendy.storydot.kr/xpswap/ 접속 확인
- [ ] 모든 API 엔드포인트 응답 확인
- [ ] 다른 서비스 정상 동작 확인
- [ ] PM2 프로세스 안정성 확인 (5분간)
- [ ] 메모리 사용량 정상 범위 확인
- [ ] 브라우저 콘솔 에러 없음 확인

---

## 🎯 최종 목표

XPSwap은 **멀티 서비스 환경에서 안전하고 효율적인 DeFi 플랫폼**을 목표로 합니다:

1. **서비스 독립성**: 다른 서비스와 충돌 없는 안정적 운영
2. **사용자 친화적 UI/UX**: 빠른 응답과 직관적 인터페이스  
3. **실시간 시장 데이터**: 신뢰할 수 있는 블록체인 데이터
4. **고급 DeFi 기능**: 전문가 수준의 거래 도구
5. **최고 수준의 보안**: 멀티 레이어 보안 시스템
6. **멀티체인 지원**: 확장 가능한 블록체인 생태계
7. **확장성**: 미래 서비스 추가에 대한 준비

---

## 📚 참고 문서

- **작업 일지**: `doc/CLAUDE.md`
- **진행 상황**: `doc/progress/` 디렉토리
- **스마트 컨트랙트**: `doc/SMART_CONTRACT_DEPLOYMENT.md`
- **API 문서**: `doc/API_DOCUMENTATION.md`
- **보안 가이드**: `doc/SECURITY_GUIDE.md`
- **멀티 서비스 아키텍처**: 이 문서의 서버 구성 섹션

---

## 🔄 변경 이력

### v2.1 (2025-08-02)
- 멀티 서비스 환경 설정 추가
- PM2 프로세스 관리 가이드
- Apache 프록시 설정 상세화
- 포트 분리 및 충돌 방지 가이드
- 서비스별 백업/복구 절차
- 독립성 테스트 체크리스트

### v2.0 (2025-08-01)
- 기본 통합 지침서 작성
- Xphere RPC URL 업데이트
- PWA 및 에러 핸들링 추가
- 실제 블록체인 서비스 통합

---

*이 지침서는 멀티 서비스 환경에서 XPSwap 프로젝트의 모든 개발 작업에 대한 종합적인 가이드입니다. 지속적으로 업데이트하며 최신 상태를 유지합니다.*

**📞 프로젝트 문의**: GitHub Issues를 통해 제출해주세요.
**🔗 저장소**: https://github.com/loganko83/xpswapmcp
**📅 최종 업데이트**: 2025년 8월 2일
