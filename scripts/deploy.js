const SmartContractDeployer = require('./SmartContractDeployer');

async function main() {
    const privateKey = '0xaff93b56a157064b2a8f7bd0b04c5ef9fed6859bccc13d228ecb0fef4d9eb352';
    const rpcUrl = 'https://en-bkk.x-phere.com';
    
    const deployer = new SmartContractDeployer(privateKey, rpcUrl);
    
    console.log('🚀 Starting smart contract deployment...');
    console.log(`Deployer address: ${deployer.wallet.address}`);
    
    // 잔액 확인
    const balance = await deployer.getWalletBalance();
    console.log(`Current balance: ${balance} XP`);
    
    if (parseFloat(balance) < 0.1) {
        console.error('❌ Insufficient balance for deployment');
        return;
    }
    
    // 모든 컨트랙트 배포
    const results = await deployer.deployAllContracts();
    
    console.log('\n📋 Deployment Results:');
    console.log('='.repeat(50));
    
    results.forEach((result, index) => {
        if (result.error) {
            console.log(`${index + 1}. ❌ ${result.contractName}: ${result.error}`);
        } else {
            console.log(`${index + 1}. ✅ ${result.contractName}: ${result.address}`);
        }
    });
    
    console.log('='.repeat(50));
    console.log('🎉 Deployment completed!');
}

main().catch(console.error);
