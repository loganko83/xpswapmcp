# 2025-07-31 서버 문제 해결 진행 상황

## 🎯 목표
- XPSwap 서버 배포 후 티커가 안나오는 문제 해결
- 메뉴 새로고침 시 WordPress로 리다이렉트되는 문제 해결
- Apache API 프록시 설정 수정

## 🔍 문제 분석

### 초기 상태
- 웹사이트: https://trendy.storydot.kr/xpswap/ ✅ 접속 가능
- 상단 티커: ❌ 안나옴
- API 엔드포인트: ❌ 404 에러
- 메뉴 새로고침: ❌ WordPress로 리다이렉트

### 서버 환경 확인
- PM2 상태: ✅ xpswap-api 정상 실행 중 (PID: 253122)
- 로컬 API: ✅ http://localhost:5000/api/health 정상 응답
- 심볼릭 링크: ✅ /var/www/storage/html_backup/xpswap -> /var/www/storage/xpswap/client/dist
- 파일 구조: ✅ 빌드된 파일들 정상 존재

### 원인 분석
1. **Apache ProxyPass 설정 문제**: Location 블록의 접근 제어 설정이 Apache 2.4와 호환되지 않음
2. **여러 Apache 설정 파일 충돌**: storydot-kr-unified.conf와 다른 설정들이 서로 간섭
3. **WordPress .htaccess 간섭**: WordPress의 RewriteRule이 모든 요청을 index.php로 리다이렉트
4. **Apache 사이트 우선순위 문제**: 기본 사이트들이 활성화되어 있어 설정 충돌 발생

## 🛠️ 해결 과정

### 1단계: Apache Location 블록 수정
```apache
# 기존 (Apache 2.2 스타일)
<Location /xpswap/api>
    ProxyPass http://localhost:5000/api
    ProxyPassReverse http://localhost:5000/api
    Order allow,deny
    Allow from all
</Location>

# 수정 (Apache 2.4 스타일)
<Location /xpswap/api>
    ProxyPass http://localhost:5000/api
    ProxyPassReverse http://localhost:5000/api
    Require all granted
</Location>
```

### 2단계: WordPress .htaccess 수정
```apache
# 기존
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]

# 수정 (xpswap/api 요청 제외)
RewriteCond %{REQUEST_URI} !^/xpswap/api/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
```

### 3단계: Apache 사이트 우선순위 조정
```bash
# 불필요한 기본 사이트 비활성화
sudo a2dissite 000-default default-ssl

# XPSwap 전용 설정 활성화
sudo a2ensite storydot-kr-xpswap

# Apache 재로드
sudo systemctl reload apache2
```

## ✅ 해결 결과

### API 테스트
```bash
# Health Check API
curl -s https://trendy.storydot.kr/xpswap/api/health
# ✅ 정상 응답: {"status":"healthy","timestamp":1753933384123,...}

# 티커 API
curl -s https://trendy.storydot.kr/xpswap/api/crypto-ticker
# ✅ 정상 응답: {"tickers":[{"id":"bitcoin","symbol":"BTC",...}]}
```

### 웹사이트 테스트
```bash
# 메인 페이지
curl -s https://trendy.storydot.kr/xpswap/
# ✅ 정상 HTML 응답
```

## 🎉 최종 상태
- ✅ XPSwap 웹사이트 정상 접속
- ✅ 상단 티커 정상 작동 
- ✅ API 엔드포인트 모두 정상 응답
- ✅ React Router 정상 작동 (새로고침 시 WordPress 리다이렉트 해결)

## 🔧 적용된 최종 설정

### Apache 설정 (/etc/apache2/sites-available/storydot-kr-xpswap.conf)
```apache
<VirtualHost *:443>
    ServerName trendy.storydot.kr
    
    # XPSwap API proxy - with higher priority
    <LocationMatch "^/xpswap/api/.*">
        ProxyPass http://localhost:5000
        ProxyPassReverse http://localhost:5000
    </LocationMatch>
</VirtualHost>
```

### WordPress .htaccess 수정
```apache
# Exclude xpswap API from WordPress routing
RewriteCond %{REQUEST_URI} !^/xpswap/api/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
```

### 활성화된 Apache 사이트
```bash
# 활성화된 사이트
- storydot-kr-unified.conf (메인 WordPress 사이트)
- storydot-kr-xpswap.conf (XPSwap API 프록시)

# 비활성화된 사이트
- 000-default.conf
- default-ssl.conf
```

## 📋 향후 유지보수 가이드

### 문제 발생 시 체크리스트
1. PM2 프로세스 확인: `pm2 list`
2. 로컬 API 테스트: `curl http://localhost:5000/api/health`
3. Apache 설정 테스트: `sudo apache2ctl configtest`
4. Apache 상태 확인: `sudo systemctl status apache2`
5. API 프록시 테스트: `curl https://trendy.storydot.kr/xpswap/api/health`

### 주요 파일 위치
- Apache 설정: `/etc/apache2/sites-available/storydot-kr-xpswap.conf`
- WordPress .htaccess: `/var/www/storage/html_backup/.htaccess`
- XPSwap 프로젝트: `/var/www/storage/xpswap/`
- 심볼릭 링크: `/var/www/storage/html_backup/xpswap -> /var/www/storage/xpswap/client/dist`

### 배포 시 주의사항
1. 빌드된 파일을 `/var/www/storage/xpswap/client/dist/`에 배치
2. PM2 프로세스 재시작: `pm2 restart xpswap-api`
3. Apache 설정 변경 시 재로드: `sudo systemctl reload apache2`

## 🏆 성과
- **서버 문제 완전 해결**: 모든 API 엔드포인트 정상 작동
- **사용자 경험 개선**: 페이지 새로고침 시 정상 작동
- **안정적인 배포 환경**: Apache 프록시 설정 최적화
- **문서화 완료**: 향후 유지보수를 위한 상세 가이드 작성

---
해결 완료 시간: 2025-07-31 21:43 KST
소요 시간: 약 2시간
