#!/bin/bash
# XPSwap 서버 진단 스크립트
# 실행: bash server-diagnosis.sh > diagnosis-report.log 2>&1

echo "=========================================="
echo "XPSwap 서버 진단 리포트 - $(date)"
echo "=========================================="

echo -e "\n1. 현재 디렉토리 및 파일 구조 확인"
echo "----------------------------------------"
pwd
echo -e "\n프로젝트 루트 구조:"
ls -la

echo -e "\n2. 빌드된 클라이언트 파일 확인"
echo "----------------------------------------"
if [ -d "client/dist" ]; then
    echo "✅ client/dist 디렉토리 존재"
    ls -la client/dist/
    if [ -f "client/dist/index.html" ]; then
        echo "✅ index.html 파일 존재"
        echo "index.html 크기: $(stat -c%s client/dist/index.html) bytes"
    else
        echo "❌ index.html 파일 없음"
    fi
else
    echo "❌ client/dist 디렉토리 없음"
fi

echo -e "\n3. 서버 빌드 파일 확인"
echo "----------------------------------------"
if [ -d "dist" ]; then
    echo "✅ dist 디렉토리 존재"
    ls -la dist/
else
    echo "❌ dist 디렉토리 없음"
fi

echo -e "\n4. PM2 프로세스 상태 확인"
echo "----------------------------------------"
pm2 list | grep xpswap || echo "XPSwap PM2 프로세스 없음"

echo -e "\n5. Apache 설정 확인"
echo "----------------------------------------"
if [ -f "/etc/apache2/sites-available/xpswap.conf" ]; then
    echo "✅ Apache 설정 파일 존재"
    echo "설정 내용:"
    cat /etc/apache2/sites-available/xpswap.conf
else
    echo "❌ Apache 설정 파일 없음"
fi

echo -e "\n6. 포트 사용 현황 확인"
echo "----------------------------------------"
netstat -tulpn | grep :5000 || echo "포트 5000 사용 중인 프로세스 없음"

echo -e "\n7. 환경 변수 확인"
echo "----------------------------------------"
if [ -f ".env" ]; then
    echo "✅ .env 파일 존재"
    echo ".env 내용 (민감 정보 제외):"
    grep -v "PASSWORD\|SECRET\|KEY" .env || echo ".env 파일이 비어있거나 읽을 수 없음"
else
    echo "❌ .env 파일 없음"
fi

echo -e "\n8. Node.js 및 npm 버전 확인"
echo "----------------------------------------"
node --version
npm --version

echo -e "\n9. Git 상태 확인"
echo "----------------------------------------"
git status --short
echo "마지막 커밋:"
git log --oneline -1

echo -e "\n10. 디스크 사용량 확인"
echo "----------------------------------------"
df -h /var/www/storage/

echo -e "\n11. 메모리 사용량 확인"
echo "----------------------------------------"
free -h

echo -e "\n12. API 테스트"
echo "----------------------------------------"
echo "로컬 API 테스트:"
curl -s http://localhost:5000/xpswap/api/health 2>/dev/null || echo "로컬 API 연결 실패"

echo "프로덕션 API 테스트:"
curl -s https://trendy.storydot.kr/xpswap/api/health 2>/dev/null || echo "프로덕션 API 연결 실패"

echo -e "\n13. 정적 파일 접근 테스트"
echo "----------------------------------------"
curl -I https://trendy.storydot.kr/xpswap/ 2>/dev/null | head -5 || echo "정적 파일 접근 실패"

echo -e "\n=========================================="
echo "진단 완료 - $(date)"
echo "=========================================="
