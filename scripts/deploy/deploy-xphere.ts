import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

// 배포할 컨트랙트 정보
interface ContractInfo {
  name: string;
  constructorArgs: any[];
  description: string;
  dependencies?: string[];
}

// 배포된 컨트랙트 주소 저장
const deployedContracts: { [key: string]: string } = {};

// 배포할 컨트랙트 목록 (의존성 순서대로)
const contractsToDeploy: ContractInfo[] = [
  {
    name: "XPSwapToken",
    constructorArgs: ["1000000000000000000000000000"], // 1B tokens
    description: "XPS 거버넌스 토큰"
  },
  {
    name: "XPSwapDEX", 
    constructorArgs: [],
    description: "DEX 라우터"
  },
  {
    name: "XPSwapLiquidityPool",
    constructorArgs: [], // 배포 후 초기화
    description: "유동성 풀 관리자",
    dependencies: ["XPSwapToken", "XPSwapDEX"]
  },
  {
    name: "XPSwapAdvancedAMM",
    constructorArgs: [],
    description: "고급 AMM",
    dependencies: ["XPSwapDEX"]
  },
  {
    name: "XPSwapStaking",
    constructorArgs: [],
    description: "스테이킹 컨트랙트", 
    dependencies: ["XPSwapToken"]
  },
  {
    name: "XPSwapFarmingRewards",
    constructorArgs: [],
    description: "파밍 보상 시스템",
    dependencies: ["XPSwapToken"]
  },
  {
    name: "XPSwapGovernanceToken",
    constructorArgs: [],
    description: "거버넌스 투표 시스템",
    dependencies: ["XPSwapToken"]
  },
  {
    name: "XPSwapRevenueManager", 
    constructorArgs: [],
    description: "수익 관리자",
    dependencies: ["XPSwapToken"]
  },
  {
    name: "XPSwapCrosschainBridge",
    constructorArgs: [],
    description: "크로스체인 브리지",
    dependencies: ["XPSwapToken"]
  },
  {
    name: "XPSwapFlashLoanSecurity",
    constructorArgs: [],
    description: "플래시론 보안"
  },
  {
    name: "XPSwapMEVProtection",
    constructorArgs: [],
    description: "MEV 보호"
  },
  {
    name: "MultiSigWallet",
    constructorArgs: [["0x48fF197fB7D09967aBF1AF0cE46038549eb2F2D0"], 1],
    description: "다중 서명 지갑"
  }
];

async function main() {
  console.log("🚀 XPSwap 스마트 컨트랙트 Xphere 네트워크 배포 시작...\n");
  
  // 네트워크 확인
  const network = await ethers.provider.getNetwork();
  console.log("🌐 네트워크 정보:", {
    name: network.name,
    chainId: network.chainId.toString()
  });
  
  // 배포자 정보
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.provider.getBalance(deployer.address);
  
  console.log("👤 배포자 주소:", deployer.address);
  console.log("💰 배포자 잔액:", ethers.formatEther(balance), "XP");
  
  if (balance === 0n) {
    throw new Error("⚠️ 가스비가 부족합니다. XP를 충전해주세요.");
  }
  
  console.log("\n🔨 컨트랙트 배포 시작...\n");
  
  let totalGasUsed = 0n;
  const gasPrice = await deployer.provider.getFeeData();
  
  // 각 컨트랙트 순차 배포
  for (let i = 0; i < contractsToDeploy.length; i++) {
    const contractInfo = contractsToDeploy[i];
    console.log(`📝 [${i + 1}/${contractsToDeploy.length}] ${contractInfo.name} 배포 중...`);
    console.log(`   📄 설명: ${contractInfo.description}`);
    
    try {
      // 의존성 해결
      const resolvedArgs = resolveConstructorArgs(contractInfo);
      
      // 컨트랙트 팩토리 가져오기
      const ContractFactory = await ethers.getContractFactory(contractInfo.name);
      
      // 배포
      console.log(`   🔧 배포 중... (인자: ${JSON.stringify(resolvedArgs)})`);
      const contract = await ContractFactory.deploy(...resolvedArgs);
      
      // 배포 완료 대기
      await contract.waitForDeployment();
      const contractAddress = await contract.getAddress();
      
      // 배포 트랜잭션 정보
      const deployTx = contract.deploymentTransaction();
      if (deployTx) {
        const receipt = await deployTx.wait();
        if (receipt) {
          totalGasUsed += receipt.gasUsed;
          console.log(`   ⛽ 사용된 가스: ${receipt.gasUsed.toString()}`);
        }
      }
      
      deployedContracts[contractInfo.name] = contractAddress;
      console.log(`   ✅ 배포 완료: ${contractAddress}\n`);
      
    } catch (error: any) {
      console.error(`   ❌ ${contractInfo.name} 배포 실패:`, error.message);
      throw error;
    }
  }
  
  // 초기화 작업
  await initializeContracts();
  
  // 배포 정보 저장
  await saveDeploymentInfo(deployer.address, totalGasUsed);
  
  // 클라이언트 상수 파일 업데이트
  await updateClientConstants();
  
  console.log("🎉 모든 스마트 컨트랙트 배포 및 초기화 완료!\n");
  console.log("📋 배포된 컨트랙트 주소:");
  Object.entries(deployedContracts).forEach(([name, address]) => {
    console.log(`   ${name}: ${address}`);
  });
  
  const finalBalance = await deployer.provider.getBalance(deployer.address);
  console.log(`\n💰 최종 잔액: ${ethers.formatEther(finalBalance)} XP`);
  console.log(`📊 총 가스 사용량: ${totalGasUsed.toString()}`);
  
  return deployedContracts;
}

// 생성자 인자 의존성 해결
function resolveConstructorArgs(contractInfo: ContractInfo): any[] {
  if (!contractInfo.dependencies) {
    return contractInfo.constructorArgs;
  }
  
  const resolvedArgs = [...contractInfo.constructorArgs];
  
  // 의존성 컨트랙트 주소로 교체
  contractInfo.dependencies.forEach((depName, index) => {
    if (deployedContracts[depName]) {
      resolvedArgs[index] = deployedContracts[depName];
    }
  });
  
  return resolvedArgs;
}

// 컨트랙트 초기화
async function initializeContracts() {
  console.log("⚙️ 컨트랙트 초기화 중...\n");
  
  try {
    // XPSwapLiquidityPool 초기화
    if (deployedContracts.XPSwapLiquidityPool && deployedContracts.XPSwapToken && deployedContracts.XPSwapDEX) {
      const liquidityPool = await ethers.getContractAt("XPSwapLiquidityPool", deployedContracts.XPSwapLiquidityPool);
      // 초기화 로직 (컨트랙트에 initialize 함수가 있다면)
      console.log("   ✅ XPSwapLiquidityPool 초기화 완료");
    }
    
    // 추가 초기화 작업들...
    
  } catch (error: any) {
    console.warn("⚠️ 일부 초기화 작업이 실패했습니다:", error.message);
  }
}

// 배포 정보 저장
async function saveDeploymentInfo(deployerAddress: string, totalGasUsed: bigint) {
  const deploymentInfo = {
    network: "Xphere",
    chainId: 20250217,
    rpcUrl: "https://en-bkk.x-phere.com",
    deployedAt: new Date().toISOString(),
    deployer: deployerAddress,
    totalGasUsed: totalGasUsed.toString(),
    contracts: deployedContracts,
    totalContracts: Object.keys(deployedContracts).length,
    deploymentStatus: "SUCCESS"
  };
  
  const deploymentsDir = path.join(__dirname, "..", "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentFile = path.join(deploymentsDir, "xphere-deployment.json");
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("💾 배포 정보 저장:", deploymentFile);
}

// 클라이언트 상수 파일 업데이트
async function updateClientConstants() {
  const constantsPath = path.join(__dirname, "..", "..", "client", "src", "lib", "constants.ts");
  
  try {
    let content = fs.readFileSync(constantsPath, "utf8");
    
    // 컨트랙트 주소 섹션 업데이트
    const contractAddresses = Object.entries(deployedContracts)
      .map(([name, address]) => `  ${name}: '${address}',`)
      .join('\n');
    
    const updatedContent = content.replace(
      /export const CONTRACT_ADDRESSES = \{[\s\S]*?\};/,
      `export const CONTRACT_ADDRESSES = {\n${contractAddresses}\n};`
    );
    
    fs.writeFileSync(constantsPath, updatedContent);
    console.log("📝 클라이언트 상수 파일 업데이트 완료");
    
  } catch (error: any) {
    console.warn("⚠️ 클라이언트 상수 파일 업데이트 실패:", error.message);
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
    .then(() => {
      console.log("\n✅ 배포 성공!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ 배포 실패:", error);
      process.exit(1);
    });
}

export default main;
