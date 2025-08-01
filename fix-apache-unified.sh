#!/bin/bash
# XPSwap 통합 수정 스크립트 - 하얀화면 문제 완전 해결
# 실행: sudo bash fix-apache-unified.sh

echo "=========================================="
echo "XPSwap 하얀화면 문제 해결 스크립트 시작"
echo "실행 시간: $(date)"
echo "=========================================="

# 변수 설정
PROJECT_DIR="/var/www/storage/xpswap"
APACHE_CONF="/etc/apache2/sites-available/xpswap.conf"
BACKUP_DIR="/var/www/storage/backups/$(date +%Y%m%d_%H%M%S)"

# 1. 백업 생성
echo -e "\n1. 백업 생성 중..."
mkdir -p "$BACKUP_DIR"
if [ -f "$APACHE_CONF" ]; then
    cp "$APACHE_CONF" "$BACKUP_DIR/xpswap.conf.backup"
    echo "✅ Apache 설정 백업 완료: $BACKUP_DIR/xpswap.conf.backup"
fi

# 2. 프로젝트 업데이트
echo -e "\n2. 프로젝트 업데이트 중..."
cd "$PROJECT_DIR" || exit 1

echo "Git 상태 확인..."
git status

echo "최신 코드 다운로드..."
git pull origin main

echo "의존성 설치..."
npm install --legacy-peer-deps

# 3. 클라이언트 빌드
echo -e "\n3. 클라이언트 빌드 중..."
npm run build:client

# 빌드 결과 확인
if [ ! -f "client/dist/index.html" ]; then
    echo "❌ 클라이언트 빌드 실패 - index.html이 생성되지 않음"
    echo "수동 빌드 시도..."
    cd client
    npm run build
    cd ..
    
    if [ ! -f "client/dist/index.html" ]; then
        echo "❌ 클라이언트 빌드 완전 실패 - 수동 확인 필요"
        exit 1
    fi
fi

echo "✅ 클라이언트 빌드 완료"
ls -la client/dist/

# 4. 서버 빌드
echo -e "\n4. 서버 빌드 중..."
npm run build:server
echo "✅ 서버 빌드 완료"

# 5. Apache 설정 수정
echo -e "\n5. Apache 설정 수정 중..."
cat > "$APACHE_CONF" << 'EOF'
# XPSwap DEX Configuration - Fixed for React SPA
# Updated: 2025-08-01

# API Proxy - MUST come before Alias
ProxyRequests Off
ProxyPreserveHost On
ProxyPass /xpswap/api http://localhost:5000/xpswap/api
ProxyPassReverse /xpswap/api http://localhost:5000/xpswap/api

# Static files - client/dist directory (FIXED PATH)
Alias /xpswap /var/www/storage/xpswap/client/dist

<Directory /var/www/storage/xpswap/client/dist>
    Options FollowSymLinks
    AllowOverride None
    Require all granted
    DirectoryIndex index.html
    
    # React Router Support - Handle SPA routing
    RewriteEngine On
    RewriteBase /xpswap
    
    # Skip API routes from React Router
    RewriteCond %{REQUEST_URI} !^/xpswap/api/
    
    # Serve existing files and directories directly
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    
    # Route everything else to index.html for React Router
    RewriteRule ^.*$ /xpswap/index.html [L]
</Directory>

# Security headers
<Directory /var/www/storage/xpswap/client/dist>
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</Directory>

# Cache control for static assets
<Directory /var/www/storage/xpswap/client/dist/assets>
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
    Header append Cache-Control "public, immutable"
</Directory>
EOF

echo "✅ Apache 설정 파일 생성 완료"

# 6. 파일 권한 설정
echo -e "\n6. 파일 권한 설정 중..."
chown -R www-data:www-data "$PROJECT_DIR/client/dist/"
chmod -R 755 "$PROJECT_DIR/client/dist/"
echo "✅ 파일 권한 설정 완료"

# 7. Apache 설정 테스트 및 재로드
echo -e "\n7. Apache 설정 테스트 중..."
if apache2ctl configtest; then
    echo "✅ Apache 설정 테스트 통과"
    
    # Apache 모듈 활성화
    a2enmod rewrite headers expires
    a2ensite xpswap
    
    systemctl reload apache2
    echo "✅ Apache 재로드 완료"
else
    echo "❌ Apache 설정 오류 - 백업에서 복원"
    if [ -f "$BACKUP_DIR/xpswap.conf.backup" ]; then
        cp "$BACKUP_DIR/xpswap.conf.backup" "$APACHE_CONF"
        systemctl reload apache2
    fi
    exit 1
fi

# 8. PM2 프로세스 재시작
echo -e "\n8. PM2 프로세스 재시작 중..."
cd "$PROJECT_DIR"
pm2 stop xpswap-api 2>/dev/null || echo "기존 프로세스 없음"
pm2 delete xpswap-api 2>/dev/null || echo "기존 프로세스 삭제"
pm2 start ecosystem.config.js --env production
echo "✅ PM2 프로세스 재시작 완료"

# 9. 서비스 상태 확인
echo -e "\n9. 서비스 상태 확인 중..."
sleep 5

echo "PM2 프로세스 상태:"
pm2 list | grep xpswap

echo -e "\nAPI 헬스체크:"
curl -s http://localhost:5000/xpswap/api/health | head -5 || echo "로컬 API 연결 실패"

echo -e "\n프로덕션 API 테스트:"
curl -s https://trendy.storydot.kr/xpswap/api/health | head -5 || echo "프로덕션 API 연결 실패"

echo -e "\n정적 파일 접근 테스트:"
curl -I https://trendy.storydot.kr/xpswap/ 2>/dev/null | head -3 || echo "정적 파일 접근 실패"

# 10. 최종 확인 및 정리
echo -e "\n10. 최종 확인..."
if [ -f "$PROJECT_DIR/client/dist/index.html" ] && pm2 list | grep -q xpswap; then
    echo "✅ 모든 설정이 완료되었습니다!"
    echo ""
    echo "🎉 XPSwap 서비스 상태:"
    echo "   📱 웹사이트: https://trendy.storydot.kr/xpswap/"
    echo "   🔌 API: https://trendy.storydot.kr/xpswap/api/health"
    echo "   📊 PM2 상태: $(pm2 list | grep xpswap | awk '{print $2, $10}')"
    echo ""
    echo "🔍 브라우저에서 확인해보세요!"
    echo "   1. https://trendy.storydot.kr/xpswap/ 접속"
    echo "   2. F5로 새로고침 (캐시 클리어)"
    echo "   3. F12 개발자 도구에서 에러 확인"
else
    echo "❌ 일부 설정이 실패했습니다. 수동 확인이 필요합니다."
    echo "로그 확인: pm2 logs xpswap-api --lines 20"
fi

echo -e "\n=========================================="
echo "XPSwap 수정 스크립트 완료 - $(date)"
echo "백업 위치: $BACKUP_DIR"
echo "=========================================="
