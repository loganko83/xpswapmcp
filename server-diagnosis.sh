#!/bin/bash

echo "🔍 XPSwap 서비스 진단 스크립트 v2.0"
echo "================================================"
echo "날짜: $(date)"
echo "서버: trendy.storydot.kr"
echo "문제: XPSwap (/xpswap) 하얀 화면 표시"
echo "================================================"

# 1. 서버 기본 상태 확인
echo -e "\n📊 1. 서버 기본 상태"
echo "--------------------"
echo "디스크 사용량:"
df -h | grep -E "/$|/var"
echo -e "\n메모리 사용량:"
free -h
echo -e "\n시스템 로드:"
uptime

# 2. Apache 설정 파일 확인
echo -e "\n🔧 2. Apache 설정 확인"
echo "------------------------"
echo "활성화된 사이트:"
ls -la /etc/apache2/sites-enabled/
echo -e "\nApache 설정 테스트:"
apache2ctl configtest
echo -e "\nApache 모듈 확인:"
apache2ctl -M | grep -E "rewrite|proxy|ssl"

# 3. storydot-kr-unified.conf 설정 확인
echo -e "\n📝 3. 통합 설정 파일 내용"
echo "----------------------------"
if [ -f "/etc/apache2/sites-available/storydot-kr-unified.conf" ]; then
    echo "storydot-kr-unified.conf 파일 존재 ✓"
    echo -e "\nXPSwap 관련 설정:"
    grep -A 20 -B 5 "xpswap" /etc/apache2/sites-available/storydot-kr-unified.conf || echo "❌ xpswap 설정을 찾을 수 없음"
else
    echo "❌ storydot-kr-unified.conf 파일이 존재하지 않음"
fi

# 4. XPSwap 프로젝트 디렉토리 구조 확인
echo -e "\n📁 4. XPSwap 디렉토리 구조"
echo "-----------------------------"
if [ -d "/var/www/storage/xpswap" ]; then
    echo "프로젝트 디렉토리 존재 ✓"
    echo -e "\n프로젝트 루트 내용:"
    ls -la /var/www/storage/xpswap/
    
    echo -e "\nclient/dist 디렉토리 확인:"
    if [ -d "/var/www/storage/xpswap/client/dist" ]; then
        echo "client/dist 존재 ✓"
        ls -la /var/www/storage/xpswap/client/dist/
        
        echo -e "\nindex.html 파일 확인:"
        if [ -f "/var/www/storage/xpswap/client/dist/index.html" ]; then
            echo "index.html 존재 ✓"
            echo "파일 크기: $(du -h /var/www/storage/xpswap/client/dist/index.html | cut -f1)"
            echo "수정 시간: $(stat -c %y /var/www/storage/xpswap/client/dist/index.html)"
        else
            echo "❌ index.html 파일이 존재하지 않음"
        fi
    else
        echo "❌ client/dist 디렉토리가 존재하지 않음"
        echo "dist 디렉토리 확인:"
        ls -la /var/www/storage/xpswap/dist/ 2>/dev/null || echo "dist 디렉토리도 없음"
    fi
else
    echo "❌ XPSwap 프로젝트 디렉토리가 존재하지 않음"
fi

# 5. PM2 프로세스 상태 확인
echo -e "\n🚀 5. PM2 프로세스 상태"
echo "------------------------"
if command -v pm2 &> /dev/null; then
    echo "PM2 프로세스 목록:"
    pm2 list
    echo -e "\nXPSwap API 프로세스 상태:"
    pm2 show xpswap-api 2>/dev/null || echo "❌ xpswap-api 프로세스를 찾을 수 없음"
else
    echo "❌ PM2가 설치되지 않음"
fi

# 6. 네트워크 포트 확인
echo -e "\n🌐 6. 네트워크 포트 상태"
echo "-------------------------"
echo "포트 5000 (XPSwap API) 상태:"
netstat -tlnp | grep :5000 || echo "❌ 포트 5000이 열려있지 않음"
echo -e "\n포트 80, 443 상태:"
netstat -tlnp | grep -E ":80|:443"

# 7. API 엔드포인트 테스트
echo -e "\n🔗 7. API 엔드포인트 테스트"
echo "----------------------------"
echo "로컬 API 테스트:"
curl -s -w "HTTP Status: %{http_code}, Time: %{time_total}s\n" http://localhost:5000/xpswap/api/health || echo "❌ 로컬 API 접근 실패"

echo -e "\n외부 API 테스트:"
curl -s -w "HTTP Status: %{http_code}, Time: %{time_total}s\n" https://trendy.storydot.kr/xpswap/api/health || echo "❌ 외부 API 접근 실패"

# 8. 웹 접근 테스트
echo -e "\n🌍 8. 웹 접근 테스트"
echo "--------------------"
echo "메인 사이트 (trendy.storydot.kr):"
curl -s -I https://trendy.storydot.kr | head -5

echo -e "\nXPSwap 서비스 (/xpswap):"
curl -s -I https://trendy.storydot.kr/xpswap/ | head -5

echo -e "\nSignchain 서비스 (/signchain):"
curl -s -I https://trendy.storydot.kr/signchain/ | head -5

# 9. 로그 파일 확인
echo -e "\n📋 9. 로그 파일 확인"
echo "--------------------"
echo "Apache 에러 로그 (최근 10줄):"
tail -n 10 /var/log/apache2/error.log 2>/dev/null || echo "에러 로그 접근 불가"

echo -e "\nApache 액세스 로그에서 XPSwap 관련 (최근 5줄):"
tail -n 100 /var/log/apache2/access.log 2>/dev/null | grep xpswap | tail -5 || echo "XPSwap 관련 액세스 로그 없음"

# 10. 권한 확인
echo -e "\n🔐 10. 파일 권한 확인"
echo "----------------------"
if [ -d "/var/www/storage/xpswap" ]; then
    echo "프로젝트 디렉토리 권한:"
    ls -ld /var/www/storage/xpswap/
    
    if [ -d "/var/www/storage/xpswap/client/dist" ]; then
        echo "client/dist 권한:"
        ls -ld /var/www/storage/xpswap/client/dist/
        echo "client/dist 내부 파일들:"
        ls -la /var/www/storage/xpswap/client/dist/ | head -10
    fi
fi

echo -e "\n================================================"
echo "🎯 진단 완료!"
echo "================================================"
echo "이 로그를 검토하여 문제점을 파악하세요:"
echo "1. Apache 설정에서 XPSwap 경로 확인"
echo "2. client/dist 디렉토리와 index.html 존재 여부"
echo "3. PM2 프로세스 실행 상태"
echo "4. API 엔드포인트 응답"
echo "5. 파일 권한 설정"
echo "================================================"