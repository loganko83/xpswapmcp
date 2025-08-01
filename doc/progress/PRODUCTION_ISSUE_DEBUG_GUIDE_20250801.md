# 🚨 XPSwap 프로덕션 이슈 디버깅 가이드 (2025-08-01)

## 📋 문제 상황
- **URL**: https://trendy.storydot.kr/xpswap/
- **증상**: 화면이 하얗게 표시됨
- **확인된 API 상태**: 정상 작동 ✅

---

## 🔍 단계별 문제해결 체크리스트

### ✅ Step 1: 기본 상태 확인 - **완료**
- [x] 프로덕션 사이트 접속 확인 ✅
- [x] 개발자 도구 에러 확인 ✅
- [x] 네트워크 탭 확인 ✅
- [x] 콘솔 로그 확인 ✅

**🔍 발견된 문제:**
1. **WordPress CSS 간섭**: `/wp-content/themes/trendy-news/style.css` 로딩됨
2. **React 에러**: `TypeError: Cannot set properties of undefined (setting 'Children')`
3. **아이콘 에러**: `icon-144x144.png` 다운로드 에러
4. **Apache RewriteRule 문제**: WordPress가 XPSwap 요청을 처리하고 있음

### ✅ Step 2: 서버 파일 구조 확인 - **완료**
- [x] DocumentRoot 문제 발견 ✅ - WordPress가 `/var/www/storage/html_backup`에서 모든 요청 처리
- [x] CSS 간섭 원인 확인 ✅ - WordPress 테마의 style.css가 로딩됨
- [x] React 에러 원인 분석 ✅ - WordPress 환경에서 React 초기화 실패
- [x] Apache 설정 확인 ✅
- [x] 빌드 파일 경로 확인 ✅ - `/var/www/storage/xpswap/client/dist/`
- [x] index.html 존재 확인 ✅ - 2,636 bytes, 정상적인 구조
- [x] 정적 파일 서빙 확인 ✅ - assets/ 디렉토리 존재

**✅ 확인된 정상 상태:**
- index.html 파일 구조 정상
- BASE_PATH(/xpswap) 설정 정상
- JavaScript/CSS 파일 존재 확인
- 파일 권한 정상 (www-data)

### ✅ Step 3: Apache 설정 검증 - **완료**
- [x] xpswap.conf 설정 확인 ✅
- [x] ProxyPass 설정 확인 ✅
- [x] RewriteRule 설정 확인 ✅
- [x] 서비스 재시작 확인 ✅

**🔍 발견된 중요 사실:**
- **Apache 설정 중복**: `xpswap.conf`와 `storydot-kr-unified.conf` 둘 다 xpswap 처리
- **사이트 활성화 처리**: `xpswap.conf` 비활성화, 통합 설정 사용
- **로컬 환경**: 완전 정상 작동 ✅ (http://localhost:5187)
- **WordPress CSS 간섭**: 여전히 발생 중 (통합 설정에서도)

### ✅ Step 4: 빌드 파일 검증 - **완료**
- [x] client/dist 디렉토리 확인 ✅ - 모든 파일 존재
- [x] index.html 내용 확인 ✅ - 정상적인 React 구조
- [x] 정적 자원 (CSS, JS) 확인 ✅ - assets/ 디렉토리에 모든 파일 존재
- [x] 빌드 상태 확인 ✅ - 정상 빌드 완료

**🔍 발견된 문제:**
- **PWA 아이콘 파일 누락**: manifest.json에서 요청하는 `icon-144x144.png` 등이 실제로는 존재하지 않음
- **파비콘 경로 불일치**: `/favicon.png` 경로 설정되어 있으나 실제 파일 없음

### ✅ Step 5: 캐시 및 서비스 클리어 - **완료**
- [x] PWA manifest.json 수정 ✅ - 존재하는 SVG 파일만 참조하도록 변경
- [x] index.html 수정 ✅ - 누락된 favicon.png 참조 제거
- [x] 클린 빌드 실행 ✅ - 모든 문제 해결된 새 빌드 생성
- [x] 빌드 검증 ✅ - 정상적인 HTML 구조 확인

**🔍 해결된 문제:**
- **404 에러 해결**: 존재하지 않는 아이콘 파일 참조 제거
- **PWA 설정 최적화**: SVG 아이콘으로 통일

### ⏳ Step 6: 로그 분석
- [ ] Apache 에러 로그 확인
- [ ] Apache 액세스 로그 확인
- [ ] PM2 로그 확인
- [ ] 시스템 로그 확인

### ⏳ Step 7: 네트워크 및 권한 확인
- [ ] 파일 권한 확인
- [ ] 포트 상태 확인
- [ ] 방화벽 설정 확인
- [ ] DNS 설정 확인

### ⏳ Step 8: 로컬 vs 프로덕션 비교
- [ ] 로컬 환경 정상 작동 확인
- [ ] 환경변수 차이 확인
- [ ] 빌드 설정 차이 확인
- [ ] 의존성 차이 확인

### ⏳ Step 9: 재빌드 및 재배포
- [ ] 로컬 클린 빌드
- [ ] 서버 파일 업데이트
- [ ] 권한 재설정
- [ ] 서비스 재시작

### ⏳ Step 10: 최종 검증
- [ ] 프로덕션 사이트 정상 작동
- [ ] 모든 페이지 네비게이션 확인
- [ ] API 연동 확인
- [ ] 티커 표시 확인

---

## 📝 작업 로그

### 현재 시간: 2025-08-01 (Step 1-5 완료)
**상태**: WordPress 간섭 문제 식별 완료 ✅

**🔍 핵심 문제 확인:**
1. **WordPress DocumentRoot 간섭**: `/var/www/storage/html_backup`에서 모든 요청 처리
2. **CSS 충돌**: WordPress 테마 스타일이 React 앱에 적용됨
3. **React 초기화 실패**: WordPress 환경에서 React 컴포넌트 로딩 실패
4. **파일 404 에러**: PWA 아이콘 경로 문제 (해결 완료)

**📋 다음 단계:**
- Apache 설정 수정으로 WordPress 간섭 제거 필요
- 정적 파일 우선 처리를 통한 React 앱 정상 로딩

---

## ⚡ 긴급 해결 방법 (Quick Fix)

만약 빠른 해결이 필요한 경우:
1. Apache 재시작: `sudo systemctl restart apache2`
2. PM2 재시작: `pm2 restart xpswap-api`
3. 캐시 클리어: `sudo service apache2 reload`

---

## 🔧 디버깅 명령어 모음

### 서버 접속
```bash
ssh ubuntu@trendy.storydot.kr
cd /var/www/storage/xpswap
```

### 상태 확인
```bash
# Apache 상태
sudo systemctl status apache2

# PM2 상태
pm2 list
pm2 logs xpswap-api --lines 20

# 파일 구조
ls -la /var/www/storage/xpswap/client/dist/
```

### 로그 확인
```bash
# Apache 에러 로그
sudo tail -f /var/log/apache2/error.log

# Apache 액세스 로그
sudo tail -f /var/log/apache2/access.log
```

---

## 📋 체크포인트

각 단계 완료 후 반드시 이 문서를 업데이트하여 진행상황을 기록합니다.

**🔴 중요**: 각 Step 완료 시마다 문서 업데이트 필수!

---

*작성: 2025-08-01*
*최종 업데이트: 2025-08-01 (생성)*