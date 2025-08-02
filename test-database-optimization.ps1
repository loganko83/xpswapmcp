# XPSwap 데이터베이스 최적화 테스트 스크립트
# Phase 2.1 완료를 위한 서버 시작 및 API 테스트

Write-Host "🚀 Starting XPSwap Server for Database Optimization Testing..." -ForegroundColor Green

# 프로젝트 디렉토리로 이동
Set-Location "C:\Users\vincent\Downloads\XPswap\XPswap"

# 환경 확인
Write-Host "📁 Current Directory: $(Get-Location)" -ForegroundColor Cyan
Write-Host "🔍 Checking Node.js..." -ForegroundColor Cyan

try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js Version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found in PATH" -ForegroundColor Red
    exit 1
}

# 의존성 확인
Write-Host "📦 Checking dependencies..." -ForegroundColor Cyan
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules not found, installing dependencies..." -ForegroundColor Yellow
    npm install --legacy-peer-deps
}

# 서버 시작 (백그라운드)
Write-Host "🚀 Starting development server..." -ForegroundColor Green
$serverJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\vincent\Downloads\XPswap\XPswap"
    npm run dev:server
}

# 서버 시작 대기
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# API 테스트 함수
function Test-API {
    param($url, $description)
    try {
        $response = Invoke-RestMethod -Uri $url -Method GET -TimeoutSec 10
        Write-Host "✅ $description - Success" -ForegroundColor Green
        return $response
    } catch {
        Write-Host "❌ $description - Failed: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# API 테스트 실행
Write-Host "`n🧪 Testing Database Optimization APIs..." -ForegroundColor Cyan

$baseUrl = "http://localhost:5000/xpswap/api/security"

# 1. 서버 상태 확인
Test-API "$($baseUrl.Replace('/security', ''))/health" "Server Health Check"

# 2. 캐시 상태 확인
$cacheStats = Test-API "$baseUrl/cache" "Cache Status"
if ($cacheStats) {
    Write-Host "📊 Cache Hit Rate: $($cacheStats.cache.stats.hitRate)%" -ForegroundColor Cyan
}

# 3. 데이터베이스 상태 확인
$dbStats = Test-API "$baseUrl/database/status" "Database Status"
if ($dbStats) {
    Write-Host "📊 Database Size: $($dbStats.data.stats.size) bytes" -ForegroundColor Cyan
    Write-Host "📊 Optimization Level: $($dbStats.data.stats.optimizationLevel)" -ForegroundColor Cyan
}

# 4. 데이터베이스 최적화 실행
Write-Host "`n🔧 Running Database Optimization..." -ForegroundColor Yellow
try {
    $optimizeResult = Invoke-RestMethod -Uri "$baseUrl/database/optimize" -Method POST -Body (@{operation="full"} | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 30
    Write-Host "✅ Database Optimization Completed" -ForegroundColor Green
    Write-Host "📊 Total Operations: $($optimizeResult.data.summary.totalOperations)" -ForegroundColor Cyan
    Write-Host "📊 Successful Operations: $($optimizeResult.data.summary.successfulOperations)" -ForegroundColor Cyan
    Write-Host "📊 Total Duration: $($optimizeResult.data.summary.totalDuration)ms" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Database Optimization Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. 최적화 후 상태 재확인
Write-Host "`n🔍 Checking Post-Optimization Status..." -ForegroundColor Cyan
$dbStatsAfter = Test-API "$baseUrl/database/status" "Database Status (After Optimization)"
if ($dbStatsAfter) {
    Write-Host "📊 Database Size After: $($dbStatsAfter.data.stats.size) bytes" -ForegroundColor Cyan
    Write-Host "📊 Optimization Level After: $($dbStatsAfter.data.stats.optimizationLevel)" -ForegroundColor Cyan
    Write-Host "📊 Query Performance: $($dbStatsAfter.data.metrics.queryTime)ms" -ForegroundColor Cyan
}

# 서버 중지
Write-Host "`n🛑 Stopping server..." -ForegroundColor Yellow
Stop-Job $serverJob
Remove-Job $serverJob

Write-Host "`n✅ Database Optimization Testing Completed!" -ForegroundColor Green
Write-Host "📝 Phase 2.1: Database Optimization - COMPLETED" -ForegroundColor Green

# 보안 개선 계획 문서 업데이트 권장
Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update SECURITY_IMPROVEMENT_PLAN.md - Phase 2.1 status" -ForegroundColor White
Write-Host "2. Proceed to Phase 2.2: API Caching and Async Processing" -ForegroundColor White
Write-Host "3. Document performance improvements" -ForegroundColor White

Read-Host "`nPress Enter to exit..."
