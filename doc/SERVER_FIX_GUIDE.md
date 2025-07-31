# XPSwap 서버 수정 단계별 가이드

## 🚨 현재 문제
- https://trendy.storydot.kr/xpswap/ 접속 시 디렉터리 인덱스가 표시됨
- `index.html` 파일이 로드되지 않음
- Apache 설정에서 XPSwap 관련 설정 누락

## 🔧 즉시 수행해야 할 단계

### 1단계: 서버 접속 및 현재 상태 확인
```bash
ssh ubuntu@trendy.storydot.kr
cd /var/www/storage/xpswap
ls -la client/dist/
```

### 2단계: PM2 상태 확인
```bash
pm2 list
pm2 logs xpswap-api --lines 20
```

### 3단계: 클라이언트 빌드 파일 확인
```bash
# index.html 파일 존재 여부 확인
ls -la client/dist/index.html

# 만약 없다면 빌드 실행
npm run build
cp -r dist/public/* client/dist/
```

### 4단계: Apache 설정 수정 (가장 중요!)
```bash
# 설정 파일 백업
sudo cp /etc/apache2/sites-available/000-default-le-ssl.conf /etc/apache2/sites-available/000-default-le-ssl.conf.backup

# 설정 파일 편집
sudo nano /etc/apache2/sites-available/000-default-le-ssl.conf
```

**추가할 설정** (</VirtualHost> 태그 바로 위에 추가):
```apache
    # XPSwap Configuration
    ProxyPass /xpswap/api http://localhost:5000/api
    ProxyPassReverse /xpswap/api http://localhost:5000/api
    
    Alias /xpswap /var/www/storage/xpswap/client/dist
    <Directory /var/www/storage/xpswap/client/dist>
        Options -Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        DirectoryIndex index.html
        
        <IfModule mod_rewrite.c>
            RewriteEngine On
            RewriteBase /xpswap/
            RewriteCond %{REQUEST_URI} !^/xpswap/api
            RewriteCond %{REQUEST_FILENAME} !-f
            RewriteCond %{REQUEST_FILENAME} !-d
            RewriteRule . /xpswap/index.html [L]
        </IfModule>
    </Directory>
```

### 5단계: Apache 모듈 활성화
```bash
# 필요한 모듈들 활성화
sudo a2enmod proxy proxy_http rewrite headers expires

# 설정 테스트
sudo apache2ctl configtest
```

### 6단계: 서비스 재시작
```bash
# Apache 재시작
sudo systemctl restart apache2

# PM2 재시작
pm2 restart xpswap-api
```

### 7단계: 테스트
```bash
# API 테스트
curl https://trendy.storydot.kr/xpswap/api/health
curl https://trendy.storydot.kr/xpswap/api/crypto-ticker

# 웹페이지 테스트
curl -I https://trendy.storydot.kr/xpswap/
```

## 🚀 한 번에 실행할 수 있는 명령어 (서버에서)

```bash
# 전체 수정 스크립트 실행
cd /var/www/storage/xpswap && \
pm2 restart xpswap-api && \
sudo a2enmod proxy proxy_http rewrite headers expires && \
sudo systemctl restart apache2 && \
echo "✅ 기본 설정 완료. 이제 Apache 설정을 수동으로 추가하세요."
```

## 📝 문제 해결 체크리스트

- [ ] PM2 프로세스가 실행 중인지 확인
- [ ] client/dist/index.html 파일이 존재하는지 확인
- [ ] Apache에 XPSwap 설정이 추가되었는지 확인
- [ ] Apache 모듈들이 활성화되었는지 확인
- [ ] 서비스들이 재시작되었는지 확인
- [ ] API 엔드포인트가 정상 응답하는지 확인

## 🔍 문제 진단 명령어

```bash
# 전체 상태 확인
echo "=== PM2 Status ===" && pm2 list | grep xpswap && \
echo -e "\n=== Apache Modules ===" && apache2ctl -M | grep -E "(proxy|rewrite)" && \
echo -e "\n=== XPSwap Config ===" && grep -A 5 -B 5 "xpswap" /etc/apache2/sites-available/000-default-le-ssl.conf && \
echo -e "\n=== Client Files ===" && ls -la /var/www/storage/xpswap/client/dist/ | head -10
```

이 가이드대로 단계별로 수행하면 문제가 해결될 것입니다!
