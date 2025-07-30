# XPSwap 티커 문제 해결 - 2025년 7월 31일

## 📅 작업 개요
- **작업자**: Claude
- **날짜**: 2025년 7월 31일
- **주요 목표**: 서버에서 암호화폐 티커가 표시되지 않는 문제 해결

## 🔍 문제 분석

### 1. 증상
- 로컬 개발 환경에서는 티커가 정상 작동
- 서버(https://trendy.storydot.kr/xpswap/)에서는 티커가 표시되지 않음
- API 호출이 실패하는 것으로 추정

### 2. 원인 추정
- 프로덕션 빌드 시 API URL이 잘못 설정되었을 가능성
- Apache 프록시 설정 문제
- CORS 또는 보안 설정 문제

### 3. 확인 사항

#### API URL 설정 (`client/src/lib/apiUrl.ts`)
```typescript
export const API_BASE_URL = import.meta.env.PROD 
  ? '/xpswap/api'  // 프로덕션: 상대 경로 사용
  : 'http://localhost:5000/api';  // 개발: 절대 경로 사용
```

#### 티커 컴포넌트 (`client/src/components/CryptoTicker.tsx`)
- API 엔드포인트: `/api/crypto-ticker`
- getApiUrl() 함수를 통해 URL 생성
- 15초마다 자동 업데이트

## 🛠️ 해결 방안

### 1. 즉시 확인 필요 사항
1. **서버 Apache 설정 확인**
   - `/etc/apache2/sites-available/000-default-le-ssl.conf`
   - ProxyPass 설정이 올바른지 확인
   ```apache
   ProxyPass /xpswap/api http://localhost:5000/api
   ProxyPassReverse /xpswap/api http://localhost:5000/api
   ```

2. **PM2 프로세스 상태 확인**
   ```bash
   pm2 list
   pm2 logs xpswap-api
   ```

3. **API 직접 테스트**
   ```bash
   # 서버에서 직접 실행
   curl http://localhost:5000/api/crypto-ticker
   curl https://trendy.storydot.kr/xpswap/api/crypto-ticker
   ```

### 2. 수정 방안

#### 옵션 1: Apache 프록시 설정 수정
서버에 SSH로 접속하여 Apache 설정 확인 및 수정:
```bash
sudo nano /etc/apache2/sites-available/000-default-le-ssl.conf
```

다음 설정이 있는지 확인:
```apache
# XPSwap API 프록시
ProxyPass /xpswap/api http://localhost:5000/api
ProxyPassReverse /xpswap/api http://localhost:5000/api
ProxyPreserveHost On

# 헤더 설정
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
```

#### 옵션 2: 환경 변수 확인
서버의 `.env.production` 파일에서 BASE_PATH 설정 확인:
```bash
cd /var/www/storage/xpswap
cat .env.production | grep BASE_PATH
```

#### 옵션 3: 빌드 파일 직접 수정 (임시 방안)
빌드된 파일에서 API URL을 직접 수정하는 방법도 가능하지만, 재빌드 시 덮어써지므로 권장하지 않음.

### 3. 테스트 절차

1. **로컬에서 프로덕션 빌드 테스트**
   ```powershell
   cd C:\Users\vincent\Downloads\XPswap\XPswap
   npm run build
   npm run preview  # 프로덕션 빌드 미리보기
   ```

2. **서버 배포 후 테스트**
   - 브라우저 개발자 도구 열기 (F12)
   - Network 탭에서 crypto-ticker API 호출 확인
   - Console 탭에서 에러 메시지 확인

## 📋 체크리스트

- [ ] 프로덕션 빌드 완료
- [ ] Apache 프록시 설정 확인
- [ ] PM2 프로세스 정상 작동 확인
- [ ] API 엔드포인트 직접 테스트
- [ ] CORS 헤더 설정 확인
- [ ] 서버 로그 확인
- [ ] 브라우저 콘솔 에러 확인

## 🚨 주의사항

1. **서버 작업 시 주의**
   - Apache 설정 변경 후 반드시 재시작: `sudo systemctl restart apache2`
   - PM2 프로세스 재시작: `pm2 restart xpswap-api`

2. **캐시 문제**
   - 브라우저 캐시 삭제 후 테스트
   - CloudFlare 등 CDN 캐시도 확인

3. **보안 설정**
   - CORS 설정은 보안을 위해 특정 도메인만 허용하도록 수정 필요
   - 현재는 테스트를 위해 모든 도메인 허용 (*) 사용

## 🎯 다음 단계

1. 서버 SSH 접속하여 Apache 설정 확인
2. API 엔드포인트 직접 테스트
3. 필요시 설정 수정 및 서비스 재시작
4. 브라우저에서 최종 확인

---

*이 문서는 티커 문제가 해결될 때까지 계속 업데이트됩니다.*