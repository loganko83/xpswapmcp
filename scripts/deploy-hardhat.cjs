const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 XPSwap 스마트 컨트랙트 배포 시작...");
    
    // 배포자 계정 정보
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    
    console.log("📋 배포자 주소:", deployerAddress);
    
    // 잔액 확인
    const balance = await deployer.provider.getBalance(deployerAddress);
    const balanceEth = ethers.formatEther(balance);
    console.log("💰 배포자 잔액:", balanceEth, "XP");
    
    if (balance === 0n) {
        throw new Error("⚠️ 가스비가 부족합니다. XP를 충전해주세요.");
    }
    
    const deployedContracts = {};
    const deploymentResults = [];
    
    try {
        console.log("\n🔨 스마트 컨트랙트 배포 시작...\n");
        
        // 1. XpSwapToken (XPS 토큰) 배포
        console.log("📝 [1/12] XpSwapToken 배포 중...");
        const XpSwapToken = await ethers.getContractFactory("XpSwapToken");
        const xpsToken = await XpSwapToken.deploy(
            deployerAddress, // teamWallet
            deployerAddress, // developmentWallet
            deployerAddress, // marketingWallet
            deployerAddress  // bugBountyWallet
        );
        await xpsToken.waitForDeployment();
        const xpsTokenAddress = await xpsToken.getAddress();
        deployedContracts.XpSwapToken = xpsTokenAddress;
        console.log("   ✅ XpSwapToken 배포 완료:", xpsTokenAddress);
        
        // 2. XpSwapDEX (DEX 라우터) 배포
        console.log("📝 [2/12] XpSwapDEX 배포 중...");
        const XpSwapDEX = await ethers.getContractFactory("XpSwapDEX");
        const dex = await XpSwapDEX.deploy();
        await dex.waitForDeployment();
        const dexAddress = await dex.getAddress();
        deployedContracts.XpSwapDEX = dexAddress;
        console.log("   ✅ XpSwapDEX 배포 완료:", dexAddress);
        
        // 3. XpSwapLiquidityPool (유동성 풀) 배포
        console.log("📝 [3/12] XpSwapLiquidityPool 배포 중...");
        const XpSwapLiquidityPool = await ethers.getContractFactory("XpSwapLiquidityPool");
        const liquidityPool = await XpSwapLiquidityPool.deploy(xpsTokenAddress, dexAddress);
        await liquidityPool.waitForDeployment();
        const liquidityPoolAddress = await liquidityPool.getAddress();
        deployedContracts.XpSwapLiquidityPool = liquidityPoolAddress;
        console.log("   ✅ XpSwapLiquidityPool 배포 완료:", liquidityPoolAddress);
        
        // 4. XpSwapAdvancedAMM (고급 AMM) 배포
        console.log("📝 [4/12] XpSwapAdvancedAMM 배포 중...");
        const XpSwapAdvancedAMM = await ethers.getContractFactory("XpSwapAdvancedAMM");
        const advancedAMM = await XpSwapAdvancedAMM.deploy(dexAddress);
        await advancedAMM.waitForDeployment();
        const advancedAMMAddress = await advancedAMM.getAddress();
        deployedContracts.XpSwapAdvancedAMM = advancedAMMAddress;
        console.log("   ✅ XpSwapAdvancedAMM 배포 완료:", advancedAMMAddress);
        
        // 5. XpSwapStaking (스테이킹) 배포
        console.log("📝 [5/12] XpSwapStaking 배포 중...");
        const XpSwapStaking = await ethers.getContractFactory("XpSwapStaking");
        const staking = await XpSwapStaking.deploy(xpsTokenAddress);
        await staking.waitForDeployment();
        const stakingAddress = await staking.getAddress();
        deployedContracts.XpSwapStaking = stakingAddress;
        console.log("   ✅ XpSwapStaking 배포 완료:", stakingAddress);
        
        // 6. XpSwapFarmingRewards (파밍 보상) 배포
        console.log("📝 [6/12] XpSwapFarmingRewards 배포 중...");
        const XpSwapFarmingRewards = await ethers.getContractFactory("XpSwapFarmingRewards");
        const farming = await XpSwapFarmingRewards.deploy(xpsTokenAddress);
        await farming.waitForDeployment();
        const farmingAddress = await farming.getAddress();
        deployedContracts.XpSwapFarmingRewards = farmingAddress;
        console.log("   ✅ XpSwapFarmingRewards 배포 완료:", farmingAddress);
        
        // 7. XpSwapGovernanceToken (거버넌스) 배포
        console.log("📝 [7/12] XpSwapGovernanceToken 배포 중...");
        const XpSwapGovernanceToken = await ethers.getContractFactory("XpSwapGovernanceToken");
        const governance = await XpSwapGovernanceToken.deploy(xpsTokenAddress);
        await governance.waitForDeployment();
        const governanceAddress = await governance.getAddress();
        deployedContracts.XpSwapGovernanceToken = governanceAddress;
        console.log("   ✅ XpSwapGovernanceToken 배포 완료:", governanceAddress);
        
        // 8. XpSwapRevenueManager (수익 관리) 배포
        console.log("📝 [8/12] XpSwapRevenueManager 배포 중...");
        const XpSwapRevenueManager = await ethers.getContractFactory("XpSwapRevenueManager");
        const revenueManager = await XpSwapRevenueManager.deploy(xpsTokenAddress);
        await revenueManager.waitForDeployment();
        const revenueManagerAddress = await revenueManager.getAddress();
        deployedContracts.XpSwapRevenueManager = revenueManagerAddress;
        console.log("   ✅ XpSwapRevenueManager 배포 완료:", revenueManagerAddress);
        
        // 9. XpSwapCrosschainBridge (크로스체인 브리지) 배포
        console.log("📝 [9/12] XpSwapCrosschainBridge 배포 중...");
        const XpSwapCrosschainBridge = await ethers.getContractFactory("XpSwapCrosschainBridge");
        const bridge = await XpSwapCrosschainBridge.deploy(xpsTokenAddress);
        await bridge.waitForDeployment();
        const bridgeAddress = await bridge.getAddress();
        deployedContracts.XpSwapCrosschainBridge = bridgeAddress;
        console.log("   ✅ XpSwapCrosschainBridge 배포 완료:", bridgeAddress);
        
        // 10. XPSwapFlashLoanSecurity (플래시론 보안) 배포
        console.log("📝 [10/12] XPSwapFlashLoanSecurity 배포 중...");
        const XPSwapFlashLoanSecurity = await ethers.getContractFactory("XPSwapFlashLoanSecurity");
        const flashLoan = await XPSwapFlashLoanSecurity.deploy();
        await flashLoan.waitForDeployment();
        const flashLoanAddress = await flashLoan.getAddress();
        deployedContracts.XPSwapFlashLoanSecurity = flashLoanAddress;
        console.log("   ✅ XPSwapFlashLoanSecurity 배포 완료:", flashLoanAddress);
        
        // 11. XPSwapMEVProtection (MEV 보호) 배포
        console.log("📝 [11/12] XPSwapMEVProtection 배포 중...");
        const XPSwapMEVProtection = await ethers.getContractFactory("XPSwapMEVProtection");
        const mevProtection = await XPSwapMEVProtection.deploy();
        await mevProtection.waitForDeployment();
        const mevProtectionAddress = await mevProtection.getAddress();
        deployedContracts.XPSwapMEVProtection = mevProtectionAddress;
        console.log("   ✅ XPSwapMEVProtection 배포 완료:", mevProtectionAddress);
        
        // 12. MultiSigWallet (다중 서명 지갑) 배포
        console.log("📝 [12/12] MultiSigWallet 배포 중...");
        const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
        const multiSig = await MultiSigWallet.deploy([deployerAddress], 1);
        await multiSig.waitForDeployment();
        const multiSigAddress = await multiSig.getAddress();
        deployedContracts.MultiSigWallet = multiSigAddress;
        console.log("   ✅ MultiSigWallet 배포 완료:", multiSigAddress);
        
        // 최종 잔액 확인
        const finalBalance = await deployer.provider.getBalance(deployerAddress);
        const finalBalanceEth = ethers.formatEther(finalBalance);
        const gasUsed = parseFloat(balanceEth) - parseFloat(finalBalanceEth);
        
        console.log("\n🎉 모든 스마트 컨트랙트 배포 완료!\n");
        console.log("📋 배포된 컨트랙트 주소:");
        Object.entries(deployedContracts).forEach(([name, address]) => {
            console.log(`   ${name}: ${address}`);
        });
        
        console.log(`\n💰 최종 잔액: ${finalBalanceEth} XP`);
        console.log(`💸 사용된 가스비: ${gasUsed.toFixed(4)} XP`);
        
        // 배포 정보 저장
        await saveDeploymentInfo(deployedContracts);
        
        return {
            success: true,
            contracts: deployedContracts,
            gasUsed: gasUsed.toFixed(4)
        };
        
    } catch (error) {
        console.error("❌ 배포 중 오류 발생:", error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// 배포 정보 저장 함수
async function saveDeploymentInfo(contracts) {
    const deploymentInfo = {
        network: 'Xphere',
        chainId: 20250217,
        rpcUrl: 'https://en-bkk.x-phere.com',
        deployedAt: new Date().toISOString(),
        deployer: '0x48fF197fB7D09967aBF1AF0cE46038549eb2F2D0',
        contracts: contracts,
        totalContracts: Object.keys(contracts).length
    };
    
    // deployments 디렉토리 생성
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    // 배포 정보 파일 저장
    const deploymentFile = path.join(deploymentsDir, 'xphere-contracts.json');
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    console.log("💾 배포 정보 저장:", deploymentFile);
    
    // 클라이언트 상수 파일 업데이트
    await updateClientConstants(contracts);
}

// 클라이언트 상수 파일 업데이트 함수
async function updateClientConstants(contracts) {
    const constantsPath = path.join(__dirname, '..', 'client', 'src', 'lib', 'constants.ts');
    
    try {
        let content = fs.readFileSync(constantsPath, 'utf8');
        
        // 컨트랙트 주소 섹션 업데이트
        const contractAddresses = Object.entries(contracts)
            .map(([name, address]) => `  ${name}: '${address}',`)
            .join('\n');
        
        const updatedContent = content.replace(
            /export const CONTRACT_ADDRESSES = \{[\s\S]*?\};/,
            `export const CONTRACT_ADDRESSES = {
${contractAddresses}
};`
        );
        
        fs.writeFileSync(constantsPath, updatedContent);
        console.log("📝 클라이언트 상수 파일 업데이트 완료");
        
    } catch (error) {
        console.warn("⚠️ 클라이언트 상수 파일 업데이트 실패:", error.message);
    }
}

// 스크립트 실행
main()
    .then((result) => {
        if (result.success) {
            console.log("\n✅ 배포 성공!");
            process.exit(0);
        } else {
            console.log("\n❌ 배포 실패!");
            process.exit(1);
        }
    })
    .catch((error) => {
        console.error("💥 치명적 오류:", error);
        process.exit(1);
    });
