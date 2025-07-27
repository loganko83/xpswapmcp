# XPSwap 스마트 컨트랙트 배포 가이드

## 📋 배포 준비사항

### 1. 배포 지갑 정보
- **배포 지갑 주소**: `0x742d35Cc6634C0532925a3b844Bc9e7595f8b9d1`
- **필요한 가스비**: 최소 10 XP (여유분 포함 권장)
- **네트워크**: Xphere Network
- **RPC URL**: `https://en-bkk.x-phere.com`
- **Chain ID**: `20250217`

### 2. 이전 배포 정보 (참고용)
- **XPS 판매 컨트랙트**: `0xf1bA1aF6fae54C0f9d82C1d12aeF0c57543F12e2`
- **XP 수령 주소**: `0xf0C5d4889cb250956841c339b5F3798320303D5f`
- **이전 배포 계정**: `0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A`

## 🚀 배포할 스마트 컨트랙트 목록

### 1. 핵심 컨트랙트 (필수)
1. **XPSwapToken.sol** - XPS 거버넌스 토큰
2. **XPSwapDEX.sol** - DEX 라우터
3. **XPSwapLiquidityPool.sol** - 유동성 풀 관리자
4. **XPSwapAdvancedAMM.sol** - 고급 AMM (자동 시장 조성자)

### 2. DeFi 기능 컨트랙트
5. **XPSwapStaking.sol** - 스테이킹 컨트랙트
6. **XPSwapFarmingRewards.sol** - 파밍 보상 시스템
7. **XPSwapGovernanceToken.sol** - 거버넌스 투표 시스템

### 3. 고급 기능 컨트랙트
8. **XPSwapRevenueManager.sol** - 수익 관리자
9. **XPSwapCrosschainBridge.sol** - 크로스체인 브리지
10. **XPSwapFlashLoanSecurity.sol** - 플래시론 보안

### 4. 보안 및 추가 컨트랙트
11. **XPSwapMEVProtection.sol** - MEV 보호
12. **MultiSigWallet.sol** - 다중 서명 지갑

## 📝 배포 스크립트 설정

### 1. Hardhat 설정 (`hardhat.config.js`)
```javascript
module.exports = {
  solidity: "0.8.19",
  networks: {
    xphere: {
      url: "https://en-bkk.x-phere.com",
      chainId: 20250217,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY]
    }
  }
};
```

### 2. 환경 변수 설정 (`.env`)
```
DEPLOYER_PRIVATE_KEY=your_private_key_here
XPHERE_RPC_URL=https://en-bkk.x-phere.com
```

## 🔧 배포 프로세스

### Step 1: 의존성 설치
```bash
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers
```

### Step 2: 컨트랙트 컴파일
```bash
npx hardhat compile
```

### Step 3: 배포 스크립트 실행
```bash
npx hardhat run scripts/deploy.js --network xphere
```

### Step 4: 배포 확인
```bash
npx hardhat verify --network xphere DEPLOYED_CONTRACT_ADDRESS
```

## ⚠️ 주의사항

1. **가스비 확인**: 배포 전 충분한 XP 토큰이 있는지 확인
2. **Private Key 보안**: 절대 하드코딩하지 말고 환경 변수 사용
3. **테스트넷 우선**: 메인넷 배포 전 테스트넷에서 충분히 테스트
4. **컨트랙트 검증**: 배포 후 반드시 컨트랙트 verify 수행

## 📊 예상 가스비

| 컨트랙트 | 예상 가스비 (XP) |
|---------|-----------------|
| XPSwapToken | ~0.8 XP |
| XPSwapDEX | ~1.2 XP |
| XPSwapLiquidityPool | ~1.0 XP |
| XPSwapAdvancedAMM | ~1.5 XP |
| 기타 컨트랙트 | 각 ~0.5-1.0 XP |
| **총 예상** | **~10 XP** |

## 🔐 배포 후 작업

1. **컨트랙트 주소 업데이트**
   - `client/src/lib/constants.ts` 파일에 배포된 주소 업데이트
   - `server/services/blockchain.ts` 파일에 컨트랙트 주소 추가

2. **초기 유동성 공급**
   - XP-USDT 풀 생성
   - XP-ETH 풀 생성
   - 초기 유동성 제공

3. **권한 설정**
   - Admin 권한 설정
   - MultiSig 지갑 소유자 추가
   - 거버넌스 파라미터 설정

4. **보안 체크리스트**
   - [ ] 모든 컨트랙트 verify 완료
   - [ ] 권한 설정 확인
   - [ ] 초기 파라미터 검증
   - [ ] 긴급 정지 기능 테스트

## 📞 지원 및 문의

배포 중 문제가 발생하면:
1. Xphere 네트워크 상태 확인
2. 가스비 잔액 확인
3. RPC 연결 상태 확인
4. 컨트랙트 코드 검증

---
작성일: 2025-07-27
버전: 1.0.0
