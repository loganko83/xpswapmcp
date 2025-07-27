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
    
    try {
        console.log("\n🔨 실제 컴파일된 컨트랙트 배포 시작...\n");
        
        // 1. XpSwapToken (XPS 토큰) 배포 - 이미 성공
        console.log("📝 [1/6] XpSwapToken - 이미 배포됨");
        deployedContracts.XpSwapToken = "0x17E0Cd7AaC2f1096F753649D605e45dA39DE7F68";
        console.log("   ✅ XpSwapToken 주소:", deployedContracts.XpSwapToken);
        
        // 2. XpSwapDEX (DEX 라우터) 배포 - 이미 성공
        console.log("📝 [2/6] XpSwapDEX - 이미 배포됨");
        deployedContracts.XpSwapDEX = "0x1f20c338bF5004a081f7B1335D73f4BC03948CE7";
        console.log("   ✅ XpSwapDEX 주소:", deployedContracts.XpSwapDEX);
        
        // 3. XPSwapFlashLoanSecurity (플래시론 보안) 배포
        console.log("📝 [3/6] XPSwapFlashLoanSecurity 배포 중...");
        const XPSwapFlashLoanSecurity = await ethers.getContractFactory("XPSwapFlashLoanSecurity");
        const flashLoan = await XPSwapFlashLoanSecurity.deploy();
        await flashLoan.waitForDeployment();
        const flashLoanAddress = await flashLoan.getAddress();
        deployedContracts.XPSwapFlashLoanSecurity = flashLoanAddress;
        console.log("   ✅ XPSwapFlashLoanSecurity 배포 완료:", flashLoanAddress);
        
        // 4. XPSwapMEVProtection (MEV 보호) 배포
        console.log("📝 [4/6] XPSwapMEVProtection 배포 중...");
        const XPSwapMEVProtection = await ethers.getContractFactory("XPSwapMEVProtection");
        const mevProtection = await XPSwapMEVProtection.deploy();
        await mevProtection.waitForDeployment();
        const mevProtectionAddress = await mevProtection.getAddress();
        deployedContracts.XPSwapMEVProtection = mevProtectionAddress;
        console.log("   ✅ XPSwapMEVProtection 배포 완료:", mevProtectionAddress);
        
        // 5. XPSwapOptionsSecurity (옵션 보안) 배포
        console.log("📝 [5/6] XPSwapOptionsSecurity 배포 중...");
        const XPSwapOptionsSecurity = await ethers.getContractFactory("XPSwapOptionsSecurity");
        const optionsSecurity = await XPSwapOptionsSecurity.deploy();
        await optionsSecurity.waitForDeployment();
        const optionsSecurityAddress = await optionsSecurity.getAddress();
        deployedContracts.XPSwapOptionsSecurity = optionsSecurityAddress;
        console.log("   ✅ XPSwapOptionsSecurity 배포 완료:", optionsSecurityAddress);
        
        // 6. MultiSigWallet (다중 서명 지갑) 배포
        console.log("📝 [6/6] MultiSigWallet 배포 중...");
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
