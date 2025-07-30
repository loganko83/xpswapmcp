# XPSwap 티커 문제 디버깅 - 2025년 7월 31일

## 📅 작업 개요
- **작업자**: Claude
- **날짜**: 2025년 7월 31일
- **시간**: 오후 5:15
- **주요 목표**: 서버에서 암호화폐 티커가 표시되지 않는 문제 디버깅

## 🔍 현재 상황 분석

### 1. 로컬 환경 테스트 결과
- **API 엔드포인트**: `http://localhost:5000/api/crypto-ticker`
- **테스트 결과**: ✅ 정상 작동
- **응답 데이터**: 
  ```json
  {
    "tickers": [
      {"id":"bitcoin","symbol":"BTC","price":96420,"change24h":1.2},
      {"id":"ethereum","symbol":"ETH","price":3340,"change24h":2.1},
      {"id":"xphere","symbol":"XP","price":0.014134,"change24h":-0.80}
      // ... 기타 암호화폐
    ]
  }
  ```

### 2. 코드 분석 결과

#### API URL 설정 (`client/src/lib/apiUrl.ts`)
```typescript
export const API_BASE_URL = import.meta.env.PROD 
  ? '/xpswap/api'  // 프로덕션: 상대 경로
  : 'http://localhost:5000/api';  // 개발: 절대 경로
```
- 프로덕션에서는 `/xpswap/api` 경로 사용
- 개발에서는 `http://localhost:5000/api` 사용

#### 티커 컴포넌트 (`client/src/components/CryptoTicker.tsx`)
- `getApiUrl("api/crypto-ticker")` 호출
- 15초마다 자동 업데이트
- React Query 사용

#### 서버 API (`server/routes/trading.ts`)
- 엔드포인트: `/api/crypto-ticker`
- CoinMarketCap API 연동 (XP 가격)
- 다른 암호화폐는 Mock 데이터 사용

## 🐛 문제 원인 추정

### 가능성 1: Apache 프록시 설정 누락
서버의 Apache 설정에서 `/xpswap/api` 경로가 `localhost:5000/api`로 프록시되지 않을 가능성이 높습니다.

**필요한 설정**:
```apache
ProxyPass /xpswap/api http://localhost:5000/api
ProxyPassReverse /xpswap/api http://localhost:5000/api
```

### 가능성 2: CORS 문제
프록시 설정이 있더라도 CORS 헤더가 누락되었을 수 있습니다.

### 가능성 3: PM2 프로세스 문제
서버에서 PM2 프로세스가 정상 작동하지 않을 수 있습니다.

## 🛠️ 해결 방안

### Step 1: 브라우저에서 직접 API 테스트
1. https://trendy.storydot.kr/xpswap/api/crypto-ticker 접속
2. 응답 확인
3. 개발자 도구 > Network 탭에서 요청 상태 확인

### Step 2: SSH 접속하여 서버 확인
```bash
# SSH 접속
ssh ubuntu@trendy.storydot.kr

# PM2 상태 확인
pm2 list
pm2 logs xpswap-api --lines 50

# 로컬에서 API 테스트
curl http://localhost:5000/api/crypto-ticker

# Apache 설정 확인
sudo cat /etc/apache2/sites-available/000-default-le-ssl.conf | grep -A 10 -B 10 xpswap
```

### Step 3: Apache 설정 수정 (필요시)
```bash
# Apache 설정 편집
sudo nano /etc/apache2/sites-available/000-default-le-ssl.conf

# 다음 내용 추가 (VirtualHost 443 블록 내부)
ProxyPass /xpswap/api http://localhost:5000/api
ProxyPassReverse /xpswap/api http://localhost:5000/api
ProxyPreserveHost On

<Location /xpswap/api>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</Location>

# Apache 재시작
sudo systemctl restart apache2
```

## 📊 테스트 결과 기록

### 로컬 환경
- ✅ 개발 서버 정상 작동
- ✅ API 응답 정상
- ✅ 티커 컴포넌트 정상 표시

### 서버 환경
- ❓ API 직접 접근 테스트 필요
- ❓ Apache 프록시 설정 확인 필요
- ❓ PM2 프로세스 상태 확인 필요

## 🎯 다음 단계

1. **즉시 확인**: 브라우저에서 https://trendy.storydot.kr/xpswap/api/crypto-ticker 테스트
2. **서버 접속**: SSH로 서버 접속하여 설정 확인
3. **설정 수정**: 필요시 Apache 프록시 설정 추가
4. **재배포**: 설정 변경 후 서비스 재시작

## 💡 참고 사항

- 서버 빌드 파일은 이미 최신 상태
- 로컬에서는 모든 기능이 정상 작동
- 프록시 설정만 추가하면 해결될 가능성이 높음

---

*디버깅 진행 상황은 계속 업데이트됩니다.*
