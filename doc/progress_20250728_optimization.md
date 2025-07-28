# XpSwap DEX 최적화 및 프론트엔드 배포 작업

## 📅 작업 일시: 2025년 7월 28일 (계속)

## 🎯 작업 목표
1. 하드코딩된 API 경로를 getApiUrl() 사용으로 변경
2. 프론트엔드 빌드 및 서버 배포
3. UI 컴포넌트 실제 데이터 표시 확인

## 📝 이전 완료 사항
- Mock 데이터 100% 제거
- 서버 배포 완료 (https://trendy.storydot.kr/xpswap/)
- 실제 API 데이터 연동 확인

## 🔄 작업 진행 상황

### 1. 하드코딩된 API 경로 수정
시작 시간: 2025-07-28 23:50

#### 발견된 하드코딩 위치 (20개 이상):
- [x] trading.tsx - 2개 수정 완료
- [x] pool.tsx - 3개 수정 완료
- [ ] minting.tsx
- [ ] 기타 컴포넌트들 (총 40개 이상의 fetch 호출 발견)

#### 수정 방법:
1. 각 파일에 `import { getApiUrl } from "@/lib/apiUrl";` 추가
2. `fetch("/api/...")`를 `fetch(getApiUrl("/api/..."))`로 변경
3. `fetch(\`/api/...\`)`도 `fetch(getApiUrl(\`/api/...\`))`로 변경

#### 발견된 문제:
- 수동으로 모든 파일을 수정하는 것은 시간이 많이 소요됨
- 자동화된 접근 방법 필요

