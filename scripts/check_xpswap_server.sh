#!/bin/bash

# XPSwap 서버 환경 점검 스크립트
# 사용법: bash check_xpswap_server.sh

echo "🔍 XPSwap 서버 환경 점검 시작..."
echo "================================"

# 1. Node.js 프로세스 확인
echo "1️⃣ PM2 프로세스 상태:"
pm2 list | grep xpswap

# 2. 포트 확인
echo -e "\n2️⃣ 포트 5000 사용 확인:"
sudo netstat -tlnp | grep :5000

# 3. API 헬스체크
echo -e "\n3️⃣ API 헬스체크:"
curl -s http://localhost:5000/api/health | jq . || echo "❌ API 응답 없음"

# 4. 환경변수 확인
echo -e "\n4️⃣ 환경변수 확인:"
cd /var/www/storage/xpswap
if [ -f .env.production ]; then
    echo "✅ .env.production 파일 존재"
    grep -E "NODE_ENV|PORT|BASE_PATH" .env.production
else
    echo "❌ .env.production 파일 없음"
fi

# 5. 빌드 파일 확인
echo -e "\n5️⃣ 빌드 파일 확인:"
if [ -d "dist" ]; then
    echo "✅ 서버 빌드 (dist/) 존재"
    ls -la dist/index.js | head -1
else
    echo "❌ 서버 빌드 없음"
fi

if [ -d "client/dist" ]; then
    echo "✅ 클라이언트 빌드 (client/dist/) 존재"
    ls -la client/dist/index.html | head -1
else
    echo "❌ 클라이언트 빌드 없음"
fi

# 6. 심볼릭 링크 확인
echo -e "\n6️⃣ 심볼릭 링크 확인:"
ls -la /var/www/storage/html_backup/xpswap

# 7. Apache 모듈 확인
echo -e "\n7️⃣ Apache 모듈 상태:"
apache2ctl -M | grep -E "proxy_module|rewrite_module" | head -5

# 8. Apache 설정 확인
echo -e "\n8️⃣ XPSwap Apache 설정:"
grep -n "xpswap" /etc/apache2/sites-available/000-default-le-ssl.conf | head -10

# 9. 외부 API 접근 테스트
echo -e "\n9️⃣ 외부 API 접근 테스트:"
echo -n "crypto-ticker: "
curl -s -o /dev/null -w "%{http_code}" https://trendy.storydot.kr/xpswap/api/crypto-ticker
echo ""

echo -n "health: "
curl -s -o /dev/null -w "%{http_code}" https://trendy.storydot.kr/xpswap/api/health
echo ""

echo -n "xp-price: "
curl -s -o /dev/null -w "%{http_code}" https://trendy.storydot.kr/xpswap/api/xp-price
echo ""

# 10. 로그 마지막 에러 확인
echo -e "\n🔟 최근 에러 로그:"
echo "PM2 에러 로그:"
pm2 logs xpswap-api --err --lines 5 --nostream 2>/dev/null || echo "PM2 로그 없음"

echo -e "\nApache 에러 로그:"
sudo tail -5 /var/log/apache2/error.log | grep -i xpswap || echo "Apache 에러 없음"

echo -e "\n================================"
echo "✅ 점검 완료!"
