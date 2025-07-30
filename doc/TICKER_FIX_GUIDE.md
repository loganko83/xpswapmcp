# XPSwap 티커 문제 해결 가이드

## 🔍 문제 진단

### 1. 브라우저 테스트
1. **API 디버그 페이지 접속**
   - https://trendy.storydot.kr/xpswap/debug.html
   - 각 API 엔드포인트 테스트
   - 응답 시간 및 상태 확인

2. **직접 API 접속**
   - https://trendy.storydot.kr/xpswap/api/crypto-ticker
   - 브라우저 개발자 도구 > Network 탭 확인
   - 응답 상태 및 헤더 확인

### 2. 서버 접속 및 확인

```bash
# SSH 접속
ssh ubuntu@trendy.storydot.kr

# 1. PM2 프로세스 상태 확인
pm2 list
pm2 logs xpswap-api --lines 100

# 2. 로컬 API 테스트
curl -v http://localhost:5000/api/health
curl -v http://localhost:5000/api/crypto-ticker

# 3. Apache 설정 확인
sudo cat /etc/apache2/sites-available/000-default-le-ssl.conf | grep -A 20 -B 5 xpswap
```

## 🛠️ 해결 방법

### Option 1: Apache ProxyPass 추가

```bash
# Apache 설정 편집
sudo nano /etc/apache2/sites-available/000-default-le-ssl.conf
```

다음 내용을 `<VirtualHost *:443>` 블록 내에 추가:

```apache
# XPSwap 정적 파일 (이미 있을 수 있음)
Alias /xpswap /var/www/storage/html_backup/xpswap
<Directory /var/www/storage/html_backup/xpswap>
    Options Indexes FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>

# XPSwap API 프록시 (중요!)
ProxyPass /xpswap/api http://localhost:5000/api
ProxyPassReverse /xpswap/api http://localhost:5000/api
ProxyPreserveHost On

# CORS 헤더 (필요시)
<Location /xpswap/api>
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
</Location>
```

### Option 2: 심볼릭 링크 재설정 (빌드 파일 위치 확인)

```bash
# 현재 심볼릭 링크 확인
ls -la /var/www/storage/html_backup/xpswap

# 올바른 경로로 재설정 (필요시)
sudo rm /var/www/storage/html_backup/xpswap
sudo ln -s /var/www/storage/xpswap/client/dist /var/www/storage/html_backup/xpswap
```

### Option 3: PM2 환경 변수 확인

```bash
# PM2 설정 확인
cd /var/www/storage/xpswap
cat ecosystem.config.js

# 환경 변수 확인
cat .env.production

# PM2 재시작
pm2 restart xpswap-api
```

## 🔄 서비스 재시작

```bash
# Apache 모듈 활성화 (필요시)
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers

# Apache 설정 테스트
sudo apache2ctl configtest

# Apache 재시작
sudo systemctl restart apache2

# PM2 재시작
pm2 restart xpswap-api
```

## ✅ 최종 확인

1. **API 테스트**
   ```bash
   # 서버에서
   curl https://trendy.storydot.kr/xpswap/api/crypto-ticker
   
   # 외부에서 (로컬 PC)
   curl https://trendy.storydot.kr/xpswap/api/crypto-ticker
   ```

2. **브라우저 확인**
   - https://trendy.storydot.kr/xpswap/ 접속
   - 상단 티커 표시 확인
   - 개발자 도구 > Console 에러 확인

## 📝 체크리스트

- [ ] PM2 프로세스 정상 작동
- [ ] 로컬 API 응답 정상
- [ ] Apache ProxyPass 설정 추가
- [ ] Apache 모듈 활성화
- [ ] Apache 재시작
- [ ] 브라우저 캐시 삭제
- [ ] 티커 정상 표시 확인

## 🚨 주의사항

1. **Apache 설정 변경 시**
   - 반드시 `configtest` 실행
   - 문법 오류 확인 후 재시작

2. **캐시 문제**
   - 브라우저 캐시 삭제 (Ctrl+F5)
   - CloudFlare 캐시 퍼지 (필요시)

3. **디버그 파일**
   - `/xpswap/debug.html` 파일은 테스트 후 삭제 권장
   - 보안상 프로덕션에서는 제거

## 💡 디버깅 팁

1. **로그 실시간 모니터링**
   ```bash
   # PM2 로그
   pm2 logs xpswap-api --lines 100
   
   # Apache 로그
   sudo tail -f /var/log/apache2/error.log
   sudo tail -f /var/log/apache2/access.log
   ```

2. **네트워크 확인**
   ```bash
   # 5000 포트 확인
   sudo netstat -tlnp | grep 5000
   ```

3. **프로세스 상태**
   ```bash
   # Node.js 프로세스
   ps aux | grep node
   ```

---

이 가이드를 따라 순서대로 진행하면 티커 문제를 해결할 수 있습니다.
