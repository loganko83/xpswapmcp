#!/bin/bash

# XPSwap 문제 진단 스크립트
# 실행 방법: bash diagnose-xpswap.sh

echo "🔍 XPSwap 문제 진단 시작..."

echo "=== 1. 서버 기본 정보 ==="
echo "현재 시간: $(date)"
echo "서버 hostname: $(hostname)"
echo "현재 사용자: $(whoami)"

echo -e "\n=== 2. 디렉토리 구조 확인 ==="
echo "프로젝트 루트:"
ls -la /var/www/storage/xpswap/

echo -e "\nclient/dist 디렉토리:"
if [ -d "/var/www/storage/xpswap/client/dist" ]; then
    ls -la /var/www/storage/xpswap/client/dist/
    echo "index.html 존재: $([ -f /var/www/storage/xpswap/client/dist/index.html ] && echo 'YES' || echo 'NO')"
else
    echo "❌ client/dist 디렉토리가 존재하지 않습니다!"
fi

echo -e "\n=== 3. Apache 설정 확인 ==="
echo "Apache 상태:"
systemctl is-active apache2 && echo "✅ Apache 실행 중" || echo "❌ Apache 중지됨"

echo -e "\nApache 설정 파일들:"
find /etc/apache2/sites-available/ -name "*storydot*" -o -name "*xpswap*" | head -5

echo -e "\n활성화된 사이트:"
ls -la /etc/apache2/sites-enabled/

echo -e "\n=== 4. PM2 프로세스 확인 ==="
if command -v pm2 &> /dev/null; then
    pm2 list | grep xpswap || echo "❌ XPSwap PM2 프로세스 없음"
else
    echo "❌ PM2가 설치되지 않음"
fi

echo -e "\n=== 5. 포트 확인 ==="
echo "포트 5000 사용 중인 프로세스:"
netstat -tlnp | grep :5000 || echo "포트 5000 사용 중인 프로세스 없음"

echo -e "\n=== 6. API 테스트 ==="
echo "로컬 API 테스트:"
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/xpswap/api/health && echo " - 로컬 API 응답 OK" || echo " - 로컬 API 응답 실패"

echo -e "\n외부 API 테스트:"
curl -s -o /dev/null -w "%{http_code}" https://trendy.storydot.kr/xpswap/api/health && echo " - 외부 API 응답 OK" || echo " - 외부 API 응답 실패"

echo -e "\n=== 7. 웹사이트 테스트 ==="
echo "메인 페이지 HTTP 응답 코드:"
curl -s -o /dev/null -w "%{http_code}" https://trendy.storydot.kr/xpswap/

echo -e "\nindex.html 직접 접근:"
curl -s -o /dev/null -w "%{http_code}" https://trendy.storydot.kr/xpswap/index.html

echo -e "\n=== 8. Apache 에러 로그 (최근 10줄) ==="
tail -n 10 /var/log/apache2/error.log | grep -i xpswap || echo "XPSwap 관련 에러 없음"

echo -e "\n✅ 진단 완료!"
echo "문제가 발견되면 fix-apache-config.sh 스크립트를 실행하세요."