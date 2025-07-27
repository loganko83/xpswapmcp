const { ethers } = require('ethers');
const fs = require('fs');
const solc = require('solc');
const path = require('path');

class SmartContractDeployer {
    constructor(privateKey, rpcUrl) {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        this.deployedContracts = new Map();
    }

    async compileContract(contractPath) {
        console.log(`Compiling contract: ${contractPath}`);
        
        const source = fs.readFileSync(contractPath, 'utf8');
        const contractName = path.basename(contractPath, '.sol');
        
        // Solidity 컴파일 설정
        const input = {
            language: 'Solidity',
            sources: {
                [contractName]: {
                    content: source,
                },
            },
            settings: {
                outputSelection: {
                    '*': {
                        '*': ['*'],
                    },
                },
            },
        };

        // Import 콜백 함수 (OpenZeppelin 등)
        function findImports(importPath) {
            try {
                if (importPath.startsWith('@openzeppelin/')) {
                    const libPath = path.join(__dirname, 'node_modules', importPath);
                    return { contents: fs.readFileSync(libPath, 'utf8') };
                }
                return { error: 'File not found' };
            } catch (error) {
                return { error: 'File not found' };
            }
        }

        const output = solc.compile(JSON.stringify(input), { import: findImports });
        const compilation = JSON.parse(output);

        if (compilation.errors) {
            const hasErrors = compilation.errors.some(error => error.severity === 'error');
            if (hasErrors) {
                console.error('Compilation errors:', compilation.errors);
                throw new Error('Contract compilation failed');
            }
        }

        const contract = compilation.contracts[contractName][contractName];
        return {
            abi: contract.abi,
            bytecode: contract.evm.bytecode.object,
            contractName
        };
    }

    async deployContract(contractPath, constructorArgs = []) {
        try {
            const { abi, bytecode, contractName } = await this.compileContract(contractPath);
            
            console.log(`Deploying ${contractName}...`);
            
            const factory = new ethers.ContractFactory(abi, bytecode, this.wallet);
            const contract = await factory.deploy(...constructorArgs);
            
            console.log(`${contractName} deployment transaction sent: ${contract.deploymentTransaction().hash}`);
            
            await contract.waitForDeployment();
            const address = await contract.getAddress();
            
            console.log(`${contractName} deployed to: ${address}`);
            
            this.deployedContracts.set(contractName, {
                address,
                abi,
                contract
            });
            
            return { address, abi, contractName };
        } catch (error) {
            console.error(`Failed to deploy ${path.basename(contractPath)}:`, error);
            throw error;
        }
    }

    async deployAllContracts() {
        const contracts = [
            { name: 'XpSwapToken', path: './contracts/XpSwapToken.sol', args: [] },
            { name: 'XpSwapLiquidityPool', path: './contracts/XpSwapLiquidityPool.sol', args: [] },
            { name: 'XpSwapDEX', path: './contracts/XpSwapDEX.sol', args: [] },
            { name: 'XpSwapAdvancedAMM', path: './contracts/XpSwapAdvancedAMM.sol', args: [] },
            { name: 'XpSwapStaking', path: './contracts/XpSwapStaking.sol', args: [] },
            { name: 'XpSwapFarmingRewards', path: './contracts/XpSwapFarmingRewards.sol', args: [] },
            { name: 'XpSwapGovernanceToken', path: './contracts/XpSwapGovernanceToken.sol', args: [] },
            { name: 'XpSwapRevenueManager', path: './contracts/XpSwapRevenueManager.sol', args: [] },
            { name: 'XpSwapCrosschainBridge', path: './contracts/XpSwapCrosschainBridge.sol', args: [] },
            { name: 'XPSwapFlashLoanSecurity', path: './contracts/XPSwapFlashLoanSecurity.sol', args: [] },
            { name: 'XPSwapMEVProtection', path: './contracts/XPSwapMEVProtection.sol', args: [] },
            { name: 'XPSwapSecurityEnhanced', path: './contracts/XPSwapSecurityEnhanced.sol', args: [] }
        ];

        const deploymentResults = [];
        
        for (const contractInfo of contracts) {
            try {
                const result = await this.deployContract(contractInfo.path, contractInfo.args);
                deploymentResults.push(result);
                
                // 가스비 절약을 위해 각 배포 사이에 잠시 대기
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.error(`Failed to deploy ${contractInfo.name}:`, error.message);
                deploymentResults.push({
                    contractName: contractInfo.name,
                    error: error.message
                });
            }
        }
        
        return deploymentResults;
    }

    async getWalletBalance() {
        const balance = await this.provider.getBalance(this.wallet.address);
        return ethers.formatEther(balance);
    }
}

module.exports = SmartContractDeployer;
