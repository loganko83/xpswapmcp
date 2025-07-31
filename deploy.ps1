# XPSwap Windows 자동 배포 스크립트
# 사용법: .\deploy.ps1

Write-Host "🚀 XPSwap 자동 배포 시작..." -ForegroundColor Green

try {
    # 1. Git 상태 확인
    Write-Host "📋 Git 상태 확인..." -ForegroundColor Yellow
    git status

    # 2. 변경사항 커밋
    Write-Host "💾 변경사항 커밋..." -ForegroundColor Yellow
    $commitMessage = Read-Host "커밋 메시지를 입력하세요"
    git add .
    try {
        git commit -m $commitMessage
    } catch {
        Write-Host "새로운 변경사항이 없습니다." -ForegroundColor Gray
    }

    # 3. GitHub에 푸시
    Write-Host "📤 GitHub에 푸시..." -ForegroundColor Yellow
    git push origin main

    # 4. 로컬 빌드
    Write-Host "🔨 프로덕션 빌드..." -ForegroundColor Yellow
    npm run build:production

    # 5. 서버 배포
    Write-Host "🌐 서버 배포..." -ForegroundColor Yellow
    
    $sshScript = @"
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
"@

    # SSH를 통해 서버 명령 실행
    $sshScript | ssh ubuntu@trendy.storydot.kr

    # 6. 배포 확인
    Write-Host "🔍 배포 확인..." -ForegroundColor Yellow
    Write-Host "다음 URL들을 확인해주세요:" -ForegroundColor Cyan
    Write-Host "- 메인 사이트: https://trendy.storydot.kr/xpswap/" -ForegroundColor White
    Write-Host "- API 헬스체크: https://trendy.storydot.kr/xpswap/api/health" -ForegroundColor White
    Write-Host "- 가격 API: https://trendy.storydot.kr/xpswap/api/xp-price" -ForegroundColor White

    Write-Host "🎉 배포 완료!" -ForegroundColor Green

} catch {
    Write-Host "❌ 오류 발생: $_" -ForegroundColor Red
    exit 1
}
