# XPSwap 서버 문제 해결 - 2025년 7월 31일

## 🚨 문제 상황

### 증상
1. **티커 표시 안됨**: https://trendy.storydot.kr/xpswap/ 에서 상단 암호화폐 티커가 표시되지 않음
2. **메뉴 새로고침 문제**: 서브 페이지에서 새로고침하면 WordPress로 리다이렉트됨
3. **API 접근 불가**: /xpswap/api/* 경로로 API 호출 실패

### 분석
- 로컬 환경에서는 모든 기능 정상 작동
- 서버의 Apache 프록시 설정 문제로 추정
- React Router와 Apache 설정 충돌

## 🔧 해결 방법

### 1. Apache 프록시 설정 수정

```bash
# SSH 접속
ssh ubuntu@trendy.storydot.kr

# Apache 설정 파일 수정
sudo nano /etc/apache2/sites-available/000-default-le-ssl.conf
```

### 2. 필요한 설정 추가

```apache
# XPSwap API 프록시 설정
ProxyPass /xpswap/api http://localhost:5000/api
ProxyPassReverse /xpswap/api http://localhost:5000/api

# XPSwap 정적 파일 설정 (기존)
Alias /xpswap /var/www/storage/xpswap/client/dist
<Directory /var/www/storage/xpswap/client/dist>
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
    
    # React Router 지원
    <IfModule mod_rewrite.c>
        RewriteEngine On
        RewriteBase /xpswap/
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteCond %{REQUEST_URI} !^/xpswap/api
        RewriteRule . /xpswap/index.html [L]
    </IfModule>
</Directory>
```

### 3. Apache 재시작

```bash
# Apache 설정 테스트
sudo apache2ctl configtest

# Apache 재시작
sudo systemctl restart apache2
```

### 4. PM2 프로세스 확인

```bash
# PM2 상태 확인
pm2 list

# PM2 재시작 (필요시)
pm2 restart xpswap-api

# 로그 확인
pm2 logs xpswap-api --lines 50
```

### 5. 환경변수 확인

```bash
# .env.production 파일 확인
cd /var/www/storage/xpswap
cat .env.production

# 필요한 설정
NODE_ENV=production
PORT=5000
BASE_PATH=/xpswap
```

## 🧪 테스트 방법

### 1. API 엔드포인트 테스트
```bash
# 서버에서 직접 테스트
curl http://localhost:5000/api/health
curl http://localhost:5000/api/crypto-ticker

# 외부에서 테스트
curl https://trendy.storydot.kr/xpswap/api/health
curl https://trendy.storydot.kr/xpswap/api/crypto-ticker
```

### 2. 브라우저 테스트
- 메인 페이지: https://trendy.storydot.kr/xpswap/
- API 직접 접근: https://trendy.storydot.kr/xpswap/api/crypto-ticker
- 서브 페이지 새로고침: https://trendy.storydot.kr/xpswap/swap (새로고침해도 유지되어야 함)

## 📋 체크리스트

- [ ] Apache 프록시 설정 추가
- [ ] Apache 재시작
- [ ] API 엔드포인트 접근 확인
- [ ] 티커 표시 확인
- [ ] 서브 페이지 새로고침 문제 해결
- [ ] PM2 프로세스 정상 작동 확인

## 🎯 예상 결과

1. **티커 정상 표시**: 상단에 암호화폐 가격이 실시간으로 표시됨
2. **API 정상 작동**: /xpswap/api/* 경로로 모든 API 호출 가능
3. **라우팅 정상**: 모든 페이지에서 새로고침해도 정상 작동

## 📝 추가 노트

- Apache 설정 변경 시 반드시 `configtest` 먼저 실행
- PM2 로그 확인보다는 직접 curl 테스트가 더 빠름
- 문제 지속 시 Apache 에러 로그 확인: `sudo tail -f /var/log/apache2/error.log`
