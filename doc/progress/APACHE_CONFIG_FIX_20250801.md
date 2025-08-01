# Apache 설정 문제 해결 가이드 - WordPress CSS 간섭 차단
# 날짜: 2025-08-01

## 🚨 현재 문제 상황
1. **WordPress CSS 로딩**: `wp-content/themes/trendy-news/style.css` 간섭
2. **React 앱 마운트 실패**: Root element가 비어있음
3. **Service Worker 오류**: HTTPS/HTTP 혼합 문제
4. **Manifest 구문 오류**: JSON 파싱 실패

## 🔧 해결 방안

### 1. Apache 설정 강화 (xpswap.conf)

현재 Apache 설정의 문제점:
- WordPress와 XPSwap 경로 충돌
- Header 설정 부족
- Rewrite 규칙 우선순위 문제

**개선된 Apache 설정**:

```apache
# XPSwap DEX Configuration - Enhanced Version
# 날짜: 2025-08-01

# WordPress CSS 완전 차단
<LocationMatch "^/xpswap.*\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$">
    # WordPress 테마 파일 접근 완전 차단
    RewriteEngine On
    RewriteCond %{REQUEST_URI} wp-content [NC]
    RewriteRule .* - [F,L]
    
    # XPSwap 전용 MIME 타입 설정
    Header unset X-Powered-By
    Header set X-Content-Type-Options nosniff
    Header set X-Frame-Options DENY
    Header set X-XSS-Protection "1; mode=block"
</LocationMatch>

# API Proxy - 최우선 순위
ProxyRequests Off
ProxyPreserveHost On
ProxyPass /xpswap/api http://localhost:5000/xpswap/api
ProxyPassReverse /xpswap/api http://localhost:5000/xpswap/api

# XPSwap Static Files - WordPress와 완전 분리
Alias /xpswap /var/www/storage/xpswap/client/dist

<Directory /var/www/storage/xpswap/client/dist>
    Options -Indexes +FollowSymLinks
    AllowOverride None
    Require all granted
    DirectoryIndex index.html
    
    # WordPress 간섭 완전 차단
    RewriteEngine On
    RewriteBase /xpswap
    
    # WordPress 테마 파일 접근 시 404 반환
    RewriteCond %{REQUEST_URI} wp-content [NC,OR]
    RewriteCond %{REQUEST_URI} wp-includes [NC,OR]
    RewriteCond %{REQUEST_URI} wp-admin [NC]
    RewriteRule .* - [R=404,L]
    
    # XPSwap 전용 보안 헤더
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options SAMEORIGIN
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    
    # CSS/JS 파일 캐싱 및 보안
    <FilesMatch "\.(css|js)$">
        Header set Cache-Control "public, max-age=31536000"
        Header unset ETag
        FileETag None
        
        # WordPress CSS 차단 강화
        RewriteCond %{REQUEST_URI} !^/xpswap/
        RewriteRule .* - [F,L]
    </FilesMatch>
    
    # 이미지 및 폰트 파일 최적화
    <FilesMatch "\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$">
        Header set Cache-Control "public, max-age=31536000"
        Header unset ETag
        FileETag None
    </FilesMatch>
    
    # React Router 지원 - WordPress 간섭 없이
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} !wp-content
    RewriteCond %{REQUEST_URI} !wp-includes
    RewriteRule ^.*$ /xpswap/index.html [L]
</Directory>

# WordPress 경로에서 XPSwap 리소스 차단
<LocationMatch "^/wp-content/.*">
    RewriteEngine On
    RewriteCond %{HTTP_REFERER} /xpswap [NC]
    RewriteRule .* - [F,L]
</LocationMatch>

# XPSwap 경로 보안 강화
<Location "/xpswap">
    # CSP 헤더 설정
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.coingecko.com https://www.ankr.com wss: ws:;"
    
    # XPSwap 전용 보안 헤더
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options SAMEORIGIN
</Location>
```

### 2. 추가 보안 설정 (.htaccess)

XPSwap 디렉토리에 `.htaccess` 파일 추가:

```apache
# /var/www/storage/xpswap/client/dist/.htaccess

# WordPress 완전 차단
RewriteEngine On

# WordPress 관련 요청 차단
RewriteCond %{REQUEST_URI} wp-content [NC,OR]
RewriteCond %{REQUEST_URI} wp-includes [NC,OR]
RewriteCond %{REQUEST_URI} wp-admin [NC]
RewriteRule .* - [R=404,L]

# XPSwap 전용 MIME 타입
AddType application/javascript .js
AddType text/css .css
AddType application/json .json
AddType image/svg+xml .svg

# 보안 헤더
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options SAMEORIGIN
Header always set X-XSS-Protection "1; mode=block"

# React Router 지원
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^.*$ /xpswap/index.html [L]
```

## 📋 적용 단계

### 1단계: Apache 설정 백업
```bash
sudo cp /etc/apache2/sites-available/xpswap.conf /etc/apache2/sites-available/xpswap.conf.backup
```

### 2단계: 새 설정 적용
```bash
sudo nano /etc/apache2/sites-available/xpswap.conf
# 위의 개선된 설정 복사/붙여넣기
```

### 3단계: .htaccess 파일 생성
```bash
sudo nano /var/www/storage/xpswap/client/dist/.htaccess
# 위의 .htaccess 내용 복사/붙여넣기
```

### 4단계: Apache 모듈 활성화
```bash
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod expires
```

### 5단계: 설정 테스트 및 재시작
```bash
sudo apache2ctl configtest
sudo systemctl reload apache2
```

### 6단계: 권한 설정
```bash
sudo chown -R www-data:www-data /var/www/storage/xpswap/client/dist
sudo chmod -R 755 /var/www/storage/xpswap/client/dist
sudo chmod 644 /var/www/storage/xpswap/client/dist/.htaccess
```

## 🧪 테스트 방법

### 1. WordPress CSS 차단 확인
```bash
curl -I https://trendy.storydot.kr/xpswap/wp-content/themes/trendy-news/style.css
# 예상 결과: 404 Not Found
```

### 2. XPSwap CSS 로딩 확인
```bash
curl -I https://trendy.storydot.kr/xpswap/assets/index-*.css
# 예상 결과: 200 OK, Content-Type: text/css
```

### 3. React 앱 로딩 확인
```bash
curl -s https://trendy.storydot.kr/xpswap/ | grep "root"
# div id="root" 태그 내용이 있어야 함
```

### 4. API 엔드포인트 확인
```bash
curl https://trendy.storydot.kr/xpswap/api/health
# 예상 결과: {"status":"ok","timestamp":"..."}
```

## 🔧 문제별 해결 체크리스트

### WordPress CSS 간섭 차단
- [ ] Apache 설정에서 wp-content 차단 규칙 추가
- [ ] .htaccess 파일로 이중 보안 설정
- [ ] LocationMatch를 통한 경로별 차단
- [ ] 헤더 설정으로 MIME 타입 강제 지정

### React 앱 마운트 문제
- [ ] index.html의 root element 확인
- [ ] JavaScript 파일 로딩 순서 확인
- [ ] CSP 헤더에서 'unsafe-inline' 허용
- [ ] Service Worker 등록 오류 해결

### HTTPS/HTTP 혼합 콘텐츠
- [ ] 모든 외부 리소스 HTTPS 확인
- [ ] WebSocket 연결 wss:// 사용
- [ ] API 호출 시 상대 경로 사용
- [ ] Strict-Transport-Security 헤더 설정

## 📊 성공 지표

설정 적용 후 다음이 확인되어야 함:

1. **네트워크 탭**: WordPress CSS 파일 로딩 없음 (404)
2. **콘솔**: React 관련 오류 해결
3. **Elements 탭**: div#root 내부에 React 컴포넌트 렌더링
4. **Application 탭**: Service Worker 정상 등록
5. **보안**: CSP 위반 없음

## 🚨 롤백 계획

문제 발생 시 즉시 롤백:

```bash
# 백업 설정으로 복원
sudo cp /etc/apache2/sites-available/xpswap.conf.backup /etc/apache2/sites-available/xpswap.conf

# .htaccess 제거
sudo rm /var/www/storage/xpswap/client/dist/.htaccess

# Apache 재시작
sudo systemctl reload apache2
```

## 📝 다음 단계

Apache 설정 적용 후:

1. **프론트엔드 디버깅**: React 앱 마운트 문제 해결
2. **Service Worker 수정**: HTTPS 환경에 맞는 설정
3. **Manifest 파일 수정**: JSON 구문 오류 해결
4. **성능 최적화**: 캐싱 전략 개선

---

*이 가이드는 WordPress와 XPSwap 간의 간섭을 완전히 차단하기 위한 종합적인 해결책입니다.*
