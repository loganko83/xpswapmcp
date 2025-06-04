const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Xphere Network Configuration
const XPHERE_CONFIG = {
  chainId: 20250217,
  name: "Xphere",
  rpcUrl: "https://en-bkk.x-phere.com",
  nativeCurrency: {
    name: "Xphere",
    symbol: "XP", 
    decimals: 18
  }
};

async function deployToXphere() {
  console.log('🚀 Deploying XpSwap DEX to Xphere Network...');
  
  try {
    // Check for deployment private key
    const privateKey = process.env.XPHERE_DEPLOYER_KEY;
    if (!privateKey) {
      console.log('⚠️ XPHERE_DEPLOYER_KEY environment variable required for deployment');
      console.log('Please set your Xphere wallet private key in environment variables');
      return false;
    }

    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(XPHERE_CONFIG.rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log(`📝 Deployer address: ${wallet.address}`);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    const balanceXP = ethers.formatEther(balance);
    console.log(`💰 Deployer balance: ${balanceXP} XP`);
    
    if (parseFloat(balanceXP) < 0.1) {
      console.log('❌ Insufficient XP balance for deployment (minimum 0.1 XP required)');
      return false;
    }

    // Load compiled contract
    const artifactPath = path.join(__dirname, '../deployments/artifacts/XpSwapDEX.json');
    if (!fs.existsSync(artifactPath)) {
      console.log('❌ Contract artifact not found. Run compilation first: node scripts/compile.js');
      return false;
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    
    // Create contract factory
    const contractFactory = new ethers.ContractFactory(
      artifact.abi,
      artifact.bytecode,
      wallet
    );

    // Deploy contract
    console.log('📋 Deploying XpSwap DEX contract...');
    const feeRecipient = wallet.address; // Use deployer as initial fee recipient
    
    const contract = await contractFactory.deploy(feeRecipient, {
      gasLimit: 3000000,
      gasPrice: ethers.parseUnits('20', 'gwei')
    });
    
    console.log(`⏳ Transaction submitted: ${contract.deploymentTransaction().hash}`);
    
    // Wait for deployment
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    
    console.log(`✅ XpSwap DEX deployed at: ${contractAddress}`);

    // Create initial pools
    console.log('🏊 Creating initial liquidity pools...');
    
    const tokenContracts = {
      XP: "0x0000000000000000000000000000000000000000", // Native XP
      USDT: "0x55d398326f99059fF775485246999027B3197955", // Example USDT address
      ETH: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",  // Example ETH address
      BTC: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c"   // Example BTC address
    };

    // Create XP/USDT pool
    try {
      const tx1 = await contract.createPool(
        tokenContracts.XP,
        tokenContracts.USDT,
        30 // 0.3% fee
      );
      await tx1.wait();
      console.log('✅ XP/USDT pool created');
    } catch (error) {
      console.log('⚠️ XP/USDT pool creation failed:', error.message);
    }

    // Save deployment info
    const deploymentInfo = {
      network: 'xphere',
      chainId: XPHERE_CONFIG.chainId,
      contractAddress: contractAddress,
      deployer: wallet.address,
      deployedAt: new Date().toISOString(),
      transactionHash: contract.deploymentTransaction().hash,
      blockNumber: await provider.getBlockNumber(),
      abi: artifact.abi,
      bytecode: artifact.bytecode,
      initialPools: [
        {
          tokenA: tokenContracts.XP,
          tokenB: tokenContracts.USDT,
          feeRate: 30
        }
      ]
    };

    // Save deployment to file
    const deploymentsDir = path.join(__dirname, '../deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(deploymentsDir, 'xphere-mainnet.json'),
      JSON.stringify(deploymentInfo, null, 2)
    );

    // Update frontend contract addresses
    const contractConfigPath = path.join(__dirname, '../client/src/lib/xphereContract.ts');
    let contractConfig = fs.readFileSync(contractConfigPath, 'utf8');
    
    contractConfig = contractConfig.replace(
      'XPSWAP_DEX: "0x0000000000000000000000000000000000000000"',
      `XPSWAP_DEX: "${contractAddress}"`
    );
    
    fs.writeFileSync(contractConfigPath, contractConfig);

    console.log('📄 Deployment info saved to deployments/xphere-mainnet.json');
    console.log('🔧 Frontend contract addresses updated');
    console.log('🎉 Deployment completed successfully!');
    
    console.log('\n📋 Next steps:');
    console.log('1. Update token contract addresses in XPHERE_CONTRACTS');
    console.log('2. Test contract functions on Xphere network');
    console.log('3. Add initial liquidity to pools');
    console.log('4. Configure frontend for live trading');

    return {
      contractAddress,
      deploymentInfo
    };

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.log('💡 Solution: Add more XP tokens to your deployer wallet');
    } else if (error.code === 'NETWORK_ERROR') {
      console.log('💡 Solution: Check Xphere RPC URL and network connectivity');
    }
    throw error;
  }
}

// Verify deployment
async function verifyDeployment(contractAddress) {
  console.log(`🔍 Verifying deployment at ${contractAddress}...`);
  
  try {
    const provider = new ethers.JsonRpcProvider(XPHERE_CONFIG.rpcUrl);
    const code = await provider.getCode(contractAddress);
    
    if (code === '0x') {
      console.log('❌ No contract code found at address');
      return false;
    }
    
    console.log('✅ Contract code verified on Xphere network');
    
    // Load ABI and test basic functions
    const artifactPath = path.join(__dirname, '../deployments/artifacts/XpSwapDEX.json');
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    
    const contract = new ethers.Contract(contractAddress, artifact.abi, provider);
    
    // Test view functions
    try {
      const allPools = await contract.getAllPools();
      console.log(`📊 Total pools: ${allPools.length}`);
      
      // Check each pool
      for (let i = 0; i < allPools.length; i++) {
        const poolInfo = await contract.getPoolInfo(allPools[i]);
        console.log(`Pool ${i + 1}: ${poolInfo.tokenA}/${poolInfo.tokenB} (Fee: ${poolInfo.feeRate}bp)`);
      }
      
    } catch (error) {
      console.log('⚠️ Contract function test failed:', error.message);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

// Run deployment if called directly
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'verify') {
    const contractAddress = process.argv[3];
    if (!contractAddress) {
      console.log('Usage: node deployToXphere.js verify <contract_address>');
      process.exit(1);
    }
    
    verifyDeployment(contractAddress)
      .then(() => process.exit(0))
      .catch(error => {
        console.error(error);
        process.exit(1);
      });
  } else {
    deployToXphere()
      .then(() => process.exit(0))
      .catch(error => {
        console.error(error);
        process.exit(1);
      });
  }
}

module.exports = { deployToXphere, verifyDeployment };