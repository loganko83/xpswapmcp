# Apache 설정 문제 해결 가이드 - WordPress CSS 간섭 차단
**날짜**: 2025-08-01 **상태**: ✅ **완료** (17:45 KST)

## 🔴 발견된 문제

### 1. 서비스 중단 상황
- **URL**: https://trendy.storydot.kr/xpswap/
- **증상**: 디렉토리 목록 표시 (파일 브라우저)
- **원인**: Apache 설정 충돌 및 DirectoryIndex 미작동

### 2. Apache 설정 충돌
```bash
# 오류 메시지
AH00526: Syntax error on line 53 of /etc/apache2/sites-enabled/storydot-kr-unified.conf:
Either all Options must start with + or -, or no Option may.
```

## ✅ 해결 과정

### 1. 파일 상태 확인
```bash
# 프로젝트 디렉토리 확인
cd /var/www/storage/xpswap
ls -la client/dist/  # index.html 존재 확인 ✅

# Apache 설정 파일 확인
sudo cat /etc/apache2/sites-available/xpswap.conf  # 설정 OK ✅
```

### 2. Apache 설정 충돌 해결
```bash
# 문제 라인 식별
sudo grep -n "Options" /etc/apache2/sites-enabled/storydot-kr-unified.conf

# 53번 라인 수정: "Options FollowSymLinks -Indexes" → "Options +FollowSymLinks -Indexes"
sudo sed -i '53s/Options FollowSymLinks -Indexes/Options +FollowSymLinks -Indexes/' /etc/apache2/sites-enabled/storydot-kr-unified.conf

# 설정 테스트
sudo apache2ctl configtest  # Syntax OK ✅
```

### 3. 서비스 활성화 및 재시작
```bash
# XPSwap 사이트 활성화
sudo a2ensite xpswap

# Apache 재로드
sudo systemctl reload apache2

# PM2 상태 확인
pm2 list  # xpswap-api: online ✅
```

### 4. 권한 설정
```bash
# 디렉토리 권한 수정
sudo chown -R www-data:www-data /var/www/storage/xpswap/client/dist
sudo chmod -R 755 /var/www/storage/xpswap/client/dist

# .htaccess 파일 추가 (WordPress 간섭 차단)
sudo cp xpswap_htaccess client/dist/.htaccess
sudo chown www-data:www-data client/dist/.htaccess
```

## ✅ 최종 확인

### 1. 웹사이트 정상 작동
```bash
# 메인 페이지
curl -s https://trendy.storydot.kr/xpswap/ | head -10
# 결과: React 앱 HTML 정상 출력 ✅

# API 헬스 체크
curl -s https://trendy.storydot.kr/xpswap/api/health
# 결과: {"