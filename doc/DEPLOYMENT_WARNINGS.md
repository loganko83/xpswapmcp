# XPSwap 서버 배포 주의사항 및 체크리스트

## 🚨 가장 중요한 주의사항

### ⚠️ API 경로 하드코딩 절대 금지!

**문제가 되는 코드 패턴들:**
```javascript
// ❌ 절대 하지 말 것
fetch("/api/crypto-ticker")
fetch("http://localhost:5000/api/health")
fetch("/xpswap/api/pools")
axios.get("/api/swap/quote")

// ✅ 반드시 이렇게 할 것
fetch(getApiUrl("api/crypto-ticker"))
fetch(getApiUrl("api/health"))
fetch(getApiUrl("api/pools"))
axios.get(getApiUrl("api/swap/quote"))
```

### 🔍 배포 전 필수 검사 명령어

```powershell
# Windows에서 하드코딩 검색
findstr /S /R "\"\/api\/" client/src/
findstr /S /R "fetch.*\/api" client/src/
findstr /S /R "axios.*\/api" client/src/

# Linux/Mac에서 하드코딩 검색
grep -r '"/api/' client/src/
grep -r "fetch.*'/api" client/src/
grep -r "axios.*'/api" client/src/
```

## 📋 배포 체크리스트

### 1. 배포 전 검증
- [ ] 모든 API 호출에서 `getApiUrl()` 사용 확인
- [ ] 하드코딩된 경로 전체 검색 및 제거
- [ ] 개발 서버에서 정상 작동 테스트
- [ ] 빌드 에러 없는지 확인 (`npm run build`)
- [ ] Console 에러 없는지 브라우저 확인

### 2. 환경 설정 확인
```bash
# .env (개발환경)
NODE_ENV=development
PORT=5000
BASE_PATH=

# .env.production (프로덕션)
NODE_ENV=production
PORT=5000
BASE_PATH=/xpswap
```

### 3. 서버 배포 절차
```bash
# 1. 로컬에서 커밋 및 푸시
git add .
git commit -m "fix: 배포 메시지"
git push origin main

# 2. 서버에서 업데이트
cd /var/www/storage/xpswap
git pull origin main
npm run build

# 3. 서비스 재시작
pm2 restart xpswap-api

# 4. 상태 확인
pm2 status
```

### 4. 배포 후 필수 테스트
```bash
# API 상태 확인
curl https://trendy.storydot.kr/xpswap/api/health
curl https://trendy.storydot.kr/xpswap/api/crypto-ticker
curl https://trendy.storydot.kr/xpswap/api/liquidity/pools

# 로그 확인
pm2 logs xpswap-api --lines 20
```

## 🔧 자주 발생하는 문제들

### 1. 티커가 안 보이는 경우
**원인**: CryptoTicker.tsx에서 API 경로 하드코딩
**해결**: `fetch(getApiUrl("api/crypto-ticker"))` 사용

### 2. Swap 페이지 토큰 잔액 안 나옴
**원인**: swap.tsx에서 API 호출 경로 문제
**해결**: 모든 API 호출에 getApiUrl() 적용

### 3. DeFi 기능 모달 안 열림
**원인**: pool.tsx, farm.tsx API 경로 문제
**해결**: 버튼 이벤트와 API 호출 모두 getApiUrl() 사용

### 4. 404 에러 발생
**원인**: Apache 프록시 설정과 API 경로 불일치
**해결**: `/xpswap/api/*` 경로 확인

## 🚨 긴급 롤백 절차

문제 발생 시 즉시 실행:
```bash
cd /var/www/storage/xpswap

# 최근 커밋 확인
git log --oneline -5

# 이전 버전으로 롤백
git reset --hard HEAD~1

# 빌드 및 재시작
npm run build
pm2 restart xpswap-api

# 상태 확인
curl https://trendy.storydot.kr/xpswap/api/health
```

## 📊 성능 모니터링

### PM2 모니터링
```bash
pm2 monit           # 실시간 모니터링
pm2 status          # 프로세스 상태
pm2 logs --lines 50 # 최근 로그
```

### API 응답 시간 체크
```bash
curl -w "%{time_total}\n" -o /dev/null -s https://trendy.storydot.kr/xpswap/api/health
```

### 메모리 사용량 확인
```bash
free -h
df -h
```

## 🎯 개발팀 규칙

1. **API 호출 시 반드시 getApiUrl() 사용**
2. **배포 전 하드코딩 검색 필수**
3. **개발 서버에서 충분히 테스트 후 배포**
4. **배포 후 즉시 API 테스트 수행**
5. **문제 발생 시 즉시 롤백 후 수정**

---

**⚠️ 기억하세요**: 하드코딩된 API 경로 하나 때문에 전체 서비스가 마비될 수 있습니다!
