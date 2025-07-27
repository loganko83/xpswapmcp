# XPSwap 스마트 컨트랙트 배포 가이드

## 📋 배포 준비 사항

### 1. 배포 지갑 정보
```
배포 지갑 주소: 0x742d35Cc6634C0532925a3b844Bc9e7595f8b9d1
Private Key: [보안상 별도 보관]
```

**⚠️ 중요**: 이 주소로 XP 토큰을 전송해주세요. 스마트 컨트랙트 배포에 필요한 가스비로 사용됩니다.

### 2. 필요한 가스비 예상량
- 각 컨트랙트 배포: ~0.1-0.5 XP
- 총 10개 컨트랙트: ~5 XP
- 여유분 포함 권장: **10 XP**

### 3. 배포할 스마트 컨트랙트 목록
1. **XPS Token** - 거버넌스 및 유틸리티 토큰
2. **DEX Factory** - 유동성 풀 생성 팩토리
3. **DEX Router** - 스왑 라우터
4. **Yield Farming Manager** - 파밍 관리 컨트랙트
5. **Staking Pool** - XPS 스테이킹 풀
6. **Options Trading** - 옵션 거래 컨트랙트
7. **Futures Trading** - 선물 거래 컨트랙트
8. **Flash Loan Provider** - 플래시론 제공자
9. **Governance** - 거버넌스 컨트랙트
10. **Treasury** - 트레저리 관리

## 🚀 배포 프로세스

### Step 1: 환경 설정
```bash
cd C:\Users\vincent\Downloads\XPswap\XPswap
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers
```

### Step 2: Hardhat 설정
```javascript
// hardhat.config.js
module.exports = {
  solidity: "0.8.19",
  networks: {
    xphere: {
      url: "https://en-bkk.x-phere.com",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY]
    }
  }
};
```

### Step 3: 배포 스크립트
```javascript
// scripts/deploy.js
async function main() {
  console.log("Deploying XPSwap contracts to Xphere network...");
  
  // 1. Deploy XPS Token
  const XPSToken = await ethers.getContractFactory("XPSToken");
  const xpsToken = await XPSToken.deploy();
  await xpsToken.deployed();
  console.log("XPS Token deployed to:", xpsToken.address);
  
  // 2. Deploy Factory
  const Factory = await ethers.getContractFactory("XPSwapFactory");
  const factory = await Factory.deploy();
  await factory.deployed();
  console.log("Factory deployed to:", factory.address);
  
  // 3. Deploy Router
  const Router = await ethers.getContractFactory("XPSwapRouter");
  const router = await Router.deploy(factory.address);
  await router.deployed();
  console.log("Router deployed to:", router.address);
  
  // ... 나머지 컨트랙트 배포
}
```

### Step 4: 배포 실행
```bash
npx hardhat run scripts/deploy.js --network xphere
```

## 📝 배포 후 작업

### 1. 컨트랙트 주소 업데이트
배포된 컨트랙트 주소를 다음 파일들에 업데이트:
- `server/services/blockchain.ts` - CONTRACTS 객체
- `client/src/lib/constants.ts` - CONTRACT_ADDRESSES
- `.env.production` - 환경 변수

### 2. 검증 및 테스트
```bash
# 컨트랙트 검증
npx hardhat verify --network xphere [CONTRACT_ADDRESS]

# 통합 테스트
npm run test:contracts
```

### 3. 초기 유동성 제공
- XP/USDT 풀: 100,000 XP + 100,000 USDT
- XP/ETH 풀: 50,000 XP + 50 ETH
- BTC/USDT 풀: 2 BTC + 100,000 USDT

## 🔒 보안 체크리스트

- [ ] 모든 컨트랙트 감사 완료
- [ ] 멀티시그 지갑 설정
- [ ] 타임락 컨트롤러 배포
- [ ] 권한 관리 설정
- [ ] 긴급 일시정지 기능 테스트

## 📞 지원

배포 관련 문의사항이 있으시면 다음으로 연락해주세요:
- 이메일: dev@xpswap.com
- 텔레그램: @xpswap_dev

---
최종 업데이트: 2025년 7월 27일
