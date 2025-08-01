# 🚀 XPSwap 서버 배포 가이드 - WordPress 간섭 해결
# 날짜: 2025-08-01
# 버전: v2.1 (Enhanced Production Fix)

## 📋 배포 개요

이 가이드는 WordPress CSS 간섭 문제를 해결하고 React 앱 마운트 오류를 수정한 
XPSwap v2.1을 프로덕션 서버에 배포하는 과정을 설명합니다.

## 🔧 주요 수정사항

### ✅ 해결된 문제들
1. **WordPress CSS 간섭**: Apache 설정으로 완전 차단
2. **React 앱 마운트 실패**: 안전한 오류 처리 및 폴백 UI 추가
3. **Service Worker 오류**: HTTPS 환경 최적화
4. **Manifest 파일 문제**: 구문 검증 완료
5. **디버깅 도구**: 프로덕션 진단용 페이지 추가

### 🆕 새로 추가된 파일들
- `apache_xpswap_enhanced.conf`: 강화된 Apache 설정
- `xpswap_htaccess`: 추가 보안을 위한 .htaccess
- `debug_production.html`: 프로덕션 디버깅 도구
- 향상된 `main.tsx`: 에러 핸들링 강화

## 🛠️ 서버 배포 단계

### 1단계: SSH 접속
```bash
ssh ubuntu@trendy.storydot.kr
```

### 2단계: 프로젝트 업데이트
```bash
cd /var/www/storage/xpswap

# 현재 상태 백업
sudo cp -r /var/www/storage/xpswap /var/www/storage/xpswap_backup_$(date +%Y%m%d_%H%M)

# Git 업데이트
git pull origin main

# 의존성 설치 (legacy-peer-deps 필요)
npm install --legacy-peer-deps
```

### 3단계: 빌드
```bash
# 빌드 실행
npm run build

# 빌드 결과 확인
ls -la client/dist/
ls -la dist/
```

### 4단계: Apache 설정 백업 및 적용
```bash
# 기존 설정 백업
sudo cp /etc/apache2/sites-available/xpswap.conf /etc/apache2/sites-available/xpswap.conf.backup_$(date +%Y%m%d)

# 새로운 Apache 설정 적용
sudo cp apache_xpswap_enhanced.conf /etc/apache2/sites-available/xpswap.conf

# .htaccess 파일 적용
sudo cp xpswap_htaccess /var/www/storage/xpswap/client/dist/.htaccess
```

### 5단계: Apache 모듈 활성화
```bash
# 필요한 모듈 활성화
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod expires
sudo a2enmod proxy
sudo a2enmod proxy_http
```

### 6단계: 설정 테스트 및 적용
```bash
# Apache 설정 문법 검사
sudo apache2ctl configtest

# 설정 적용 (성공 시에만)
sudo systemctl reload apache2
```

### 7단계: 권한 설정
```bash
# 디렉토리 및 파일 권한 설정
sudo chown -R www-data:www-data /var/www/storage/xpswap/client/dist
sudo chmod -R 755 /var/www/storage/xpswap/client/dist
sudo chmod 644 /var/www/storage/xpswap/client/dist/.htaccess
```

### 8단계: PM2 프로세스 관리
```bash
# 현재 프로세스 상태 확인
pm2 list

# API 서버 재시작
pm2 stop xpswap-api
pm2 start ecosystem.config.js --env production

# 로그 확인
pm2 logs xpswap-api --lines 20
```

## 🧪 배포 후 테스트

### 자동 테스트 실행
```bash
# 프로덕션 디버깅 페이지 접속
curl -s https://trendy.storydot.kr/xpswap/debug_production.html

# 또는 브라우저에서 직접 접속
# https://trendy.storydot.kr/xpswap/debug_production.html
```

### 수동 테스트 체크리스트

#### ✅ API 테스트
```bash
# Health Check
curl https://trendy.storydot.kr/xpswap/api/health
# 예상: {"status":"ok","timestamp":"..."}

# XP Price
curl https://trendy.storydot.kr/xpswap/api/xp-price
# 예상: {"price":..., "change":...}

# Crypto Ticker
curl https://trendy.storydot.kr/xpswap/api/crypto-ticker
# 예상: [{"symbol":"BTC","price":...}, ...]
```

#### ✅ WordPress 차단 확인
```bash
# WordPress CSS 차단 확인 (404 예상)
curl -I https://trendy.storydot.kr/xpswap/wp-content/themes/trendy-news/style.css
# 예상: HTTP/1.1 404 Not Found

# XPSwap CSS 로딩 확인 (200 예상)
curl -I https://trendy.storydot.kr/xpswap/assets/index-BbhpJQqm.css
# 예상: HTTP/1.1 200 OK, Content-Type: text/css
```

#### ✅ React 앱 확인
```bash
# HTML 구조 확인
curl -s https://trendy.storydot.kr/xpswap/ | grep -i "root\|react\|xpswap"
# div id="root" 태그와 React 관련 스크립트 확인
```

#### ✅ 브라우저 테스트
1. **메인 페이지**: https://trendy.storydot.kr/xpswap/
   - [ ] 페이지 로딩 (흰 화면 없음)
   - [ ] 상단 암호화폐 티커 표시
   - [ ] 네비게이션 메뉴 작동
   
2. **브라우저 개발자 도구**:
   - [ ] Console: React 마운트 성공 메시지
   - [ ] Network: WordPress CSS 파일 404
   - [ ] Elements: div#root 내부에 React 컴포넌트
   - [ ] Application: Service Worker 등록 성공

3. **페이지 네비게이션**:
   - [ ] /xpswap/swap (토큰 스왑)
   - [ ] /xpswap/pool (유동성 풀)
   - [ ] /xpswap/farm (수익률 파밍)

## 🚨 문제 해결

### 문제 1: Apache 설정 오류
```bash
# 문법 오류 시 백업으로 복원
sudo cp /etc/apache2/sites-available/xpswap.conf.backup_YYYYMMDD /etc/apache2/sites-available/xpswap.conf
sudo systemctl reload apache2
```

### 문제 2: PM2 프로세스 오류
```bash
# 프로세스 완전 재시작
pm2 delete xpswap-api
pm2 start ecosystem.config.js --env production

# 또는 서버 재부팅
sudo reboot
```

### 문제 3: 권한 문제
```bash
# 권한 재설정
sudo chown -R www-data:www-data /var/www/storage/xpswap
sudo chmod -R 755 /var/www/storage/xpswap
```

### 문제 4: 캐시 문제
```bash
# Apache 캐시 지우기
sudo systemctl restart apache2

# 브라우저에서 강제 새로고침: Ctrl+F5
```

## 📊 성공 지표

배포 성공 시 다음이 확인되어야 합니다:

### ✅ 서버 상태
- PM2 프로세스 실행 중: `pm2 list`
- Apache 설정 문법 정상: `apache2ctl configtest`
- 디스크 공간 충분: `df -h`

### ✅ 웹사이트 기능
- 메인 페이지 로딩: 5초 이내
- 암호화폐 티커: 실시간 데이터 표시
- 페이지 라우팅: 새로고침 시에도 정상 작동
- API 응답: 평균 응답시간 < 100ms

### ✅ 보안 상태
- WordPress CSS 완전 차단
- CSP 헤더 적용
- HTTPS 리다이렉션 정상
- Service Worker 정상 등록

## 🔄 롤백 절차

문제 발생 시 즉시 롤백:

```bash
# 1. PM2 프로세스 중지
pm2 stop xpswap-api

# 2. Apache 설정 롤백
sudo cp /etc/apache2/sites-available/xpswap.conf.backup_YYYYMMDD /etc/apache2/sites-available/xpswap.conf
sudo systemctl reload apache2

# 3. 프로젝트 파일 롤백
sudo rm -rf /var/www/storage/xpswap
sudo mv /var/www/storage/xpswap_backup_YYYYMMDD_HHMM /var/www/storage/xpswap

# 4. PM2 재시작
pm2 start xpswap-api

# 5. 상태 확인
pm2 logs xpswap-api --lines 10
```

## 📝 배포 완료 체크리스트

### 🔧 기술적 확인
- [ ] Git 업데이트 완료
- [ ] npm install 성공
- [ ] 빌드 완료 (client/dist, dist 폴더 생성)
- [ ] Apache 설정 적용
- [ ] .htaccess 파일 적용
- [ ] PM2 프로세스 실행 중
- [ ] 로그에 오류 없음

### 🌐 웹사이트 확인
- [ ] https://trendy.storydot.kr/xpswap/ 접속 성공
- [ ] 암호화폐 티커 표시 확인
- [ ] 메뉴 네비게이션 작동
- [ ] 모든 페이지 라우팅 정상
- [ ] 개발자 도구에서 오류 없음
- [ ] Service Worker 등록 성공

### 🔒 보안 확인
- [ ] WordPress CSS 차단 (404 응답)
- [ ] XPSwap CSS 정상 로딩 (200 응답)
- [ ] API 엔드포인트 정상 작동
- [ ] HTTPS 인증서 유효
- [ ] CSP 헤더 적용

### 📈 성능 확인
- [ ] 페이지 로딩 시간 < 3초
- [ ] API 응답 시간 < 100ms
- [ ] 메모리 사용량 정상 (< 200MB)
- [ ] CPU 사용률 정상 (< 50%)

## 🎯 다음 단계

배포 완료 후:

1. **모니터링 설정**: PM2 대시보드 확인
2. **성능 최적화**: CDN 적용 검토
3. **보안 강화**: 추가 보안 헤더 검토
4. **사용자 피드백**: 실제 사용 테스트
5. **문서 업데이트**: 새로운 기능 문서화

---

## 📞 긴급 연락처

배포 중 문제 발생 시:

1. **즉시 롤백**: 위의 롤백 절차 따라 실행
2. **로그 수집**: PM2, Apache 로그 확인
3. **상태 점검**: 서버 리소스 및 네트워크 확인
4. **백업 검증**: 백업 파일 무결성 확인

---

*이 가이드는 XPSwap v2.1의 안전한 프로덕션 배포를 위한 종합적인 절차입니다.*

**📅 최종 업데이트**: 2025년 8월 1일
**🔗 커밋**: 17cebd4 (Enhanced Apache config & React mount error handling)
**📊 상태**: 배포 준비 완료
