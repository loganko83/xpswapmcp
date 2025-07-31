# XPSwap 서버 빠른 수정 가이드

## 🚀 원클릭 수정 명령어

### 1. Apache 설정 백업 및 수정
```bash
# 설정 백업
sudo cp /etc/apache2/sites-available/000-default-le-ssl.conf /etc/apache2/sites-available/000-default-le-ssl.conf.backup

# 설정 편집
sudo nano /etc/apache2/sites-available/000-default-le-ssl.conf
```

### 2. ProxyPass 추가 (한 줄로)
```bash
# XPSwap API 프록시 추가 (</VirtualHost> 태그 바로 위에 추가)
sudo sed -i '/<\/VirtualHost>/i \    # XPSwap API Proxy\n    ProxyPass /xpswap/api http://localhost:5000/api\n    ProxyPassReverse /xpswap/api http://localhost:5000/api' /etc/apache2/sites-available/000-default-le-ssl.conf
```

### 3. 필수 Apache 모듈 활성화
```bash
# 모든 필요한 모듈 한번에 활성화
sudo a2enmod proxy proxy_http rewrite headers expires && sudo systemctl restart apache2
```

### 4. PM2 재시작
```bash
# PM2 프로세스 재시작
cd /var/www/storage/xpswap && pm2 restart xpswap-api && pm2 logs xpswap-api --lines 20
```

### 5. 빠른 테스트
```bash
# API 테스트 (3개 엔드포인트)
echo "Testing APIs..." && \
echo -n "Health: " && curl -s -o /dev/null -w "%{http_code}\n" https://trendy.storydot.kr/xpswap/api/health && \
echo -n "Ticker: " && curl -s -o /dev/null -w "%{http_code}\n" https://trendy.storydot.kr/xpswap/api/crypto-ticker && \
echo -n "XP Price: " && curl -s -o /dev/null -w "%{http_code}\n" https://trendy.storydot.kr/xpswap/api/xp-price
```

### 6. 환경변수 빠른 확인
```bash
# 프로덕션 환경변수 확인
cd /var/www/storage/xpswap && cat .env.production | grep -E "NODE_ENV|PORT|BASE_PATH"
```

### 7. 로그 실시간 모니터링
```bash
# PM2 로그 실시간 확인
pm2 logs xpswap-api --lines 50
```

### 8. Apache 에러 로그 확인
```bash
# Apache 에러 중 xpswap 관련만
sudo tail -f /var/log/apache2/error.log | grep -i xpswap
```

## 🛠️ 전체 수정 스크립트

```bash
#!/bin/bash
# 전체 수정을 한번에 수행하는 스크립트

echo "🔧 XPSwap 서버 설정 수정 시작..."

# 1. Apache 모듈 활성화
echo "1. Apache 모듈 활성화..."
sudo a2enmod proxy proxy_http rewrite headers expires

# 2. Apache 설정 백업
echo "2. Apache 설정 백업..."
sudo cp /etc/apache2/sites-available/000-default-le-ssl.conf /etc/apache2/sites-available/000-default-le-ssl.conf.$(date +%Y%m%d_%H%M%S)

# 3. 환경변수 확인
echo "3. 환경변수 확인..."
cd /var/www/storage/xpswap
if [ ! -f .env.production ]; then
    echo "Creating .env.production..."
    echo "NODE_ENV=production" > .env.production
    echo "PORT=5000" >> .env.production
    echo "BASE_PATH=/xpswap" >> .env.production
fi

# 4. PM2 재시작
echo "4. PM2 재시작..."
pm2 restart xpswap-api

# 5. Apache 재시작
echo "5. Apache 재시작..."
sudo systemctl restart apache2

# 6. 테스트
echo "6. API 테스트..."
sleep 3
curl -s http://localhost:5000/api/health

echo -e "\n✅ 수정 완료! Apache 설정만 수동으로 추가해주세요."
echo "sudo nano /etc/apache2/sites-available/000-default-le-ssl.conf"
```

## 🔍 문제별 해결 방법

### API 404 에러
```bash
# ProxyPass 설정 확인
grep -n "ProxyPass.*xpswap" /etc/apache2/sites-available/000-default-le-ssl.conf || echo "ProxyPass 설정 없음!"
```

### 티커 표시 안됨
```bash
# crypto-ticker API 직접 테스트
curl -s https://trendy.storydot.kr/xpswap/api/crypto-ticker | jq . || echo "API 접근 실패"
```

### 새로고침 시 WordPress로 이동
```bash
# Rewrite 모듈 확인
apache2ctl -M | grep rewrite || echo "Rewrite 모듈 비활성화됨!"
```

### PM2 프로세스 없음
```bash
# PM2 프로세스 시작
cd /var/www/storage/xpswap && pm2 start ecosystem.config.js --env production
```

## 📝 체크리스트

```bash
# 모든 상태 한번에 확인
echo "=== XPSwap Status Check ===" && \
echo -n "PM2: " && (pm2 list | grep xpswap && echo "✅") || echo "❌" && \
echo -n "Port 5000: " && (sudo netstat -tlnp | grep :5000 && echo "✅") || echo "❌" && \
echo -n "API Health: " && (curl -s http://localhost:5000/api/health > /dev/null && echo "✅") || echo "❌" && \
echo -n "Apache Proxy: " && (grep "ProxyPass.*xpswap" /etc/apache2/sites-available/000-default-le-ssl.conf > /dev/null && echo "✅") || echo "❌"
```

## 🚨 긴급 복구

### 전체 리셋
```bash
# 모든 프로세스 중지 및 재시작
pm2 kill && cd /var/www/storage/xpswap && pm2 start ecosystem.config.js --env production && sudo systemctl restart apache2
```

### 백업에서 복원
```bash
# Apache 설정 복원
sudo cp /etc/apache2/sites-available/000-default-le-ssl.conf.backup /etc/apache2/sites-available/000-default-le-ssl.conf && sudo systemctl restart apache2
```

## 📊 모니터링 대시보드

```bash
# 실시간 상태 모니터링 (5초마다 갱신)
watch -n 5 'echo "=== XPSwap Monitor ===" && pm2 list | grep xpswap && echo -e "\n=== Port Status ===" && sudo netstat -tlnp | grep :5000 && echo -e "\n=== Last Logs ===" && pm2 logs xpswap-api --lines 5 --nostream'
```

## 🔄 일일 점검 스크립트

```bash
# crontab에 추가: 0 9 * * * /home/ubuntu/xpswap-daily-check.sh
#!/bin/bash
LOG_FILE="/var/log/xpswap-check.log"
echo "[$(date)] XPSwap Daily Check" >> $LOG_FILE

# API 상태 확인
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health)
if [ "$API_STATUS" -ne 200 ]; then
    echo "[ERROR] API not responding (Status: $API_STATUS)" >> $LOG_FILE
    pm2 restart xpswap-api
fi

# 디스크 공간 확인
DISK_USAGE=$(df -h /var/www/storage | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "[WARNING] Disk usage high: $DISK_USAGE%" >> $LOG_FILE
fi

echo "[$(date)] Check completed" >> $LOG_FILE
```

---
마지막 업데이트: 2025년 7월 31일
