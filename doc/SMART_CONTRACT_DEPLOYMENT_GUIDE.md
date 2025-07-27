# XpSwap 스마트 컨트랙트 배포 가이드

## 개요
이 가이드는 XpSwap DEX의 스마트 컨트랙트를 Xphere 네트워크에 배포하는 과정을 자세히 설명합니다. 모든 컨트랙트는 최신 보안 표준과 가스 최적화를 적용하여 구현되었습니다.

## 목차
1. [환경 설정](#환경-설정)
2. [네트워크 설정](#네트워크-설정)
3. [컨트랙트 컴파일](#컨트랙트-컴파일)
4. [배포 순서](#배포-순서)
5. [검증](#검증)
6. [사후 설정](#사후-설정)
7. [문제 해결](#문제-해결)

## 환경 설정

### 필수 도구 설치
```bash
# Node.js 18+ 설치 확인
node --version

# Hardhat 프레임워크 설치
npm install --save-dev hardhat

# 필수 플러그인 설치
npm install --save-dev @nomicfoundation/hardhat-toolbox
npm install --save-dev @openzeppelin/contracts
npm install --save-dev hardhat-gas-reporter
npm install --save-dev @nomiclabs/hardhat-etherscan
```

### 환경 변수 설정
`.env` 파일 생성:
```env
# Xphere 네트워크 설정
XPHERE_RPC_URL=https://en-bkk.x-phere.com
DEPLOYER_PRIVATE_KEY=your_private_key_here

# 가스 설정
GAS_PRICE=20000000000  # 20 Gwei
GAS_LIMIT=8000000

# XpSwap 설정
INITIAL_XPS_SUPPLY=1000000000000000000000000  # 1M XPS
XPS_PRICE_USD=1000000000000000000  # $1 in wei
```

## 네트워크 설정

### Hardhat 네트워크 설정
`hardhat.config.ts` 파일에 Xphere 네트워크 추가:
```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    xphere: {
      url: process.env.XPHERE_RPC_URL || "https://en-bkk.x-phere.com",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 20250217,
      gasPrice: parseInt(process.env.GAS_PRICE || "20000000000"),
      gas: parseInt(process.env.GAS_LIMIT || "8000000")
    }
  },
  gasReporter: {
    enabled: true,
    currency: "USD"
  }
};

export default config;
```

## 컨트랙트 컴파일

### 컴파일 실행
```bash
# 모든 컨트랙트 컴파일
npx hardhat compile

# 컴파일 결과 확인
ls artifacts/contracts/
```

### 가스 사용량 분석
```bash
# 가스 리포트 생성
npx hardhat test --gas-reporter
```

## 배포 순서

스마트 컨트랙트는 의존성을 고려하여 다음 순서로 배포해야 합니다:

### 1. XPS 토큰 배포
```bash
# XPS 토큰 배포
npx hardhat run scripts/01-deploy-xps-token.ts --network xphere
```

**예상 배포 주소**: `0xf1bA1aF6fae54C0f9d82C1d12aeF0c57543F12e2`

### 2. DEX 핵심 컨트랙트 배포
```bash
# XpSwapDEX 라우터 배포
npx hardhat run scripts/02-deploy-dex-router.ts --network xphere

# XpSwapLiquidityPool 배포
npx hardhat run scripts/03-deploy-liquidity-pool.ts --network xphere
```

**예상 배포 주소**:
- XpSwapDEX: `0x5b0bcfa1490d`
- LiquidityPool: `0xe909098d05c06`

### 3. 고급 AMM 시스템 배포
```bash
# XpSwapAdvancedAMM 배포 (MEV 보호)
npx hardhat run scripts/04-deploy-advanced-amm.ts --network xphere
```

**예상 배포 주소**: `0x123c1d407d04a`

### 4. 스테이킹 및 리워드 시스템 배포
```bash
# XpSwapStaking 배포
npx hardhat run scripts/05-deploy-staking.ts --network xphere

# XpSwapFarmingRewards 배포
npx hardhat run scripts/06-deploy-farming.ts --network xphere
```

**예상 배포 주소**:
- Staking: `0xdcbe5c4f166a3`
- Farming: `0xb99484ee2d452`

### 5. 거버넌스 시스템 배포
```bash
# XpSwapGovernanceToken 배포
npx hardhat run scripts/07-deploy-governance.ts --network xphere
```

**예상 배포 주소**: `0xa62a2b8601833`

### 6. 수익 관리 시스템 배포
```bash
# XpSwapRevenueManager 배포
npx hardhat run scripts/08-deploy-revenue-manager.ts --network xphere
```

**예상 배포 주소**: `0xb3cde158e6838`

### 7. 크로스체인 브릿지 배포
```bash
# XpSwapCrosschainBridge 배포
npx hardhat run scripts/09-deploy-crosschain-bridge.ts --network xphere
```

**예상 배포 주소**: `0x1301bc0dccf81`

## 배포 스크립트 예시

### XPS 토큰 배포 스크립트
```typescript
// scripts/01-deploy-xps-token.ts
import { ethers } from "hardhat";

async function main() {
  console.log("XPS 토큰 배포 시작...");
  
  const [deployer] = await ethers.getSigners();
  console.log("배포자 주소:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("배포자 잔액:", ethers.formatEther(balance), "XP");
  
  // XPS 토큰 배포
  const XPSToken = await ethers.getContractFactory("XpSwapToken");
  const xpsToken = await XPSToken.deploy(
    "XpSwap Token",
    "XPS",
    ethers.parseEther("1000000"), // 1M 토큰
    deployer.address
  );
  
  await xpsToken.waitForDeployment();
  const xpsAddress = await xpsToken.getAddress();
  
  console.log("XPS 토큰 배포 완료:", xpsAddress);
  
  // 초기 설정
  await xpsToken.setMinter(deployer.address, true);
  console.log("민터 권한 설정 완료");
  
  // 검증
  const totalSupply = await xpsToken.totalSupply();
  console.log("총 공급량:", ethers.formatEther(totalSupply), "XPS");
  
  return {
    xpsToken: xpsAddress,
    deployer: deployer.address
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### DEX 라우터 배포 스크립트
```typescript
// scripts/02-deploy-dex-router.ts
import { ethers } from "hardhat";

async function main() {
  console.log("XpSwapDEX 라우터 배포 시작...");
  
  const [deployer] = await ethers.getSigners();
  
  // XPS 토큰 주소 (이전 배포에서 가져옴)
  const XPS_TOKEN_ADDRESS = "0xf1bA1aF6fae54C0f9d82C1d12aeF0c57543F12e2";
  
  // WETH 주소 (Xphere 네트워크의 Wrapped XP)
  const WETH_ADDRESS = "0x0000000000000000000000000000000000000000"; // Xphere native
  
  const XpSwapDEX = await ethers.getContractFactory("XpSwapDEX");
  const dexRouter = await XpSwapDEX.deploy(
    XPS_TOKEN_ADDRESS,
    WETH_ADDRESS,
    300 // 0.3% 기본 수수료
  );
  
  await dexRouter.waitForDeployment();
  const routerAddress = await dexRouter.getAddress();
  
  console.log("XpSwapDEX 라우터 배포 완료:", routerAddress);
  
  // 초기 페어 생성
  await dexRouter.createPair(XPS_TOKEN_ADDRESS, WETH_ADDRESS);
  console.log("XPS/XP 페어 생성 완료");
  
  return {
    dexRouter: routerAddress,
    xpsToken: XPS_TOKEN_ADDRESS
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

## 검증

### 배포 후 검증 스크립트
```bash
# 모든 컨트랙트 검증
npx hardhat run scripts/verify-deployment.ts --network xphere
```

### 검증 스크립트 예시
```typescript
// scripts/verify-deployment.ts
import { ethers } from "hardhat";

async function main() {
  const contracts = {
    xpsToken: "0xf1bA1aF6fae54C0f9d82C1d12aeF0c57543F12e2",
    dexRouter: "0x5b0bcfa1490d",
    liquidityPool: "0xe909098d05c06",
    advancedAMM: "0x123c1d407d04a",
    staking: "0xdcbe5c4f166a3",
    farming: "0xb99484ee2d452",
    governance: "0xa62a2b8601833",
    revenueManager: "0xb3cde158e6838",
    crosschainBridge: "0x1301bc0dccf81"
  };
  
  console.log("컨트랙트 검증 시작...");
  
  for (const [name, address] of Object.entries(contracts)) {
    try {
      const code = await ethers.provider.getCode(address);
      if (code === "0x") {
        console.log(`❌ ${name}: 배포되지 않음 (${address})`);
      } else {
        console.log(`✅ ${name}: 배포 확인됨 (${address})`);
      }
    } catch (error) {
      console.log(`❌ ${name}: 검증 실패 (${address})`);
    }
  }
  
  // 기능 테스트
  console.log("\n기능 테스트 시작...");
  
  // XPS 토큰 테스트
  const xpsToken = await ethers.getContractAt("XpSwapToken", contracts.xpsToken);
  const totalSupply = await xpsToken.totalSupply();
  console.log(`XPS 총 공급량: ${ethers.formatEther(totalSupply)} XPS`);
  
  // DEX 라우터 테스트
  const dexRouter = await ethers.getContractAt("XpSwapDEX", contracts.dexRouter);
  const feeRate = await dexRouter.feeRate();
  console.log(`DEX 수수료율: ${feeRate}bp (${feeRate/100}%)`);
}

main().catch(console.error);
```

## 사후 설정

### 1. 권한 설정
```typescript
// 각 컨트랙트에 필요한 권한 부여
await xpsToken.setMinter(dexRouter.address, true);
await xpsToken.setMinter(staking.address, true);
await dexRouter.setFeeCollector(revenueManager.address);
```

### 2. 초기 유동성 제공
```bash
# 초기 XPS/XP 유동성 풀 생성
npx hardhat run scripts/setup-initial-liquidity.ts --network xphere
```

### 3. 프론트엔드 설정 업데이트
컨트랙트 주소를 프론트엔드에 반영:
```typescript
// client/src/lib/contracts.ts
export const CONTRACT_ADDRESSES = {
  XPS_TOKEN: "0xf1bA1aF6fae54C0f9d82C1d12aeF0c57543F12e2",
  DEX_ROUTER: "0x5b0bcfa1490d",
  LIQUIDITY_POOL: "0xe909098d05c06",
  ADVANCED_AMM: "0x123c1d407d04a",
  STAKING: "0xdcbe5c4f166a3",
  FARMING: "0xb99484ee2d452",
  GOVERNANCE: "0xa62a2b8601833",
  REVENUE_MANAGER: "0xb3cde158e6838",
  CROSSCHAIN_BRIDGE: "0x1301bc0dccf81"
};
```

## 문제 해결

### 일반적인 오류와 해결책

#### 1. 가스 부족 오류
```bash
Error: insufficient funds for gas
```
**해결책**: 배포자 계정에 충분한 XP 토큰 확보

#### 2. 네트워크 연결 오류
```bash
Error: could not detect network
```
**해결책**: RPC URL 확인 및 네트워크 설정 점검

#### 3. 컨트랙트 크기 초과
```bash
Error: contract code size exceeds limit
```
**해결책**: 컴파일러 최적화 옵션 조정

### 가스 최적화 팁

1. **컴파일러 최적화 활성화**
```typescript
optimizer: {
  enabled: true,
  runs: 1000  // 더 많은 실행을 위한 최적화
}
```

2. **배치 배포**
```typescript
// 여러 컨트랙트를 한 번에 배포
const batch = await Promise.all([
  deployXPSToken(),
  deployDEXRouter(),
  deployLiquidityPool()
]);
```

3. **가스 가격 모니터링**
```bash
# 실시간 가스 가격 확인
npx hardhat run scripts/check-gas-price.ts --network xphere
```

## 보안 고려사항

### 1. 멀티시그 지갑 설정
중요한 기능들은 멀티시그 지갑으로 관리:
```typescript
// 3/5 멀티시그 지갑으로 오너십 이전
await contract.transferOwnership(MULTISIG_WALLET_ADDRESS);
```

### 2. 타임락 설정
중요한 변경사항에 대한 타임락 적용:
```typescript
// 24시간 타임락 설정
const TIMELOCK_DELAY = 24 * 60 * 60; // 24 hours
```

### 3. 감사 체크리스트
- [ ] 모든 컨트랙트 코드 리뷰 완료
- [ ] 단위 테스트 100% 커버리지
- [ ] 통합 테스트 통과
- [ ] 외부 감사 완료
- [ ] 버그 바운티 프로그램 실행

## 모니터링 및 유지보수

### 1. 이벤트 모니터링
```typescript
// 중요 이벤트 모니터링 설정
dexRouter.on("Swap", (user, tokenIn, tokenOut, amountIn, amountOut) => {
  console.log(`Swap: ${user} swapped ${amountIn} ${tokenIn} for ${amountOut} ${tokenOut}`);
});
```

### 2. 건강도 체크
```bash
# 정기적인 컨트랙트 상태 확인
npx hardhat run scripts/health-check.ts --network xphere
```

### 3. 업그레이드 전략
프록시 패턴을 사용한 업그레이드 가능한 컨트랙트:
```typescript
// OpenZeppelin의 업그레이드 가능한 컨트랙트 사용
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
```

## 결론

이 가이드를 따라 XpSwap의 모든 스마트 컨트랙트를 안전하고 효율적으로 Xphere 네트워크에 배포할 수 있습니다. 배포 후에는 반드시 검증과 테스트를 통해 모든 기능이 정상적으로 작동하는지 확인하시기 바랍니다.

추가 질문이나 문제가 발생하면 개발팀에 문의하시기 바랍니다.

---

**업데이트 날짜**: 2025년 1월 17일  
**버전**: 1.0  
**작성자**: XpSwap 개발팀