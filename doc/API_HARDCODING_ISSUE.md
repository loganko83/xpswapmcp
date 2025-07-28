# API 경로 하드코딩 문제 및 해결 방안

## 📅 작성일: 2025년 7월 28일

## 🚨 발견된 문제

총 29개 파일에서 하드코딩된 API 경로 발견:
- `/api/` 형태로 직접 작성된 경로가 300개 이상 존재
- 프로덕션 환경에서 작동하지 않을 위험 높음

## 📁 영향받는 주요 파일들

### Pages (9개)
- trading.tsx - 5개 경로
- pool.tsx - 3개 경로  
- minting.tsx - 3개 경로
- memecoin.tsx - 3개 경로
- governance.tsx - 2개 경로
- bug-bounty.tsx - 1개 경로
- bridge.tsx - 2개 경로
- analytics.tsx - 2개 경로
- home.tsx - 1개 경로 (주석 내)

### Components (20개)
- YieldOptimization.tsx - 4개 경로
- YieldFarmingManager_BACKUP.tsx - 4개 경로
- SecurityDashboard.tsx - 4개 경로
- RiskManagement.tsx - 5개 경로
- RealTimeAnalyticsDashboard.tsx - 4개 경로
- PortfolioManager.tsx - 4개 경로
- OptionsTrading/* - 15개 경로
- MarketOverview.tsx - 1개 경로
- LiquidityPoolManager.tsx - 1개 경로
- liquidity/* - 4개 경로
- GovernanceVoting.tsx - 10개 경로
- GovernanceAnalytics.tsx - 3개 경로
- CrossChainBridge.tsx - 7개 경로
- analytics/* - 5개 경로
- bridge/* - 1개 경로

## ✅ 이미 수정된 파일들
- swap.tsx - getApiUrl 사용 중
- pool.tsx - 일부 getApiUrl 사용
- farm.tsx - getApiUrl 사용 중
- TokenSelector.tsx - getApiUrl 사용 중
- SwapInterface.tsx - getApiUrl 사용 중
- CryptoTicker.tsx - getApiUrl 사용 중

## 🔧 필요한 작업

### 1. 모든 파일에서 import 추가
```typescript
import { getApiUrl } from "@/lib/config";
// 또는
import { getApiUrl } from "@/lib/apiUrl";
```

### 2. API 호출 수정
```typescript
// Before
const response = await fetch("/api/trading/pairs");

// After  
const response = await fetch(getApiUrl("api/trading/pairs"));
```

### 3. 검증 스크립트 실행
```bash
# 하드코딩 검색
findstr /S /R "\"\/api\/" client/src/
grep -r '"/api/' client/src/
```

## 🚧 현재 상태
- Mock 데이터는 모두 제거됨 ✅
- API는 실제 데이터 반환 중 ✅
- 하드코딩된 경로는 아직 수정 필요 ⚠️

## 📝 권장사항
1. 서버 배포 시 개발 환경에서 충분히 테스트
2. 프로덕션 배포 전 모든 하드코딩 제거 필수
3. CI/CD 파이프라인에 하드코딩 검사 추가 고려

## 🎯 우선순위
1. 높음: trading.tsx, pool.tsx (핵심 기능)
2. 중간: governance.tsx, bridge.tsx (주요 기능)
3. 낮음: analytics 관련 컴포넌트 (부가 기능)
