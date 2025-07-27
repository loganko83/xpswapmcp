import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
    console.log("🚀 XPSwap DEX 스마트 컨트랙트 배포 시작...");
    console.log("================================================");
    
    const [deployer] = await ethers.getSigners();
    console.log("배포자 주소:", deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("배포자 잔액:", ethers.formatEther(balance), "XP");
    
    if (balance < ethers.parseEther("10")) {
        console.error("❌ 가스비가 부족합니다. 최소 10 XP가 필요합니다.");
        return;
    }
    
    const contracts = {};
    let deploymentCount = 0;
    
    // 1. XPSwapToken (XPS 토큰) 배포
    console.log("\n1️⃣ XPSwapToken 배포 중...");
    try {
        const XPSwapToken = await ethers.getContractFactory("XpSwapToken");
        const xpsToken = await XPSwapToken.deploy(
            deployer.address, // teamWallet
            deployer.address, // developmentWallet  
            deployer.address, // marketingWallet
            deployer.address  // bugBountyWallet
        );
        await xpsToken.waitForDeployment();
        contracts.XPSwapToken = await xpsToken.getAddress();
        console.log("✅ XPSwapToken 배포 완료:", contracts.XPSwapToken);
        deploymentCount++;
    } catch (error) {
        console.error("❌ XPSwapToken 배포 실패:", error.message);
    }
    
    // 2. XPSwapDEX (메인 DEX) 배포
    console.log("\n2️⃣ XPSwapDEX 배포 중...");
    try {
        const XPSwapDEX = await ethers.getContractFactory("XpSwapDEX");
        const dex = await XPSwapDEX.deploy();
        await dex.waitForDeployment();
        contracts.XPSwapDEX = await dex.getAddress();
        console.log("✅ XPSwapDEX 배포 완료:", contracts.XPSwapDEX);
        deploymentCount++;
    } catch (error) {
        console.error("❌ XPSwapDEX 배포 실패:", error.message);
    }
    
    // 3. XPSwapLiquidityPool 배포
    console.log("\n3️⃣ XPSwapLiquidityPool 배포 중...");
    try {
        const XPSwapLiquidityPool = await ethers.getContractFactory("XpSwapLiquidityPool");
        const pool = await XPSwapLiquidityPool.deploy();
        await pool.waitForDeployment();
        contracts.XPSwapLiquidityPool = await pool.getAddress();
        console.log("✅ XPSwapLiquidityPool 배포 완료:", contracts.XPSwapLiquidityPool);
        deploymentCount++;
    } catch (error) {
        console.error("❌ XPSwapLiquidityPool 배포 실패:", error.message);
    }
    
    // 4. XpSwapAdvancedAMM 배포
    console.log("\n4️⃣ XpSwapAdvancedAMM 배포 중...");
    try {
        const XpSwapAdvancedAMM = await ethers.getContractFactory("XpSwapAdvancedAMM");
        const amm = await XpSwapAdvancedAMM.deploy(
            deployer.address, // feeRecipient
            deployer.address  // emergencyAdmin
        );
        await amm.waitForDeployment();
        contracts.XpSwapAdvancedAMM = await amm.getAddress();
        console.log("✅ XpSwapAdvancedAMM 배포 완료:", contracts.XpSwapAdvancedAMM);
        deploymentCount++;
    } catch (error) {
        console.error("❌ XpSwapAdvancedAMM 배포 실패:", error.message);
    }
    
    // 5. XpSwapStaking 배포 (XPS 토큰 주소 필요)
    if (contracts.XPSwapToken) {
        console.log("\n5️⃣ XpSwapStaking 배포 중...");
        try {
            const XpSwapStaking = await ethers.getContractFactory("XpSwapStaking");
            const staking = await XpSwapStaking.deploy(contracts.XPSwapToken);
            await staking.waitForDeployment();
            contracts.XpSwapStaking = await staking.getAddress();
            console.log("✅ XpSwapStaking 배포 완료:", contracts.XpSwapStaking);
            deploymentCount++;
        } catch (error) {
            console.error("❌ XpSwapStaking 배포 실패:", error.message);
        }
    }
    
    // 6. XPSwapFlashLoanSecurity 배포
    console.log("\n6️⃣ XPSwapFlashLoanSecurity 배포 중...");
    try {
        const XPSwapFlashLoanSecurity = await ethers.getContractFactory("XPSwapFlashLoanSecurity");
        const flashLoan = await XPSwapFlashLoanSecurity.deploy();
        await flashLoan.waitForDeployment();
        contracts.XPSwapFlashLoanSecurity = await flashLoan.getAddress();
        console.log("✅ XPSwapFlashLoanSecurity 배포 완료:", contracts.XPSwapFlashLoanSecurity);
        deploymentCount++;
    } catch (error) {
        console.error("❌ XPSwapFlashLoanSecurity 배포 실패:", error.message);
    }
    
    // 7. XPSwapMEVProtection 배포
    console.log("\n7️⃣ XPSwapMEVProtection 배포 중...");
    try {
        const XPSwapMEVProtection = await ethers.getContractFactory("XPSwapMEVProtection");
        const mev = await XPSwapMEVProtection.deploy();
        await mev.waitForDeployment();
        contracts.XPSwapMEVProtection = await mev.getAddress();
        console.log("✅ XPSwapMEVProtection 배포 완료:", contracts.XPSwapMEVProtection);
        deploymentCount++;
    } catch (error) {
        console.error("❌ XPSwapMEVProtection 배포 실패:", error.message);
    }
    
    // 8. MultiSigWallet 배포
    console.log("\n8️⃣ MultiSigWallet 배포 중...");
    try {
        const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
        const multisig = await MultiSigWallet.deploy(
            [deployer.address], // owners
            1                   // required confirmations
        );
        await multisig.waitForDeployment();
        contracts.MultiSigWallet = await multisig.getAddress();
        console.log("✅ MultiSigWallet 배포 완료:", contracts.MultiSigWallet);
        deploymentCount++;
    } catch (error) {
        console.error("❌ MultiSigWallet 배포 실패:", error.message);
    }
    
    // 배포 결과 요약
    console.log("\n================================================");
    console.log("🎉 스마트 컨트랙트 배포 완료!");
    console.log("================================================");
    console.log(`✅ 성공적으로 배포된 컨트랙트: ${deploymentCount}/8`);
    console.log("\n📋 배포된 컨트랙트 주소:");
    
    for (const [name, address] of Object.entries(contracts)) {
        console.log(`${name}: ${address}`);
    }
    
    // 최종 잔액 확인
    const finalBalance = await ethers.provider.getBalance(deployer.address);
    const gasUsed = balance - finalBalance;
    console.log("\n💰 가스 사용량:");
    console.log(`사용 전 잔액: ${ethers.formatEther(balance)} XP`);
    console.log(`사용 후 잔액: ${ethers.formatEther(finalBalance)} XP`);
    console.log(`총 가스비: ${ethers.formatEther(gasUsed)} XP`);
    
    console.log("\n🚀 배포 프로세스가 성공적으로 완료되었습니다!");
    
    return contracts;
}

main()
    .then((contracts) => {
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ 배포 중 오류가 발생했습니다:", error);
        process.exit(1);
    });
