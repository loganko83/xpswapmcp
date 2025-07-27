const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 XPSwap 스마트 컨트랙트 실제 배포 시작...");
    
    // 배포자 지갑 정보
    const [deployer] = await ethers.getSigners();
    console.log("📋 배포 지갑 주소:", deployer.address);
    
    // 잔액 확인
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("💰 현재 잔액:", ethers.formatEther(balance), "XP");
    
    if (balance === 0n) {
        throw new Error("⚠️ 가스비가 부족합니다!");
    }
    
    const deployedContracts = {};
    
    console.log("\n🔨 스마트 컨트랙트 배포 시작...\n");
    
    try {
        // 1. XpSwapToken 배포 (XPS 토큰)
        console.log("📝 [1/12] XpSwapToken 배포 중...");
        const XpSwapToken = await ethers.getContractFactory("XpSwapToken");
        const xpSwapToken = await XpSwapToken.deploy(
            "XPSwap Token",              // name
            "XPS",                       // symbol  
            "1000000000000000000000000000", // 1B tokens (as string)
            deployer.address             // initial owner
        );
        await xpSwapToken.waitForDeployment();
        deployedContracts.XpSwapToken = await xpSwapToken.getAddress();
        console.log(`   ✅ 배포 완료: ${deployedContracts.XpSwapToken}`);
        
        // 2. XpSwapDEX 배포
        console.log("📝 [2/12] XpSwapDEX 배포 중...");
        const XpSwapDEX = await ethers.getContractFactory("XpSwapDEX");
        const xpSwapDEX = await XpSwapDEX.deploy();
        await xpSwapDEX.waitForDeployment();
        deployedContracts.XpSwapDEX = await xpSwapDEX.getAddress();
        console.log(`   ✅ 배포 완료: ${deployedContracts.XpSwapDEX}`);
        
        // 3. XpSwapLiquidityPool 배포
        console.log("📝 [3/12] XpSwapLiquidityPool 배포 중...");
        const XpSwapLiquidityPool = await ethers.getContractFactory("XpSwapLiquidityPool");
        const xpSwapLiquidityPool = await XpSwapLiquidityPool.deploy(
            deployedContracts.XpSwapToken,
            deployedContracts.XpSwapDEX
        );
        await xpSwapLiquidityPool.waitForDeployment();
        deployedContracts.XpSwapLiquidityPool = await xpSwapLiquidityPool.getAddress();
        console.log(`   ✅ 배포 완료: ${deployedContracts.XpSwapLiquidityPool}`);
        
        // 4. XpSwapAdvancedAMM 배포
        console.log("📝 [4/12] XpSwapAdvancedAMM 배포 중...");
        const XpSwapAdvancedAMM = await ethers.getContractFactory("XpSwapAdvancedAMM");
        const xpSwapAdvancedAMM = await XpSwapAdvancedAMM.deploy(
            deployedContracts.XpSwapDEX
        );
        await xpSwapAdvancedAMM.waitForDeployment();
        deployedContracts.XpSwapAdvancedAMM = await xpSwapAdvancedAMM.getAddress();
        console.log(`   ✅ 배포 완료: ${deployedContracts.XpSwapAdvancedAMM}`);
        
        // 5. XpSwapStaking 배포  
        console.log("📝 [5/12] XpSwapStaking 배포 중...");
        const XpSwapStaking = await ethers.getContractFactory("XpSwapStaking");
        const xpSwapStaking = await XpSwapStaking.deploy(
            deployedContracts.XpSwapToken,
            ethers.parseEther("0.1") // 0.1 XPS per second reward
        );
        await xpSwapStaking.waitForDeployment();
        deployedContracts.XpSwapStaking = await xpSwapStaking.getAddress();
        console.log(`   ✅ 배포 완료: ${deployedContracts.XpSwapStaking}`);
        
        // 6. XpSwapFarmingRewards 배포
        console.log("📝 [6/12] XpSwapFarmingRewards 배포 중...");
        const XpSwapFarmingRewards = await ethers.getContractFactory("XpSwapFarmingRewards");
        const xpSwapFarmingRewards = await XpSwapFarmingRewards.deploy(
            deployedContracts.XpSwapToken,
            ethers.parseEther("0.05"), // 0.05 XPS per second
            Math.floor(Date.now() / 1000) // start time
        );
        await xpSwapFarmingRewards.waitForDeployment();
        deployedContracts.XpSwapFarmingRewards = await xpSwapFarmingRewards.getAddress();
        console.log(`   ✅ 배포 완료: ${deployedContracts.XpSwapFarmingRewards}`);
        
        // 7. XpSwapGovernanceToken 배포
        console.log("📝 [7/12] XpSwapGovernanceToken 배포 중...");
        const XpSwapGovernanceToken = await ethers.getContractFactory("XpSwapGovernanceToken");
        const xpSwapGovernanceToken = await XpSwapGovernanceToken.deploy(
            "XPSwap Governance Token",
            "xXPS",
            "100000000000000000000000000", // 100M tokens (as string)
            deployer.address
        );
        await xpSwapGovernanceToken.waitForDeployment();
        deployedContracts.XpSwapGovernanceToken = await xpSwapGovernanceToken.getAddress();
        console.log(`   ✅ 배포 완료: ${deployedContracts.XpSwapGovernanceToken}`);
        
        // 8. XpSwapRevenueManager 배포
        console.log("📝 [8/12] XpSwapRevenueManager 배포 중...");
        const XpSwapRevenueManager = await ethers.getContractFactory("XpSwapRevenueManager");
        const xpSwapRevenueManager = await XpSwapRevenueManager.deploy(
            deployer.address // fee recipient
        );
        await xpSwapRevenueManager.waitForDeployment();
        deployedContracts.XpSwapRevenueManager = await xpSwapRevenueManager.getAddress();
        console.log(`   ✅ 배포 완료: ${deployedContracts.XpSwapRevenueManager}`);
        
        // 9. XpSwapCrosschainBridge 배포
        console.log("📝 [9/12] XpSwapCrosschainBridge 배포 중...");
        const XpSwapCrosschainBridge = await ethers.getContractFactory("XpSwapCrosschainBridge");
        const xpSwapCrosschainBridge = await XpSwapCrosschainBridge.deploy(
            deployer.address, // fee recipient
            20250217         // Xphere chain ID
        );
        await xpSwapCrosschainBridge.waitForDeployment();
        deployedContracts.XpSwapCrosschainBridge = await xpSwapCrosschainBridge.getAddress();
        console.log(`   ✅ 배포 완료: ${deployedContracts.XpSwapCrosschainBridge}`);
        
        // 10. XPSwapFlashLoanSecurity 배포
        console.log("📝 [10/12] XPSwapFlashLoanSecurity 배포 중...");
        const XPSwapFlashLoanSecurity = await ethers.getContractFactory("XPSwapFlashLoanSecurity");
        const xpSwapFlashLoanSecurity = await XPSwapFlashLoanSecurity.deploy();
        await xpSwapFlashLoanSecurity.waitForDeployment();
        deployedContracts.XPSwapFlashLoanSecurity = await xpSwapFlashLoanSecurity.getAddress();
        console.log(`   ✅ 배포 완료: ${deployedContracts.XPSwapFlashLoanSecurity}`);
        
        // 11. XPSwapMEVProtection 배포
        console.log("📝 [11/12] XPSwapMEVProtection 배포 중...");
        const XPSwapMEVProtection = await ethers.getContractFactory("XPSwapMEVProtection");
        const xpSwapMEVProtection = await XPSwapMEVProtection.deploy();
        await xpSwapMEVProtection.waitForDeployment();
        deployedContracts.XPSwapMEVProtection = await xpSwapMEVProtection.getAddress();
        console.log(`   ✅ 배포 완료: ${deployedContracts.XPSwapMEVProtection}`);
        
        // 12. MultiSigWallet 배포
        console.log("📝 [12/12] MultiSigWallet 배포 중...");
        const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
        const multiSigWallet = await MultiSigWallet.deploy(
            [deployer.address], // owners
            1                   // required confirmations
        );
        await multiSigWallet.waitForDeployment();
        deployedContracts.MultiSigWallet = await multiSigWallet.getAddress();
        console.log(`   ✅ 배포 완료: ${deployedContracts.MultiSigWallet}`);
        
        console.log("\n🎉 모든 스마트 컨트랙트 배포 완료!\n");
        
        // 최종 잔액 확인
        const finalBalance = await deployer.provider.getBalance(deployer.address);
        const gasUsed = balance - finalBalance;
        console.log("💰 최종 잔액:", ethers.formatEther(finalBalance), "XP");
        console.log("💸 사용된 가스비:", ethers.formatEther(gasUsed), "XP");
        
        console.log("\n📋 배포된 컨트랙트 주소:");
        Object.entries(deployedContracts).forEach(([name, address]) => {
            console.log(`   ${name}: ${address}`);
        });
        
        // 배포 정보 저장
        const fs = require('fs');
        const deploymentInfo = {
            network: 'Xphere',
            chainId: 20250217,
            deployedAt: new Date().toISOString(),
            deployer: deployer.address,
            gasUsed: ethers.formatEther(gasUsed),
            contracts: deployedContracts
        };
        
        fs.writeFileSync(
            'deployments/xphere-contracts.json',
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        return {
            success: true,
            contracts: deployedContracts,
            gasUsed: ethers.formatEther(gasUsed)
        };
        
    } catch (error) {
        console.error("❌ 배포 중 오류 발생:", error.message);
        return {
            success: false,
            error: error.message
        };
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
