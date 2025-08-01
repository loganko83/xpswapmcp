# 🔧 XPSwap 프로젝트 - 종합 디버깅 가이드 (v1.0)
# 작성일: 2025년 8월 2일

## 📋 개요

이 문서는 XPSwap 프로젝트 개발 중 발생할 수 있는 **모든 문제와 해결책**을 체계적으로 정리한 종합 디버깅 가이드입니다.

### 🚨 긴급 문제 발생 시 우선순위
1. **CRITICAL**: 프로덕션 서버 다운 → [서버 장애 대응](#서버-장애-대응)
2. **HIGH**: React 앱 로딩 실패 → [React 청크 분리 문제](#react-청크-분리-문제)
3. **MEDIUM**: API 호출 실패 → [API 문제 해결](#api-문제-해결)
4. **LOW**: UI/UX 버그 → [프론트엔드 문제](#프론트엔드-문제)

---

## 🏗️ 개발 환경 문제

### 포트 충돌 (EADDRINUSE)

**증상**: `Error: listen EADDRINUSE: address already in use :::5000`

**진단**:
```powershell
# 포트 사용 확인
netstat -ano | findstr :5000
netstat -ano | findstr :5173
```

**해결방법**:
```powershell
# 방법 1: 프로세스 종료
taskkill /PID [프로세스ID] /F

# 방법 2: 다른 포트 사용
# .env 파일에서 PORT=5001 변경

# 방법 3: 모든 Node.js 프로세스 종료
taskkill /f /im node.exe
```

**예방책**:
- 작업 종료 시 항상 `Ctrl+C`로 서버 정상 종료
- 여러 터미널 창 사용 시 각각 종료 확인

---

### 의존성 설치 문제

**증상**: `npm install` 실패, peer dependency 경고

**진단**:
```powershell
# Node.js 버전 확인
node --version  # v18+ 권장

# 패키지 정합성 확인
npm audit
npm ls --depth=0
```

**해결방법**:
```powershell
# 방법 1: 완전 재설치
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# 방법 2: 캐시 클리어
npm cache clean --force
npm install

# 방법 3: 권한 문제 (Windows)
# PowerShell을 관리자 권한으로 실행
```

**특별 주의사항**:
- **서버 환경**에서는 반드시 `--legacy-peer-deps` 옵션 사용
- **로컬 개발**에서는 일반 `npm install` 가능

---

### TypeScript 컴파일 오류

**증상**: `tsc` 빌드 실패, 타입 오류

**진단**:
```powershell
# 타입 체크만 실행
npx tsc --noEmit

# 상세 오류 확인
npx tsc --noEmit --pretty
```

**해결방법**:
```typescript
// 방법 1: 타입 단언 사용
const element = document.getElementById('app') as HTMLElement;

// 방법 2: 옵셔널 체이닝
const value = data?.property?.value;

// 방법 3: 타입 가드
if (typeof value === 'string') {
  // value는 여기서 string 타입
}
```

**일반적인 타입 오류**:
- `Property 'xxx' does not exist on type 'Window'` → `declare global` 사용
- `Cannot find module 'xxx'` → `@types/xxx` 설치 또는 `.d.ts` 파일 생성

---

## 🖥️ 서버 문제

### Express 서버 시작 실패

**증상**: 서버가 시작되지 않거나 즉시 종료

**진단**:
```powershell
# 서버 로그 확인
npm run dev:server

# 환경변수 확인
echo $env:NODE_ENV
echo $env:PORT
echo $env:DATABASE_URL
```

**해결방법**:
```powershell
# 방법 1: 환경변수 재설정
cp .env.example .env
# .env 파일 내용 수정

# 방법 2: 데이터베이스 초기화
rm test.db
npm run dev:server  # 자동 재생성

# 방법 3: 모듈 경로 문제
# server/index.ts의 import 경로 확인
```

**체크포인트**:
- [ ] `.env` 파일 존재 확인
- [ ] `DATABASE_URL`, `PORT`, `NODE_ENV` 설정 확인
- [ ] SQLite 파일 권한 확인
- [ ] `server/db.ts` 정상 import 확인

---

### API 문제 해결

**증상**: API 호출 시 404, 500 오류 또는 CORS 에러

**진단**:
```powershell
# API 상태 확인
curl http://localhost:5000/xpswap/api/health
curl https://trendy.storydot.kr/xpswap/api/health

# CORS 에러 확인 (브라우저 콘솔)
# Access to fetch at 'xxx' from origin 'yyy' has been blocked by CORS policy
```

**해결방법**:
```javascript
// server/index.ts - CORS 설정 확인
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://trendy.storydot.kr'] 
    : ['http://localhost:5173', 'http://localhost:5195'],
  credentials: true
}));
```

**API 엔드포인트별 테스트**:
```powershell
# 기본 상태 확인
curl -X GET http://localhost:5000/xpswap/api/health

# 가격 데이터 확인
curl -X GET http://localhost:5000/xpswap/api/xp-price

# POST 요청 테스트
curl -X POST http://localhost:5000/xpswap/api/swap/quote \
  -H "Content-Type: application/json" \
  -d '{"fromToken":"XP","toToken":"XPS","amount":"100"}'
```

**일반적인 API 오류**:
- **404**: 라우트 경로 불일치 → `server/routes.ts` 확인
- **500**: 서버 내부 오류 → 로그 확인, DB 연결 상태 점검
- **CORS**: 도메인 허용 설정 → `cors` 미들웨어 설정 확인

---

### 데이터베이스 문제

**증상**: SQLite 연결 실패, 데이터 조회 오류

**진단**:
```powershell
# DB 파일 존재 확인
ls test.db

# DB 구조 확인 (SQLite CLI 필요)
sqlite3 test.db ".schema"
sqlite3 test.db "SELECT name FROM sqlite_master WHERE type='table';"
```

**해결방법**:
```powershell
# 방법 1: DB 재생성
rm test.db
npm run dev:server  # 자동으로 테이블 생성

# 방법 2: 스키마 확인
# server/db.ts 파일에서 테이블 생성 쿼리 확인

# 방법 3: 권한 문제
# Windows에서 파일 권한 확인
icacls test.db
```

**DB 스키마 검증**:
```sql
-- 필수 테이블 존재 확인
SELECT name FROM sqlite_master WHERE type='table';

-- 예상 테이블: transactions, pools, farms, users 등
```

---

## ⚛️ React 프론트엔드 문제

### React 청크 분리 문제 (중요!)

**증상**: 
- 프로덕션에서 화면이 하얗게 표시
- `TypeError: Cannot set properties of undefined (setting 'Children')` 에러
- React 컴포넌트가 렌더링되지 않음

**진단**:
```javascript
// 브라우저 콘솔에서 확인
console.error('React 인스턴스:', React);
console.error('React DOM:', ReactDOM);

// 네트워크 탭에서 청크 파일 로딩 확인
// react-core-xxx.js 파일이 로드되는지 확인
```

**해결방법**:
```typescript
// vite.config.ts - 필수 설정
export default defineConfig({
  resolve: {
    // 가장 중요: React 중복 인스턴스 방지
    dedupe: ['react', 'react-dom', 'react/jsx-runtime']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 핵심을 별도 청크로 안전하게 분리
          'react-core': ['react', 'react-dom', 'react/jsx-runtime'],
          'react-router': ['wouter'],
          'ui-components': ['lucide-react'],
          'charts': ['lightweight-charts', 'recharts'],
          'web3': ['ethers', 'web3', '@lifi/sdk'],
          'vendor': ['framer-motion', '@tanstack/react-query'],
        },
      },
    },
    minify: 'esbuild', // terser 대신 esbuild 사용
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime'],
    force: true,
  },
});
```

**체크포인트**:
- [ ] `dedupe` 설정이 올바른가?
- [ ] React 관련 라이브러리가 다른 청크에 분리되어 있지 않은가?
- [ ] 로컬과 서버의 `vite.config.ts`가 동일한가?
- [ ] 빌드 후 `react-core-xxx.js` 파일이 생성되는가?

**예방책**:
- 새로운 React 의존성 라이브러리 추가 시 청크 분할 전략 검토
- 배포 전 반드시 로컬에서 `npm run build` 테스트

---

### 컴포넌트 렌더링 문제

**증상**: 컴포넌트가 렌더링되지 않거나 에러 발생

**진단**:
```jsx
// React DevTools 사용
// Components 탭에서 컴포넌트 트리 확인

// ErrorBoundary로 에러 캐치
// client/src/components/ErrorBoundary.tsx 확인
```

**해결방법**:
```jsx
// 방법 1: 조건부 렌더링 추가
{data && data.length > 0 && (
  <ComponentName data={data} />
)}

// 방법 2: 기본값 설정
const MyComponent = ({ data = [] }) => {
  return <div>{data.map(...)}</div>;
};

// 방법 3: ErrorBoundary 활용
<ErrorBoundary>
  <ProblematicComponent />
</ErrorBoundary>
```

**일반적인 렌더링 오류**:
- `Cannot read property 'map' of undefined` → 데이터 존재 여부 확인
- `Objects are not valid as a React child` → 객체를 직접 렌더링하지 말고 속성 접근
- `Each child in a list should have a unique "key" prop` → map 사용 시 key 추가

---

### 상태 관리 문제

**증상**: 상태가 업데이트되지 않거나 예상과 다르게 동작

**진단**:
```jsx
// React DevTools의 Profiler 사용
// 상태 변화 추적

// 콘솔 로그로 상태 확인
useEffect(() => {
  console.log('State changed:', state);
}, [state]);
```

**해결방법**:
```jsx
// 방법 1: 의존성 배열 확인
useEffect(() => {
  fetchData();
}, [dependency]); // dependency 누락 주의

// 방법 2: 상태 업데이트 패턴
// 잘못된 예
setState(state.value + 1);

// 올바른 예
setState(prev => prev + 1);

// 방법 3: WalletContext 사용
const { walletAddress, connectWallet } = useWallet();
```

---

### 라우팅 문제 (Wouter)

**증상**: 페이지 이동이 되지 않거나 404 오류

**진단**:
```jsx
// client/src/App.tsx에서 라우트 정의 확인
import { Route, Switch } from 'wouter';

// 브라우저 주소창에서 경로 확인
// /xpswap/dashboard → 정상
// /dashboard → 비정상 (BASE_PATH 누락)
```

**해결방법**:
```jsx
// App.tsx - 라우트 설정 확인
<Switch>
  <Route path="/dashboard" component={Dashboard} />
  <Route path="/swap" component={Swap} />
  <Route>
    <NotFound />
  </Route>
</Switch>

// 링크 사용 시
import { Link } from 'wouter';
<Link href="/dashboard">Dashboard</Link>
```

**BASE_PATH 설정 확인**:
- 프로덕션: `/xpswap/dashboard`
- 개발: `/dashboard`

---

## 🌐 웹3 및 블록체인 문제

### 지갑 연결 문제

**증상**: MetaMask 연결 실패, 지갑 상태 유지 안됨

**진단**:
```javascript
// 브라우저 콘솔에서 확인
console.log('Ethereum object:', window.ethereum);
console.log('MetaMask installed:', typeof window.ethereum !== 'undefined');

// WalletContext 상태 확인
const { walletAddress, isConnected } = useWallet();
console.log('Wallet state:', { walletAddress, isConnected });
```

**해결방법**:
```javascript
// client/src/lib/metamask.ts - 연결 로직 확인
export const connectWallet = async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      return accounts[0];
    } catch (error) {
      console.error('지갑 연결 실패:', error);
      throw error;
    }
  } else {
    throw new Error('MetaMask가 설치되지 않았습니다.');
  }
};
```

**네트워크 추가**:
```javascript
// Xphere 네트워크 추가
const addXphereNetwork = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x...', // Xphere Chain ID
        chainName: 'Xphere Network',
        rpcUrls: ['https://www.ankr.com/rpc/xphere/'],
        nativeCurrency: {
          name: 'XP',
          symbol: 'XP',
          decimals: 18
        }
      }]
    });
  } catch (error) {
    console.error('네트워크 추가 실패:', error);
  }
};
```

---

### RPC 연결 문제

**증상**: 블록체인 데이터 조회 실패, RPC 호출 에러

**진단**:
```javascript
// RPC URL 확인
console.log('RPC URL:', process.env.XPHERE_RPC_URL);

// Web3 연결 테스트
import { ethers } from 'ethers';
const provider = new ethers.JsonRpcProvider('https://www.ankr.com/rpc/xphere/');
try {
  const blockNumber = await provider.getBlockNumber();
  console.log('Current block:', blockNumber);
} catch (error) {
  console.error('RPC 연결 실패:', error);
}
```

**해결방법**:
```javascript
// 방법 1: RPC URL 업데이트
// .env 파일에서 XPHERE_RPC_URL 확인
XPHERE_RPC_URL=https://www.ankr.com/rpc/xphere/

// 방법 2: 대체 RPC 사용
const RPC_URLS = [
  'https://www.ankr.com/rpc/xphere/',
  'https://backup-rpc-url.com/xphere/', // 백업 URL
];

// 방법 3: 재시도 로직 구현
const retryRpcCall = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

---

### 스마트 컨트랙트 호출 문제

**증상**: 컨트랙트 함수 호출 실패, 가스 추정 오류

**진단**:
```javascript
// ABI 확인
console.log('DEX ABI:', dexAbi);
console.log('Token ABI:', tokenAbi);

// 컨트랙트 주소 확인
console.log('Contract addresses:', {
  DEX_CONTRACT: process.env.DEX_CONTRACT_ADDRESS,
  XP_TOKEN: process.env.XP_TOKEN_ADDRESS
});
```

**해결방법**:
```javascript
// server/services/realBlockchain.js
import { ethers } from 'ethers';

const getContract = (address, abi) => {
  const provider = new ethers.JsonRpcProvider(process.env.XPHERE_RPC_URL);
  return new ethers.Contract(address, abi, provider);
};

// 에러 핸들링 강화
const callContract = async (contract, method, params = []) => {
  try {
    const result = await contract[method](...params);
    return result;
  } catch (error) {
    console.error(`Contract call failed: ${method}`, error);
    throw new Error(`스마트 컨트랙트 호출 실패: ${error.message}`);
  }
};
```

---

## 🚀 배포 및 프로덕션 문제

### 서버 장애 대응

**증상**: 프로덕션 사이트 접속 불가, 500 에러

**긴급 대응 절차**:
```bash
# 1. SSH 접속
ssh ubuntu@trendy.storydot.kr

# 2. PM2 상태 확인
pm2 list
pm2 logs xpswap-api --lines 50

# 3. 프로세스 재시작
pm2 restart xpswap-api

# 4. Apache 상태 확인
sudo systemctl status apache2
sudo systemctl restart apache2

# 5. 시스템 리소스 확인
htop
df -h
free -h
```

**로그 분석**:
```bash
# PM2 로그
pm2 logs xpswap-api --lines 100 --timestamp

# Apache 로그
sudo tail -f /var/log/apache2/error.log
sudo tail -f /var/log/apache2/access.log

# 시스템 로그
sudo journalctl -u apache2 -f
```

**일반적인 서버 장애 원인**:
- **메모리 부족**: PM2 프로세스 재시작으로 해결
- **디스크 공간 부족**: 로그 파일 정리, 불필요한 파일 삭제
- **포트 충돌**: netstat으로 포트 사용 상황 확인
- **Apache 설정 오류**: 설정 파일 구문 검사

---

### 빌드 배포 문제

**증상**: 배포 후 사이트가 정상 작동하지 않음

**체크리스트**:
```bash
# 1. 빌드 파일 확인
ls -la /var/www/storage/xpswap/client/dist/
# index.html, assets/ 디렉토리 존재 확인

# 2. Apache 설정 확인
sudo apache2ctl configtest
# Syntax OK 메시지 확인

# 3. 권한 확인
sudo chown -R www-data:www-data /var/www/storage/xpswap/client/dist/
sudo chmod -R 755 /var/www/storage/xpswap/client/dist/

# 4. 캐시 문제
# 브라우저에서 Ctrl+F5로 강제 새로고침
```

**배포 스크립트 예시**:
```bash
#!/bin/bash
# deploy.sh

echo "🚀 XPSwap 배포 시작..."

# Git 업데이트
git pull origin main

# 의존성 설치
npm install --legacy-peer-deps

# 빌드
npm run build

# PM2 재시작
pm2 restart xpswap-api

# Apache 재시작
sudo systemctl reload apache2

echo "✅ 배포 완료!"

# 상태 확인
pm2 list
curl -s https://trendy.storydot.kr/xpswap/api/health
```

---

### Apache 설정 문제

**증상**: 라우팅이 작동하지 않거나 API 프록시 실패

**진단**:
```bash
# Apache 설정 테스트
sudo apache2ctl configtest

# 모듈 확인
sudo apache2ctl -M | grep rewrite
sudo apache2ctl -M | grep proxy
```

**설정 검증**:
```apache
# /etc/apache2/sites-available/xpswap.conf

# 올바른 순서: API Proxy가 Alias보다 먼저 와야 함
ProxyPass /xpswap/api http://localhost:5000/xpswap/api
ProxyPassReverse /xpswap/api http://localhost:5000/xpswap/api

# 정적 파일 서빙
Alias /xpswap /var/www/storage/xpswap/client/dist

<Directory /var/www/storage/xpswap/client/dist>
    # React Router 지원을 위한 RewriteRule
    RewriteEngine On
    RewriteBase /xpswap
    
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^.*$ /xpswap/index.html [L]
</Directory>
```

**모듈 활성화**:
```bash
sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo systemctl restart apache2
```

---

## 📊 성능 및 최적화 문제

### 느린 API 응답

**증상**: API 호출이 오래 걸리거나 타임아웃 발생

**진단**:
```javascript
// API 응답 시간 측정
const measureApiTime = async (url) => {
  const start = performance.now();
  try {
    const response = await fetch(url);
    const end = performance.now();
    console.log(`API ${url}: ${end - start}ms`);
    return response;
  } catch (error) {
    console.error(`API ${url} failed:`, error);
  }
};
```

**해결방법**:
```javascript
// server/routes.ts - 캐싱 적용
const cache = new Map();
const CACHE_TTL = 60000; // 60초

app.get('/api/xp-price', (req, res) => {
  const cacheKey = 'xp-price';
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }
  
  // 데이터 fetch 로직
  const data = fetchXpPrice();
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  res.json(data);
});
```

**데이터베이스 최적화**:
```sql
-- 인덱스 추가
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX idx_pools_token_pair ON pools(token0, token1);

-- 쿼리 최적화
EXPLAIN QUERY PLAN SELECT * FROM transactions WHERE timestamp > ?;
```

---

### 메모리 누수

**증상**: 시간이 지날수록 메모리 사용량 증가, 서버 성능 저하

**진단**:
```bash
# PM2 모니터링
pm2 monit

# Node.js 힙 덤프 생성
kill -USR2 [PID]
```

**해결방법**:
```javascript
// 이벤트 리스너 정리
useEffect(() => {
  const handleResize = () => { /* ... */ };
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

// 타이머 정리
useEffect(() => {
  const interval = setInterval(() => { /* ... */ }, 1000);
  
  return () => {
    clearInterval(interval);
  };
}, []);

// HTTP 요청 취소
useEffect(() => {
  const controller = new AbortController();
  
  fetch('/api/data', { signal: controller.signal })
    .then(response => response.json())
    .then(data => setData(data));
  
  return () => {
    controller.abort();
  };
}, []);
```

---

## 🔍 디버깅 도구 및 기법

### 로컬 디버깅 도구

**브라우저 개발자 도구**:
- **Console**: 에러 메시지, 로그 확인
- **Network**: API 호출 상태, 응답 시간 확인
- **Application**: Service Worker, 캐시 상태 확인
- **Performance**: 렌더링 성능 분석

**React DevTools**:
- **Components**: 컴포넌트 트리, Props 확인
- **Profiler**: 렌더링 성능 측정

**API 테스트 도구**:
```html
<!-- client/public/debug.html -->
<!DOCTYPE html>
<html>
<head>
    <title>XPSwap API Debug</title>
</head>
<body>
    <script>
        const testApis = async () => {
            const endpoints = [
                '/xpswap/api/health',
                '/xpswap/api/xp-price',
                '/xpswap/api/crypto-ticker'
            ];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(endpoint);
                    console.log(`${endpoint}:`, await response.json());
                } catch (error) {
                    console.error(`${endpoint} failed:`, error);
                }
            }
        };
        
        testApis();
    </script>
</body>
</html>
```

---

### 서버 모니터링

**PM2 모니터링**:
```bash
# 실시간 모니터링
pm2 monit

# 로그 스트리밍
pm2 logs xpswap-api --lines 50 --timestamp

# 메모리/CPU 사용량
pm2 show xpswap-api
```

**시스템 모니터링**:
```bash
# 리소스 사용량
htop
iotop  # 디스크 I/O
nethogs  # 네트워크 사용량

# 디스크 사용량
df -h
du -sh /var/www/storage/xpswap/

# 프로세스 확인
ps aux | grep node
netstat -tulpn | grep :5000
```

---

### 로그 분석 기법

**구조화된 로깅**:
```javascript
// server/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console()
  ]
});

// 사용 예시
logger.info('API 호출', { endpoint: '/api/xp-price', duration: 45 });
logger.error('에러 발생', { error: error.message, stack: error.stack });
```

**로그 검색 및 분석**:
```bash
# 특정 에러 검색
grep -n "ERROR" /var/log/xpswap/combined.log

# 특정 시간대 로그
awk '/2025-08-02 10:00:00/,/2025-08-02 11:00:00/' combined.log

# API 응답 시간 분석
grep "API 호출" combined.log | grep -o "duration: [0-9]*" | sort -n
```

---

## 📋 문제별 빠른 해결 체크리스트

### 🚨 긴급 상황 (프로덕션 다운)
- [ ] SSH 접속 (`ssh ubuntu@trendy.storydot.kr`)
- [ ] PM2 상태 확인 (`pm2 list`)
- [ ] 프로세스 재시작 (`pm2 restart xpswap-api`)
- [ ] Apache 상태 확인 (`sudo systemctl status apache2`)
- [ ] 로그 확인 (`pm2 logs xpswap-api --lines 50`)

### ⚛️ React 앱 로딩 실패
- [ ] 브라우저 콘솔에서 에러 확인
- [ ] `vite.config.ts`의 `dedupe` 설정 확인
- [ ] React 청크 파일 로딩 상태 확인 (`react-core-xxx.js`)
- [ ] 로컬에서 빌드 테스트 (`npm run build`)
- [ ] ErrorBoundary 로그 확인

### 🔗 API 호출 실패
- [ ] 서버 실행 상태 확인 (`npm run dev:server`)
- [ ] API 엔드포인트 테스트 (`curl http://localhost:5000/xpswap/api/health`)
- [ ] CORS 설정 확인 (브라우저 콘솔)
- [ ] 네트워크 탭에서 요청/응답 확인
- [ ] 환경변수 설정 확인 (`.env` 파일)

### 💾 데이터베이스 문제
- [ ] DB 파일 존재 확인 (`ls test.db`)
- [ ] DB 재생성 (`rm test.db ; npm run dev:server`)
- [ ] 스키마 확인 (`sqlite3 test.db ".schema"`)
- [ ] 권한 확인 (`icacls test.db`)

### 🌐 지갑/Web3 연결 문제
- [ ] MetaMask 설치 확인 (`window.ethereum`)
- [ ] 네트워크 설정 확인 (Xphere)
- [ ] RPC URL 확인 (`https://www.ankr.com/rpc/xphere/`)
- [ ] WalletContext 상태 확인
- [ ] 브라우저 콘솔에서 지갑 관련 에러 확인

---

## 🚀 예방적 유지보수

### 일일 점검 사항
```bash
#!/bin/bash
# daily_check.sh

echo "📊 XPSwap 일일 점검 리포트"
date

# 서버 상태
echo "🖥️ 서버 상태:"
pm2 list

# 디스크 사용량
echo "💾 디스크 사용량:"
df -h

# 메모리 사용량
echo "🧠 메모리 사용량:"
free -h

# API 상태 테스트
echo "🔗 API 상태:"
curl -s https://trendy.storydot.kr/xpswap/api/health

# 최근 에러 로그
echo "❌ 최근 에러 (10건):"
pm2 logs xpswap-api --lines 10 --nostream | grep -i error

echo "✅ 점검 완료"
```

### 주간 유지보수
- [ ] 의존성 업데이트 확인 (`npm audit`)
- [ ] 로그 파일 정리
- [ ] 데이터베이스 백업
- [ ] 성능 지표 검토
- [ ] 보안 업데이트 확인

### 월간 유지보수
- [ ] 시스템 업데이트
- [ ] SSL 인증서 갱신 확인
- [ ] 백업 복구 테스트
- [ ] 모니터링 대시보드 검토
- [ ] 문서 업데이트

---

## 📞 지원 및 문의

### 문제 보고 시 포함할 정보
1. **환경 정보**: OS, Node.js 버전, 브라우저
2. **재현 단계**: 문제가 발생하는 정확한 단계
3. **에러 메시지**: 콘솔, 로그의 전체 에러 메시지
4. **예상 결과**: 어떤 결과를 기대했는지
5. **실제 결과**: 실제로 발생한 현상

### 로그 수집 방법
```bash
# 종합 로그 수집 스크립트
#!/bin/bash
# collect_logs.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="debug_logs_$TIMESTAMP"
mkdir -p $LOG_DIR

# PM2 로그
pm2 logs xpswap-api --lines 100 --nostream > $LOG_DIR/pm2.log

# 시스템 정보
uname -a > $LOG_DIR/system_info.txt
npm version > $LOG_DIR/npm_versions.txt
node --version > $LOG_DIR/node_version.txt

# 프로세스 상태
pm2 list > $LOG_DIR/pm2_status.txt
ps aux | grep node > $LOG_DIR/node_processes.txt

# Apache 로그 (권한이 있는 경우)
sudo tail -100 /var/log/apache2/error.log > $LOG_DIR/apache_error.log 2>/dev/null

# 압축
tar -czf debug_logs_$TIMESTAMP.tar.gz $LOG_DIR/
rm -rf $LOG_DIR

echo "✅ 로그 수집 완료: debug_logs_$TIMESTAMP.tar.gz"
```

---

**📅 최종 업데이트**: 2025년 8월 2일
**📧 문의**: GitHub Issues를 통해 제출해주세요.
**🔗 저장소**: https://github.com/loganko83/xpswapmcp

---

*이 디버깅 가이드는 XPSwap 프로젝트의 모든 문제 상황에 대한 체계적인 해결책을 제공합니다. 지속적으로 업데이트하며 새로운 문제와 해결책을 추가합니다.*
