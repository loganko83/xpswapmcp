#!/bin/bash

echo "🔧 XPSwap 통합 Apache 설정 수정 스크립트 v2.0"
echo "================================================"
echo "목표: storydot-kr-unified.conf에서 XPSwap 설정 수정"
echo "문제: 하얀 화면 → 정상 XPSwap 서비스 표시"
echo "================================================"

# 백업 생성
echo -e "\n💾 1. 설정 파일 백업 생성"
echo "-------------------------"
BACKUP_DIR="/var/www/storage/backups/$(date +%Y%m%d_%H%M%S)"
sudo mkdir -p "$BACKUP_DIR"
sudo cp /etc/apache2/sites-available/storydot-kr-unified.conf "$BACKUP_DIR/"
echo "백업 완료: $BACKUP_DIR/storydot-kr-unified.conf"

# XPSwap 프로젝트 업데이트
echo -e "\n📥 2. XPSwap 프로젝트 업데이트"
echo "-----------------------------"
cd /var/www/storage/xpswap
echo "Git pull 실행..."
git pull origin main

echo "의존성 설치..."
npm install --legacy-peer-deps --production

echo "프로젝트 빌드..."
npm run build

# client/dist 디렉토리 확인 및 생성
echo -e "\n📁 3. 빌드 결과 확인"
echo "--------------------"
if [ -d "client/dist" ] && [ -f "client/dist/index.html" ]; then
    echo "✅ client/dist/index.html 존재 확인"
    echo "파일 크기: $(du -h client/dist/index.html)"
else
    echo "❌ client/dist/index.html이 존재하지 않음"
    echo "Vite 빌드 재시도..."
    cd client
    npm run build
    cd ..
fi

# Apache 설정 수정
echo -e "\n🔧 4. Apache 설정 수정"
echo "----------------------"

# 현재 XPSwap 설정 확인
echo "현재 XPSwap 설정 확인:"
grep -n "xpswap" /etc/apache2/sites-available/storydot-kr-unified.conf || echo "XPSwap 설정이 없음"

# 새로운 XPSwap 설정 생성
cat > /tmp/xpswap-apache-config.txt << 'EOF'
    # XPSwap DEX Service Configuration
    # API Proxy - MUST come before Alias to avoid conflicts
    ProxyRequests Off
    ProxyPreserveHost On
    ProxyPass /xpswap/api http://localhost:5000/xpswap/api
    ProxyPassReverse /xpswap/api http://localhost:5000/xpswap/api
    
    # Static files - serve React build from client/dist
    Alias /xpswap /var/www/storage/xpswap/client/dist
    
    <Directory /var/www/storage/xpswap/client/dist>
        Options FollowSymLinks
        AllowOverride None
        Require all granted
        DirectoryIndex index.html
        
        # Enable rewrite engine for React Router
        RewriteEngine On
        RewriteBase /xpswap
        
        # Cache static assets
        <FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
            ExpiresActive On
            ExpiresDefault "access plus 1 month"
            Header set Cache-Control "public, immutable"
        </FilesMatch>
        
        # Security headers
        Header always set X-Content-Type-Options nosniff
        Header always set X-Frame-Options DENY
        Header always set X-XSS-Protection "1; mode=block"
        Header always set Referrer-Policy "strict-origin-when-cross-origin"
        
        # Handle React Router - serve index.html for all routes except files
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteCond %{REQUEST_URI} !^/xpswap/api/
        RewriteRule ^.*$ /xpswap/index.html [L]
    </Directory>
    
    # API health check without authentication
    <Location /xpswap/api/health>
        Require all granted
    </Location>
EOF

echo "새로운 XPSwap 설정 준비 완료"

# 기존 XPSwap 설정 제거 및 새 설정 추가
echo "Apache 설정 파일 수정 중..."

# 임시 파일에 새 설정 생성
python3 << 'PYTHON_SCRIPT'
import re

# 설정 파일 읽기
with open('/etc/apache2/sites-available/storydot-kr-unified.conf', 'r') as f:
    config_content = f.read()

# 새 XPSwap 설정 읽기
with open('/tmp/xpswap-apache-config.txt', 'r') as f:
    new_xpswap_config = f.read()

# 기존 XPSwap 설정 제거 (주석 포함)
# XPSwap 관련 모든 라인 제거
lines = config_content.split('\n')
filtered_lines = []
skip_xpswap = False

for line in lines:
    line_lower = line.lower()
    
    # XPSwap 관련 라인 식별
    if any(keyword in line_lower for keyword in ['xpswap', '/xpswap']):
        skip_xpswap = True
        continue
    
    # Directory나 Location 블록이 끝나면 스킵 해제
    if skip_xpswap and (line.strip() == '</Directory>' or line.strip() == '</Location>'):
        skip_xpswap = False
        continue
    
    # 스킵 중이 아니면 라인 유지
    if not skip_xpswap:
        filtered_lines.append(line)

# 새 설정을 </VirtualHost> 바로 앞에 삽입
new_config = []
for line in filtered_lines:
    if line.strip() == '</VirtualHost>':
        # XPSwap 설정을 </VirtualHost> 앞에 추가
        new_config.append('')
        new_config.append(new_xpswap_config.rstrip())
        new_config.append('')
    new_config.append(line)

# 새 설정 파일 저장
with open('/tmp/storydot-kr-unified-new.conf', 'w') as f:
    f.write('\n'.join(new_config))

print("✅ Apache 설정 파일 생성 완료")
PYTHON_SCRIPT

# 설정 파일 교체
sudo cp /tmp/storydot-kr-unified-new.conf /etc/apache2/sites-available/storydot-kr-unified.conf
echo "Apache 설정 파일 업데이트 완료"

# 권한 설정
echo -e "\n🔐 5. 파일 권한 설정"
echo "--------------------"
sudo chown -R www-data:www-data /var/www/storage/xpswap/client/dist/
sudo chmod -R 755 /var/www/storage/xpswap/client/dist/
echo "권한 설정 완료"

# Apache 설정 테스트
echo -e "\n🔍 6. Apache 설정 테스트"
echo "------------------------"
if sudo apache2ctl configtest; then
    echo "✅ Apache 설정 문법 검사 통과"
else
    echo "❌ Apache 설정 오류 발견"
    echo "백업에서 복원..."
    sudo cp "$BACKUP_DIR/storydot-kr-unified.conf" /etc/apache2/sites-available/
    exit 1
fi

# PM2 프로세스 확인 및 재시작
echo -e "\n🚀 7. PM2 프로세스 관리"
echo "----------------------"
if command -v pm2 &> /dev/null; then
    echo "PM2 프로세스 상태:"
    pm2 list
    
    echo "XPSwap API 재시작..."
    pm2 stop xpswap-api 2>/dev/null || echo "xpswap-api 프로세스가 실행 중이 아님"
    
    cd /var/www/storage/xpswap
    pm2 start ecosystem.config.js --env production
    pm2 save
    
    echo "PM2 프로세스 재시작 완료"
else
    echo "PM2가 설치되지 않음"
fi

# Apache 재시작
echo -e "\n🔄 8. Apache 서비스 재시작"
echo "-------------------------"
sudo systemctl reload apache2
echo "Apache 서비스 재로드 완료"

# 설정 확인
echo -e "\n✅ 9. 최종 확인"
echo "----------------"
echo "XPSwap 디렉토리 구조:"
ls -la /var/www/storage/xpswap/client/dist/ | head -5

echo -e "\nAPI 테스트:"
sleep 3  # 서비스 시작 대기
curl -s http://localhost:5000/xpswap/api/health || echo "API 응답 없음"

echo -e "\n웹 접근 테스트:"
curl -s -I https://trendy.storydot.kr/xpswap/ | head -3

echo -e "\n================================================"
echo "🎯 XPSwap 설정 수정 완료!"
echo "================================================"
echo "다음 URL에서 확인하세요:"
echo "• 메인 페이지: https://trendy.storydot.kr/xpswap/"
echo "• API 상태: https://trendy.storydot.kr/xpswap/api/health"
echo ""
echo "문제가 지속되면 다음을 확인하세요:"
echo "1. /var/log/apache2/error.log"
echo "2. pm2 logs xpswap-api"
echo "3. 브라우저 개발자 도구 (F12)"
echo "================================================"