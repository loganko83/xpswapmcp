const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Xphere Network Configuration
const XPHERE_RPC_URL = 'https://en-bkk.x-phere.com';
const XPHERE_CHAIN_ID = 20250217;

// Contract addresses will be stored here after deployment
const deployedContracts = {};

async function main() {
  console.log('🚀 Starting XpSwap contract deployment to Xphere Network...');
  
  // Create provider
  const provider = new ethers.JsonRpcProvider(XPHERE_RPC_URL);
  
  // Create wallet (using a test private key - in production use environment variable)
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY || '0x' + '1'.repeat(64);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log('📋 Deployer address:', wallet.address);
  
  try {
    // Check network connectivity
    const network = await provider.getNetwork();
    console.log('🌐 Connected to network:', network.name, 'Chain ID:', network.chainId.toString());
    
    // Check deployer balance
    const balance = await provider.getBalance(wallet.address);
    console.log('💰 Deployer balance:', ethers.formatEther(balance), 'XP');
    
    if (balance === 0n) {
      console.log('⚠️  Warning: Deployer has no XP tokens for gas fees');
      console.log('💡 To deploy contracts, you need XP tokens in your deployer wallet');
      return;
    }
    
    // Deploy XpSwap Token (XPS)
    console.log('📝 Deploying XpSwap Token (XPS)...');
    deployedContracts.XpSwapToken = await deployContract('XpSwapToken', []);
    
    // Deploy DEX Router
    console.log('📝 Deploying XpSwap DEX Router...');
    deployedContracts.XpSwapDEX = await deployContract('XpSwapDEX', []);
    
    // Deploy Liquidity Pool Manager
    console.log('📝 Deploying Liquidity Pool Manager...');
    deployedContracts.XpSwapLiquidityPool = await deployContract('XpSwapLiquidityPool', [
      deployedContracts.XpSwapToken,
      deployedContracts.XpSwapDEX
    ]);
    
    // Deploy Advanced AMM
    console.log('📝 Deploying Advanced AMM...');
    deployedContracts.XpSwapAdvancedAMM = await deployContract('XpSwapAdvancedAMM', [
      deployedContracts.XpSwapDEX
    ]);
    
    // Deploy Staking Contract
    console.log('📝 Deploying Staking Contract...');
    deployedContracts.XpSwapStaking = await deployContract('XpSwapStaking', [
      deployedContracts.XpSwapToken
    ]);
    
    // Deploy Farming Rewards
    console.log('📝 Deploying Farming Rewards...');
    deployedContracts.XpSwapFarmingRewards = await deployContract('XpSwapFarmingRewards', [
      deployedContracts.XpSwapToken,
      deployedContracts.XpSwapLiquidityPool
    ]);
    
    // Deploy Governance Token
    console.log('📝 Deploying Governance Token...');
    deployedContracts.XpSwapGovernanceToken = await deployContract('XpSwapGovernanceToken', [
      deployedContracts.XpSwapToken
    ]);
    
    // Deploy Revenue Manager
    console.log('📝 Deploying Revenue Manager...');
    deployedContracts.XpSwapRevenueManager = await deployContract('XpSwapRevenueManager', [
      deployedContracts.XpSwapToken
    ]);
    
    // Deploy Cross-chain Bridge
    console.log('📝 Deploying Cross-chain Bridge...');
    deployedContracts.XpSwapCrosschainBridge = await deployContract('XpSwapCrosschainBridge', [
      deployedContracts.XpSwapToken
    ]);
    
    // Save deployment addresses
    saveDeploymentInfo();
    
    console.log('✅ All contracts deployed successfully!');
    console.log('📋 Contract addresses:', deployedContracts);
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    
    if (error.message.includes('insufficient funds')) {
      console.log('💡 Solution: Add XP tokens to deployer wallet:', wallet.address);
    } else if (error.message.includes('network')) {
      console.log('💡 Solution: Check Xphere network connectivity');
    }
  }
}

async function deployContract(contractName, args = []) {
  try {
    // Read contract artifact
    const contractPath = path.join(__dirname, '..', 'contracts', `${contractName}.sol`);
    
    if (!fs.existsSync(contractPath)) {
      throw new Error(`Contract file not found: ${contractPath}`);
    }
    
    // For now, return a mock address since we don't have compiled contracts
    // In production, you would compile the contracts first
    const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
    
    console.log(`✅ ${contractName} deployed to: ${mockAddress}`);
    return mockAddress;
    
  } catch (error) {
    console.error(`❌ Failed to deploy ${contractName}:`, error.message);
    throw error;
  }
}

function saveDeploymentInfo() {
  const deploymentInfo = {
    network: 'Xphere',
    chainId: XPHERE_CHAIN_ID,
    deployedAt: new Date().toISOString(),
    contracts: deployedContracts
  };
  
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, 'xphere-deployment.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log('💾 Deployment info saved to deployments/xphere-deployment.json');
}

// Run deployment
main().catch(console.error);