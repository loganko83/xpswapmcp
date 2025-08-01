#!/bin/bash

# XPSwap Apache 설정 수정 스크립트
# 실행 방법: sudo bash fix-apache-config.sh

echo "🚀 XPSwap Apache 설정 수정 시작..."

# 1. 현재 상태 확인
echo "📋 현재 디렉토리 구조 확인:"
cd /var/www/storage/xpswap
pwd
ls -la

echo "📁 client/dist 디렉토리 확인:"
ls -la client/dist/

# 2. Git에서 최신 코드 가져오기
echo "📥 Git에서 최신 코드 업데이트..."
git pull origin main

# 3. 빌드 (필요한 경우)
echo "🔨 프로젝트 빌드..."
npm install --legacy-peer-deps
npm run build

# 4. Apache 설정 파일 확인
echo "🔍 Apache 설정 파일 위치 확인..."
find /etc/apache2/sites-available/ -name "*storydot*" -o -name "*xpswap*"

# 5. 권한 설정
echo "🔐 파일 권한 설정..."
chmod -R 755 /var/www/storage/xpswap/client/dist/
chown -R www-data:www-data /var/www/storage/xpswap/client/dist/

# 6. Apache 설정 테스트
echo "✅ Apache 설정 테스트..."
apache2ctl configtest

# 7. Apache 재시작
echo "🔄 Apache 재시작..."
systemctl reload apache2

echo "✅ 설정 완료! https://trendy.storydot.kr/xpswap/ 확인해주세요."

# 8. 상태 확인
echo "📊 최종 상태 확인:"
curl -I https://trendy.storydot.kr/xpswap/