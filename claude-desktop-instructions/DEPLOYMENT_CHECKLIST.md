# XPSwap 서버 배포 체크리스트

## 📋 배포 전 체크리스트

### 1. 로컬 빌드 확인
```powershell
cd "C:\Users\vincent\Downloads\XPswap\XPswap"
npm run build
# dist/ 폴더 생성 확인
# client/dist/ 폴더 생성 확인
```

### 2. 환경 변수 확인
- [ ] `.env.production` 파일 존재
- [ ] `NODE_ENV=production` 설정
- [ ] `PORT=5000` 설정
- [ ] `DATABASE_URL=./test.db` 설정
- [ ] `BASE_PATH=/xpswap` 설정

### 3. 서버 접속 정보
```bash
# SSH 접속
ssh ubuntu@trendy.storydot.kr

# 프로젝트 경로
cd /var/www/storage/xpswap
```

## 🚀 배포 프로세스

### Step 1: 기존 프로세스 중지
```bash
# PM2 프로세스 확인
pm2 list

# 기존 프로세스 중지
pm2 stop xpswap-api
pm2 delete xpswap-api
```

### Step 2: 백업 생성
```bash
cd /var/www/storage/xpswap
cp -r dist dist_backup_$(date +%Y%m%d_%H%M%S)
cp -r client/dist client_dist_backup_$(date +%Y%m%d_%H%M%S)
```

### Step 3: 파일 업로드
```powershell
# 로컬에서 실행 (PowerShell)
cd "C:\Users\vincent\Downloads\XPswap\XPswap"

# SCP로 파일 전송
scp -r dist/ ubuntu@trendy.storydot.kr:/var/www/storage/xpswap/
scp -r client/dist/ ubuntu@trendy.storydot.kr:/var/www/storage/xpswap/client/
```

### Step 4: 의존성 업데이트
```bash
cd /var/www/storage/xpswap
npm install --production
```

### Step 5: PM2로 시작
```bash
# PM2 시작
pm2 start ecosystem.config.js --env production

# 또는 직접 시작
pm2 start dist/index.js --name "xpswap-api" --env production

# 자동 시작 설정
pm2 startup
pm2 save
```

### Step 6: 배포 검증
```bash
# API 상태 확인
curl http://localhost:5000/api/health

# 로그 확인
pm2 logs xpswap-api --lines 50

# 실시간 모니터링
pm2 monit
```

## ✅ 배포 후 확인사항

- [ ] https://trendy.storydot.kr/xpswap/ 접속 확인
- [ ] 홈페이지 로딩 확인
- [ ] 메뉴 네비게이션 작동
- [ ] API 응답 확인 (/api/xp-price)
- [ ] 암호화폐 티커 업데이트
- [ ] 콘솔 에러 없음

## 🚨 문제 발생 시 롤백

```bash
# PM2 중지
pm2 stop xpswap-api

# 백업 복원
rm -rf dist
mv dist_backup_YYYYMMDD_HHMMSS dist

rm -rf client/dist
mv client_dist_backup_YYYYMMDD_HHMMSS client/dist

# 재시작
pm2 start xpswap-api
```

## 📞 서버 정보

- **도메인**: trendy.storydot.kr
- **포트**: 5000 (내부), 443 (외부 HTTPS)
- **프록시**: Apache2
- **PM2 프로세스명**: xpswap-api
- **로그 위치**: ~/.pm2/logs/

## 🔧 Apache 설정 확인

```bash
# Apache 설정 확인
sudo nano /etc/apache2/sites-available/000-default-le-ssl.conf

# 필요한 설정
ProxyPass /xpswap http://localhost:5000/xpswap
ProxyPassReverse /xpswap http://localhost:5000/xpswap

# Apache 재시작
sudo systemctl restart apache2
```

## 📊 모니터링

```bash
# 시스템 리소스
htop

# 디스크 사용량
df -h

# PM2 상태
pm2 status

# 에러 로그
tail -f ~/.pm2/logs/xpswap-api-error.log
```
