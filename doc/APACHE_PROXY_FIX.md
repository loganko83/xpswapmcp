# Apache 프록시 설정 수정 가이드

## 서버 접속
```bash
ssh ubuntu@trendy.storydot.kr
```

## 1. Apache 설정 파일 확인
```bash
# SSL 설정 파일 확인
sudo nano /etc/apache2/sites-available/000-default-le-ssl.conf
```

## 2. 필요한 프록시 설정 추가

다음 설정이 `<VirtualHost *:443>` 블록 안에 있는지 확인하고, 없으면 추가:

```apache
# XPSwap 정적 파일 (심볼릭 링크 사용)
Alias /xpswap /var/www/storage/html_backup/xpswap
<Directory /var/www/storage/html_backup/xpswap>
    Options Indexes FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>

# XPSwap API 프록시
ProxyPass /xpswap/api http://localhost:5000/api
ProxyPassReverse /xpswap/api http://localhost:5000/api
ProxyPreserveHost On

# CORS 헤더 설정 (필요시)
<Location /xpswap/api>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</Location>
```

## 3. Apache 모듈 활성화 확인
```bash
# 필요한 모듈 활성화
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers
sudo a2enmod rewrite
```

## 4. 설정 테스트 및 재시작
```bash
# Apache 설정 문법 검사
sudo apache2ctl configtest

# Apache 재시작
sudo systemctl restart apache2
```

## 5. PM2 프로세스 확인
```bash
# PM2 프로세스 목록
pm2 list

# xpswap-api 로그 확인
pm2 logs xpswap-api --lines 50

# 필요시 재시작
pm2 restart xpswap-api
```

## 6. API 테스트
```bash
# 로컬에서 API 테스트
curl http://localhost:5000/api/health
curl http://localhost:5000/api/crypto-ticker

# 외부에서 API 테스트
curl https://trendy.storydot.kr/xpswap/api/health
curl https://trendy.storydot.kr/xpswap/api/crypto-ticker
```

## 7. 디버깅

### Apache 에러 로그 확인
```bash
sudo tail -f /var/log/apache2/error.log
```

### PM2 로그 실시간 확인
```bash
pm2 logs xpswap-api --lines 100
```

### 네트워크 포트 확인
```bash
# 5000 포트가 열려있는지 확인
sudo netstat -tlnp | grep 5000
```

## 8. 심볼릭 링크 확인
```bash
# 현재 심볼릭 링크 상태
ls -la /var/www/storage/html_backup/xpswap

# 올바른 경로를 가리키는지 확인
# 예상: /var/www/storage/html_backup/xpswap -> /var/www/storage/xpswap/client/dist
```

## 9. 빌드 파일 업데이트 (필요시)
```bash
# 로컬에서 빌드 후 업로드
scp -r C:\Users\vincent\Downloads\XPswap\XPswap\dist\public\* ubuntu@trendy.storydot.kr:/var/www/storage/xpswap/client/dist/
```

## 문제 해결 체크리스트

- [ ] Apache 프록시 설정 확인
- [ ] ProxyPass 경로가 올바른지 확인 (/xpswap/api -> http://localhost:5000/api)
- [ ] Apache 모듈 활성화 확인 (proxy, proxy_http, headers)
- [ ] PM2 프로세스 정상 작동 확인
- [ ] API 직접 호출 테스트 (curl)
- [ ] 브라우저 개발자 도구에서 네트워크 요청 확인
- [ ] CORS 에러 확인
- [ ] Apache 에러 로그 확인

## 주의사항

1. Apache 설정 변경 시 반드시 `configtest` 실행
2. 서비스 재시작 후 충분한 시간 대기 (약 10초)
3. 브라우저 캐시 삭제 후 테스트
4. HTTPS 인증서 설정이 올바른지 확인