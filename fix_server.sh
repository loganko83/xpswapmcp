#!/bin/bash
# XPSwap 서버 수정 스크립트

echo "🔧 XPSwap 서버 문제 해결 시작..."

# 1. 현재 상태 확인
echo "1. 현재 파일 구조 확인..."
cd /var/www/storage/xpswap
ls -la client/dist/

# 2. Apache 설정 확인
echo "2. Apache 설정 확인..."
grep -A 10 -B 5 "xpswap" /etc/apache2/sites-available/000-default-le-ssl.conf || echo "XPSwap 설정 없음"

# 3. PM2 상태 확인
echo "3. PM2 상태 확인..."
pm2 list | grep xpswap

# 4. API 상태 확인
echo "4. API 상태 확인..."
curl -s http://localhost:5000/api/health && echo " ✅ API 정상" || echo " ❌ API 실패"

# 5. 클라이언트 파일 확인
echo "5. 클라이언트 파일 확인..."
if [ -f "client/dist/index.html" ]; then
    echo "✅ index.html 존재"
    head -5 client/dist/index.html
else
    echo "❌ index.html 없음 - 빌드 필요"
    npm run build
    cp -r dist/public/* client/dist/
fi

# 6. Apache 모듈 활성화
echo "6. Apache 모듈 활성화..."
sudo a2enmod proxy proxy_http rewrite headers expires

# 7. Apache 설정에 XPSwap 설정 추가
echo "7. Apache 설정 수정..."
if ! grep -q "# XPSwap Configuration" /etc/apache2/sites-available/000-default-le-ssl.conf; then
    echo "Apache 설정에 XPSwap 설정 추가 중..."
    
    # 백업 생성
    sudo cp /etc/apache2/sites-available/000-default-le-ssl.conf /etc/apache2/sites-available/000-default-le-ssl.conf.backup_$(date +%Y%m%d_%H%M%S)
    
    # XPSwap 설정을 </VirtualHost> 태그 바로 앞에 추가
    sudo sed -i '/<\/VirtualHost>/i \
    # XPSwap Configuration\
    ProxyPass /xpswap/api http://localhost:5000/api\
    ProxyPassReverse /xpswap/api http://localhost:5000/api\
    \
    Alias /xpswap /var/www/storage/xpswap/client/dist\
    <Directory /var/www/storage/xpswap/client/dist>\
        Options -Indexes FollowSymLinks\
        AllowOverride All\
        Require all granted\
        DirectoryIndex index.html\
        \
        <IfModule mod_rewrite.c>\
            RewriteEngine On\
            RewriteBase /xpswap/\
            RewriteCond %{REQUEST_URI} !^/xpswap/api\
            RewriteCond %{REQUEST_FILENAME} !-f\
            RewriteCond %{REQUEST_FILENAME} !-d\
            RewriteRule . /xpswap/index.html [L]\
        </IfModule>\
    </Directory>' /etc/apache2/sites-available/000-default-le-ssl.conf
    
    echo "✅ Apache 설정 추가 완료"
else
    echo "✅ Apache 설정 이미 존재"
fi

# 8. Apache 설정 테스트
echo "8. Apache 설정 테스트..."
sudo apache2ctl configtest && echo "✅ Apache 설정 정상" || echo "❌ Apache 설정 오류"

# 9. 서비스 재시작
echo "9. 서비스 재시작..."
sudo systemctl restart apache2
pm2 restart xpswap-api

# 10. 최종 테스트
echo "10. 최종 테스트..."
sleep 5

echo "API 테스트 결과:"
echo -n "Health API: "
curl -s -o /dev/null -w "%{http_code}" https://trendy.storydot.kr/xpswap/api/health
echo ""

echo -n "Ticker API: "
curl -s -o /dev/null -w "%{http_code}" https://trendy.storydot.kr/xpswap/api/crypto-ticker
echo ""

echo -n "Static Files: "
curl -s -o /dev/null -w "%{http_code}" https://trendy.storydot.kr/xpswap/
echo ""

echo "🚀 수정 완료! 브라우저에서 https://trendy.storydot.kr/xpswap/ 을 확인해보세요."
