# XPSwap 티커 문제 해결 가이드

## 🚨 현재 문제

1. **상단 티커가 표시되지 않음** - API 연결 문제
2. **메뉴 새로고침 시 WordPress로 이동** - 라우팅 문제

## 🔍 문제 진단

### 1. API 접근성 테스트

```bash
# 로컬에서 API 테스트
curl http://localhost:5000/api/crypto-ticker
curl http://localhost:5000/api/health
curl http://localhost:5000/api/xp-price

# 외부에서 API 테스트
curl https://trendy.storydot.kr/xpswap/api/crypto-ticker
curl https://trendy.storydot.kr/xpswap/api/health
```

### 2. Apache 설정 확인

```bash
# 현재 설정 확인
grep -n "xpswap" /etc/apache2/sites-available/000-default-le-ssl.conf

# 필요한 설정이 있는지 확인
grep "ProxyPass.*xpswap" /etc/apache2/sites-available/000-default-le-ssl.conf
```

## ✅ 해결 방법

### Step 1: Apache ProxyPass 설정 추가

```apache
# /etc/apache2/sites-available/000-default-le-ssl.conf
# </VirtualHost> 태그 바로 위에 추가

    # XPSwap API Proxy
    ProxyPass /xpswap/api http://localhost:5000/api
    ProxyPassReverse /xpswap/api http://localhost:5000/api
    
    # XPSwap Static Files (이미 설정됨)
    ProxyPass /xpswap http://localhost:5000/xpswap
    ProxyPassReverse /xpswap http://localhost:5000/xpswap
```

### Step 2: React Router 설정 수정

```javascript
// client/src/main.tsx
// BrowserRouter에 basename 추가
<BrowserRouter basename="/xpswap">
  <App />
</BrowserRouter>
```

### Step 3: API Base URL 설정

```javascript
// client/src/lib/api.ts
const API_BASE_URL = import.meta.env.PROD 
  ? '/xpswap/api' 
  : 'http://localhost:5000/api';

export const fetchCryptoTicker = async () => {
  const response = await fetch(`${API_BASE_URL}/crypto-ticker`);
  return response.json();
};
```

### Step 4: .htaccess 추가 (React 라우팅용)

```apache
# client/public/.htaccess
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /xpswap/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /xpswap/index.html [L]
</IfModule>
```

## 🛠️ 빠른 수정 스크립트

```bash
#!/bin/bash
# fix-xpswap-ticker.sh

echo "🔧 XPSwap 티커 수정 시작..."

# 1. Apache 모듈 확인
echo "1. Apache 모듈 활성화..."
sudo a2enmod proxy proxy_http rewrite
sudo a2enmod headers

# 2. 환경변수 설정
echo "2. 환경변수 확인..."
cd /var/www/storage/xpswap
if [ ! -f .env.production ]; then
    cat > .env.production << EOF
NODE_ENV=production
PORT=5000
BASE_PATH=/xpswap
DATABASE_URL=./test.db
EOF
fi

# 3. PM2 재시작
echo "3. PM2 재시작..."
pm2 restart xpswap-api

# 4. Apache 재시작
echo "4. Apache 재시작..."
sudo systemctl restart apache2

# 5. 테스트
echo "5. API 테스트..."
sleep 3
echo -n "Local API: "
curl -s http://localhost:5000/api/health && echo " ✅" || echo " ❌"
echo -n "Public API: "
curl -s https://trendy.storydot.kr/xpswap/api/health && echo " ✅" || echo " ❌"

echo "✅ 완료! Apache 설정을 수동으로 확인해주세요."
```

## 🧪 테스트 방법

### 1. 브라우저 콘솔에서 테스트

```javascript
// F12 -> Console에서 실행
fetch('/xpswap/api/crypto-ticker')
  .then(res => res.json())
  .then(data => console.log('Ticker Data:', data))
  .catch(err => console.error('Error:', err));
```

### 2. 티커 컴포넌트 디버깅

```javascript
// CryptoTicker.tsx에 디버그 로그 추가
useEffect(() => {
  console.log('Fetching ticker data...');
  fetch(`${API_BASE_URL}/crypto-ticker`)
    .then(res => {
      console.log('Response status:', res.status);
      return res.json();
    })
    .then(data => {
      console.log('Ticker data received:', data);
      setTickers(data);
    })
    .catch(err => {
      console.error('Ticker fetch error:', err);
    });
}, []);
```

## 📊 모니터링

### 실시간 로그 확인

```bash
# PM2 로그
pm2 logs xpswap-api --lines 100

# Apache 에러 로그
sudo tail -f /var/log/apache2/error.log | grep xpswap

# Apache 액세스 로그
sudo tail -f /var/log/apache2/access.log | grep xpswap/api
```

### API 응답 시간 측정

```bash
# 응답 시간 측정
time curl -s https://trendy.storydot.kr/xpswap/api/crypto-ticker > /dev/null

# 반복 테스트
for i in {1..10}; do
  time curl -s https://trendy.storydot.kr/xpswap/api/crypto-ticker > /dev/null
  sleep 1
done
```

## 🔄 롤백 방법

문제가 발생한 경우:

```bash
# 1. Apache 설정 롤백
sudo cp /etc/apache2/sites-available/000-default-le-ssl.conf.backup /etc/apache2/sites-available/000-default-le-ssl.conf
sudo systemctl restart apache2

# 2. 이전 빌드로 롤백
cd /var/www/storage/xpswap
rm -rf client/dist
mv client/dist_backup client/dist
pm2 restart xpswap-api
```

## 📝 체크리스트

- [ ] Apache proxy_module 활성화
- [ ] Apache ProxyPass 설정 추가
- [ ] .env.production 파일 확인
- [ ] PM2 프로세스 실행 중
- [ ] API Health Check 성공
- [ ] 티커 데이터 로드 확인
- [ ] 라우팅 새로고침 문제 해결

---
작성일: 2025년 7월 31일
