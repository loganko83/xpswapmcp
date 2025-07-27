import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import solc from 'solc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 네트워크 설정
const XPHERE_RPC_URL = 'https://en-bkk.x-phere.com';
const CHAIN_ID = 20250217;

// 배포 지갑 정보
const PRIVATE_KEY = '0xaff93b56a157064b2a8f7bd0b04c5ef9fed6859bccc13d228ecb0fef4d9eb352';

// 컨트랙트 배포 순서
const CONTRACTS_TO_DEPLOY = [
    'XpSwapToken.sol',
    'XpSwapDEX.sol',
    'XpSwapLiquidityPool.sol',
    'XpSwapAdvancedAMM.sol',
    'XpSwapStaking.sol',
    'XpSwapFarmingRewards.sol',
    'XpSwapGovernanceToken.sol',
    'XpSwapRevenueManager.sol',
    'XpSwapCrosschainBridge.sol',
    'XPSwapFlashLoanSecurity.sol',
    'XPSwapMEVProtection.sol'
];

class ContractDeployer {
    constructor() {
        this.provider = new ethers.JsonRpcProvider(XPHERE_RPC_URL);
        this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider);
        this.deployedContracts = {};
    }

    // Solidity 파일 컴파일
    compileContract(contractName) {
        try {
            const contractPath = path.join(__dirname, 'contracts', contractName);
            const source = fs.readFileSync(contractPath, 'utf8');
            
            // OpenZeppelin 의존성 처리
            const sources = {
                [contractName]: {
                    content: source
                }
            };
            
            // @openzeppelin import 처리
            if (source.includes('@openzeppelin')) {
                const openzeppelinPath = path.join(__dirname, 'node_modules', '@openzeppelin', 'contracts');
                // 추가 OpenZeppelin 파일들을 여기서 처리할 수 있습니다
            }
            
            // Solidity 컴파일러 입력 설정
            const input = {
                language: 'Solidity',
                sources: sources,
                settings: {
                    outputSelection: {
                        '*': {
                            '*': ['abi', 'evm.bytecode']
                        }
                    },
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            };

            // 컴파일 실행
            const output = JSON.parse(solc.compile(JSON.stringify(input)));
            
            if (output.errors) {
                const errors = output.errors.filter(e => e.severity === 'error');
                if (errors.length > 0) {
                    console.log('🚨 컴파일 오류:');
                    errors.forEach(error => console.log('   -', error.message));
                    throw new Error(`Compilation errors: ${errors.map(e => e.message).join('\n')}`);
                }
                
                // 경고만 있는 경우 출력
                const warnings = output.errors.filter(e => e.severity === 'warning');
                if (warnings.length > 0) {
                    console.log('⚠️ 컴파일 경고:');
                    warnings.forEach(warning => console.log('   -', warning.message));
                }
            }

            const contractKey = Object.keys(output.contracts[contractName])[0];
            const contract = output.contracts[contractName][contractKey];
            
            return {
                abi: contract.abi,
                bytecode: contract.evm.bytecode.object
            };
        } catch (error) {
            throw new Error(`Failed to compile ${contractName}: ${error.message}`);
        }
    }

    // 컨트랙트 배포
    async deployContract(contractName, constructorArgs = []) {
        try {
            console.log(`\n🚀 배포 시작: ${contractName}`);
            
            // 컴파일
            const { abi, bytecode } = this.compileContract(contractName);
            
            if (!bytecode || bytecode.length === 0) {
                throw new Error('바이트코드가 비어있습니다. 컴파일을 확인하세요.');
            }
            
            // 컨트랙트 팩토리 생성
            const contractFactory = new ethers.ContractFactory(abi, '0x' + bytecode, this.wallet);
            
            // 가스 예상
            let estimatedGas;
            try {
                estimatedGas = await contractFactory.getDeployTransaction(...constructorArgs).then(tx => 
                    this.provider.estimateGas(tx)
                );
            } catch (gasError) {
                console.log('   가스 예상 실패, 기본값 사용');
                estimatedGas = 3000000n; // 기본 가스 한도
            }
            
            console.log(`   예상 가스: ${estimatedGas.toString()}`);
            
            // 배포 실행
            const contract = await contractFactory.deploy(...constructorArgs, {
                gasLimit: estimatedGas * 120n / 100n // 20% 여유분
            });
            
            console.log(`   트랜잭션 해시: ${contract.deploymentTransaction().hash}`);
            console.log(`   배포 중... 대기 중...`);
            
            // 배포 완료 대기
            await contract.waitForDeployment();
            
            const address = await contract.getAddress();
            console.log(`   ✅ 배포 완료: ${address}`);
            
            // 배포된 컨트랙트 저장
            this.deployedContracts[contractName.replace('.sol', '')] = {
                address: address,
                abi: abi,
                contract: contract
            };
            
            return {
                address: address,
                abi: abi,
                transactionHash: contract.deploymentTransaction().hash
            };
            
        } catch (error) {
            console.error(`❌ ${contractName} 배포 실패:`, error.message);
            throw error;
        }
    }

    // 모든 컨트랙트 배포
    async deployAllContracts() {
        console.log('🌟 XPSwap 스마트 컨트랙트 배포 시작');
        console.log(`📍 네트워크: Xphere Network (Chain ID: ${CHAIN_ID})`);
        console.log(`💰 배포 지갑: ${this.wallet.address}`);
        
        // 잔액 확인
        const balance = await this.provider.getBalance(this.wallet.address);
        console.log(`💎 잔액: ${ethers.formatEther(balance)} XP`);
        
        if (balance < ethers.parseEther('1')) {
            throw new Error('가스비 부족! 최소 1 XP가 필요합니다.');
        }
        
        const results = {};
        
        try {
            // 1. XPSwapToken (XPS 토큰) 배포
            results.XpSwapToken = await this.deployContract('XpSwapToken.sol');
            
            // 2. XPSwapDEX (메인 DEX) 배포
            results.XpSwapDEX = await this.deployContract('XpSwapDEX.sol');
            
            // 3. 유동성 풀 배포
            results.XpSwapLiquidityPool = await this.deployContract('XpSwapLiquidityPool.sol');
            
            // 4. 고급 AMM 배포
            results.XpSwapAdvancedAMM = await this.deployContract('XpSwapAdvancedAMM.sol');
            
            // 5. 스테이킹 배포
            results.XpSwapStaking = await this.deployContract('XpSwapStaking.sol');
            
            // 6. 파밍 보상 배포
            results.XpSwapFarmingRewards = await this.deployContract('XpSwapFarmingRewards.sol');
            
            // 7. 거버넌스 토큰 배포
            results.XpSwapGovernanceToken = await this.deployContract('XpSwapGovernanceToken.sol');
            
            // 8. 수익 관리자 배포
            results.XpSwapRevenueManager = await this.deployContract('XpSwapRevenueManager.sol');
            
            // 9. 크로스체인 브리지 배포
            results.XpSwapCrosschainBridge = await this.deployContract('XpSwapCrosschainBridge.sol');
            
            // 10. 플래시론 보안 배포
            results.XPSwapFlashLoanSecurity = await this.deployContract('XPSwapFlashLoanSecurity.sol');
            
            // 11. MEV 보호 배포
            results.XPSwapMEVProtection = await this.deployContract('XPSwapMEVProtection.sol');
            
            // 배포 결과 저장
            const deploymentResult = {
                timestamp: new Date().toISOString(),
                network: 'Xphere Network',
                chainId: CHAIN_ID,
                deployer: this.wallet.address,
                contracts: results
            };
            
            // 결과를 파일로 저장
            fs.writeFileSync(
                path.join(__dirname, 'deployment-result.json'),
                JSON.stringify(deploymentResult, null, 2)
            );
            
            console.log('\n🎉 모든 컨트랙트 배포 완료!');
            console.log('📄 배포 결과가 deployment-result.json에 저장되었습니다.');
            
            return deploymentResult;
            
        } catch (error) {
            console.error('\n❌ 배포 중 오류 발생:', error.message);
            throw error;
        }
    }

    // 잔액 확인
    async checkBalance() {
        const balance = await this.provider.getBalance(this.wallet.address);
        return {
            address: this.wallet.address,
            balance: ethers.formatEther(balance),
            balanceWei: balance.toString()
        };
    }
}

// 실행부
async function main() {
    const deployer = new ContractDeployer();
    
    try {
        // 잔액 확인
        const balanceInfo = await deployer.checkBalance();
        console.log('💰 잔액 확인:', balanceInfo);
        
        // 배포 실행
        const result = await deployer.deployAllContracts();
        
        console.log('\n✅ 배포 성공!');
        console.log('🔗 배포된 컨트랙트 주소들:');
        
        Object.entries(result.contracts).forEach(([name, info]) => {
            console.log(`   ${name}: ${info.address}`);
        });
        
        return result;
        
    } catch (error) {
        console.error('💥 배포 실패:', error.message);
        process.exit(1);
    }
}

// 직접 실행 시
main().catch(console.error);

export { ContractDeployer };
