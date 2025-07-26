# SSL 인증서 생성 스크립트 (개발 환경용)
# 이 스크립트는 로컬 개발을 위한 자체 서명 인증서를 생성합니다

$certDir = "..\certs"
$certPath = "$certDir\server.crt"
$keyPath = "$certDir\server.key"

# certs 디렉토리 생성
if (!(Test-Path $certDir)) {
    New-Item -ItemType Directory -Path $certDir
    Write-Host "✅ Created certs directory" -ForegroundColor Green
}

# OpenSSL이 설치되어 있는지 확인
try {
    openssl version
} catch {
    Write-Host "❌ OpenSSL is not installed. Please install OpenSSL first." -ForegroundColor Red
    Write-Host "Download from: https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor Yellow
    exit 1
}

# 자체 서명 인증서 생성
Write-Host "🔐 Generating self-signed certificate..." -ForegroundColor Cyan

$subj = "/C=KR/ST=Seoul/L=Seoul/O=XPSwap/OU=Development/CN=localhost"

# OpenSSL 명령 실행
openssl req -x509 -newkey rsa:4096 -nodes -out $certPath -keyout $keyPath -days 365 -subj $subj 2>$null

if (Test-Path $certPath -and Test-Path $keyPath) {
    Write-Host "✅ SSL certificate generated successfully!" -ForegroundColor Green
    Write-Host "   Certificate: $certPath" -ForegroundColor Gray
    Write-Host "   Private Key: $keyPath" -ForegroundColor Gray
    Write-Host ""
    Write-Host "⚠️  This is a self-signed certificate for development only!" -ForegroundColor Yellow
    Write-Host "   Do not use in production!" -ForegroundColor Yellow
} else {
    Write-Host "❌ Failed to generate SSL certificate" -ForegroundColor Red
    exit 1
}
