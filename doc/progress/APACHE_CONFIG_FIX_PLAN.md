# 🚨 Apache 설정 수정 계획 - WordPress 간섭 해결

## 📋 현재 문제 상황
- **DocumentRoot**: `/var/www/storage/html_backup` (WordPress)
- **XPSwap 경로**: `/var/www/storage/xpswap/client/dist/`
- **문제**: WordPress가 모든 `/xpswap/` 요청을 가로채고 있음

## 🎯 해결 방안

### 방안 1: Alias 우선순위 조정 (권장)
Apache 설정에서 `Alias` 지시문을 `ProxyPass`보다 위에 배치하여 정적 파일 우선 처리

```apache
# 정적 파일 먼저 처리
Alias /xpswap /var/www/storage/xpswap/client/dist

# API만 프록시
ProxyPass /xpswap/api http://localhost:5000/xpswap/api
ProxyPassReverse /xpswap/api http://localhost:5000/xpswap/api
```

### 방안 2: Directory Order 명시 (보조)
Directory 지시문에서 명시적 우선순위 설정

```apache
<Directory /var/www/storage/xpswap/client/dist>
    Options FollowSymLinks
    AllowOverride None
    Require all granted
    DirectoryIndex index.html
    Order Allow,Deny
    Allow from all
</Directory>
```

### 방안 3: RewriteRule 개선 (필수)
WordPress의 .htaccess가 XPSwap을 방해하지 않도록 조건 추가

```apache
RewriteEngine On
RewriteBase /xpswap

# WordPress .htaccess 무시
RewriteCond %{REQUEST_URI} !^/xpswap/
RewriteRule . - [S=10]

# XPSwap 라우팅
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^.*$ /xpswap/index.html [L]
```

## 🛠️ 구현 순서

1. **백업 생성**: 현재 Apache 설정 백업
2. **설정 수정**: storydot-kr-unified.conf 편집
3. **Apache 재시작**: sudo systemctl restart apache2
4. **테스트**: https://trendy.storydot.kr/xpswap/ 접속 확인
5. **로그 확인**: 에러 로그 모니터링

## 📝 수정할 파일
- `/etc/apache2/sites-available/storydot-kr-unified.conf`

## ✅ 성공 기준
- [ ] XPSwap 메인 페이지 정상 로딩
- [ ] WordPress CSS 간섭 제거
- [ ] React 에러 해결
- [ ] 모든 정적 파일 올바른 경로로 로딩

---
*작성: 2025-08-01*
