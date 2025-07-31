# XPSwap Apache 설정 가이드

## Apache SSL 설정 파일 수정
파일 위치: `/etc/apache2/sites-available/000-default-le-ssl.conf`

### 추가해야 할 설정

```apache
# ===== XPSwap 설정 시작 =====

# XPSwap API 프록시 설정
ProxyPass /xpswap/api http://localhost:5000/api
ProxyPassReverse /xpswap/api http://localhost:5000/api

# WebSocket 지원 (필요시)
ProxyPass /xpswap/ws ws://localhost:5000/ws
ProxyPassReverse /xpswap/ws ws://localhost:5000/ws

# XPSwap 정적 파일 설정
Alias /xpswap /var/www/storage/xpswap/client/dist
<Directory /var/www/storage/xpswap/client/dist>
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
    
    # React Router 지원
    <IfModule mod_rewrite.c>
        RewriteEngine On
        RewriteBase /xpswap/
        
        # API 요청은 리라이트하지 않음
        RewriteCond %{REQUEST_URI} !^/xpswap/api
        
        # 실제 파일이나 디렉토리가 존재하면 그대로 서비스
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        
        # 나머지 모든 요청은 index.html로
        RewriteRule . /xpswap/index.html [L]
    </IfModule>
    
    # 캐싱 설정 (선택사항)
    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType image/jpg "access plus 1 year"
        ExpiresByType image/jpeg "access plus 1 year"
        ExpiresByType image/gif "access plus 1 year"
        ExpiresByType image/png "access plus 1 year"
        ExpiresByType image/webp "access plus 1 year"
        ExpiresByType text/css "access plus 1 month"
        ExpiresByType application/javascript "access plus 1 month"
    </IfModule>
</Directory>

# ===== XPSwap 설정 끝 =====
```

## 필요한 Apache 모듈 확인

```bash
# 필요한 모듈이 활성화되어 있는지 확인
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod expires

# Apache 설정 테스트
sudo apache2ctl configtest

# Apache 재시작
sudo systemctl restart apache2
```

## 설정 테스트 방법

### 1. API 프록시 테스트
```bash
# 로컬에서 직접 테스트
curl http://localhost:5000/api/health

# 프록시를 통한 테스트
curl https://trendy.storydot.kr/xpswap/api/health
```

### 2. React Router 테스트
- https://trendy.storydot.kr/xpswap/swap (새로고침해도 정상 작동)
- https://trendy.storydot.kr/xpswap/pool (새로고침해도 정상 작동)
- https://trendy.storydot.kr/xpswap/farm (새로고침해도 정상 작동)

### 3. 정적 파일 테스트
- https://trendy.storydot.kr/xpswap/assets/index.js
- https://trendy.storydot.kr/xpswap/assets/index.css

## 문제 해결

### API 404 에러
```bash
# Apache 에러 로그 확인
sudo tail -f /var/log/apache2/error.log

# PM2 프로세스 확인
pm2 list
pm2 restart xpswap-api
```

### 권한 문제
```bash
# 디렉토리 권한 확인
ls -la /var/www/storage/xpswap/client/dist

# 권한 수정 (필요시)
sudo chown -R www-data:www-data /var/www/storage/xpswap/client/dist
```

### 심볼릭 링크 확인
```bash
# 심볼릭 링크 상태 확인
ls -la /var/www/storage/html_backup/xpswap

# 심볼릭 링크가 올바른지 확인
readlink -f /var/www/storage/html_backup/xpswap
```

## 전체 설정 예시

```apache
<VirtualHost *:443>
    ServerName trendy.storydot.kr
    DocumentRoot /var/www/storage/html_backup
    
    # SSL 설정 (Let's Encrypt)
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/trendy.storydot.kr/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/trendy.storydot.kr/privkey.pem
    
    # 기존 WordPress 설정
    <Directory /var/www/storage/html_backup>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # XPSwap 설정 (위의 설정 추가)
    # ... (위의 XPSwap 설정 복사)
    
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```
