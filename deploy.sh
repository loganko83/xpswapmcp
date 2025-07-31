#!/bin/bash

# XPSwap 자동 배포 스크립트
# 사용법: ./deploy.sh

set -e  # 오류 발생 시 스크립트 중단

echo "🚀 XPSwap 자동 배포 시작..."

# 1. Git 상태 확인
echo "📋 Git 상태 확인..."
git status

# 2. 변경사항 커밋
echo "💾 변경사항 커밋..."
read -p "커밋 메시지를 입력하세요: " commit_message
git add .
git commit -m "$commit_message" || echo "새로운 변경사항이 없습니다."

# 3. GitHub에 푸시
echo "📤 GitHub에 푸시..."
git push origin main

# 4. 로컬 빌드
echo "🔨 프로덕션 빌드..."
npm run build:production

# 5. 서버 접속 및 배포
echo "🌐 서버 배포..."
ssh ubuntu@trendy.storydot.kr << 'EOF'
  cd /var/www/storage/xpswap
  
  echo "📥 최신 코드 가져오기..."
  git pull origin main
  
  echo "📦 의존성 설치..."
  npm install --production
  
  echo "🔨 서버 빌드..."
  npm run build:production
  
  echo "🔄 PM2 프로세스 재시작..."
  pm2 stop xpswap-api || true
  pm2 start ecosystem.config.js --env production
  pm2 save
  
  echo "📊 PM2 상태 확인..."
  pm2 list
  
  echo "📋 로그 확인..."
  pm2 logs xpswap-api --lines 10 --nostream
  
  echo "✅ 배포 완료!"
EOF

# 6. 배포 확인
echo "🔍 배포 확인..."
echo "다음 URL들을 확인해주세요:"
echo "- 메인 사이트: https://trendy.storydot.kr/xpswap/"
echo "- API 헬스체크: https://trendy.storydot.kr/xpswap/api/health"
echo "- 가격 API: https://trendy.storydot.kr/xpswap/api/xp-price"

echo "🎉 배포 완료!"
