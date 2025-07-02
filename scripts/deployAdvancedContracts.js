const { ethers } = require("hardhat");

async function deployAdvancedContracts() {
    console.log("🚀 Deploying Advanced XpSwap Contracts to Xphere Network...");
    
    const [deployer] = await ethers.getSigners();
    console.log(`📝 Deploying with account: ${deployer.address}`);
    console.log(`💰 Account balance: ${ethers.utils.formatEther(await deployer.getBalance())} XP`);
    
    try {
        // Step 1: Deploy Governance Token
        console.log("\n1️⃣ Deploying XpSwap Governance Token...");
        const GovernanceToken = await ethers.getContractFactory("XpSwapGovernanceToken");
        const governanceToken = await GovernanceToken.deploy();
        await governanceToken.deployed();
        console.log(`✅ Governance Token deployed to: ${governanceToken.address}`);
        
        // Step 2: Deploy Advanced AMM
        console.log("\n2️⃣ Deploying Advanced AMM...");
        const AdvancedAMM = await ethers.getContractFactory("XpSwapAdvancedAMM");
        const advancedAMM = await AdvancedAMM.deploy(
            deployer.address, // fee recipient
            deployer.address  // emergency admin
        );
        await advancedAMM.deployed();
        console.log(`✅ Advanced AMM deployed to: ${advancedAMM.address}`);
        
        // Step 3: Deploy Liquidity Pool Template
        console.log("\n3️⃣ Deploying Liquidity Pool Template...");
        const LiquidityPool = await ethers.getContractFactory("XpSwapLiquidityPool");
        const liquidityPoolTemplate = await LiquidityPool.deploy(
            "0x0000000000000000000000000000000000000000", // placeholder tokenA
            "0x0000000000000000000000000000000000000000", // placeholder tokenB
            "XpSwap LP Template",
            "XPSLP"
        );
        await liquidityPoolTemplate.deployed();
        console.log(`✅ Liquidity Pool Template deployed to: ${liquidityPoolTemplate.address}`);
        
        // Step 4: Deploy Farming Rewards Template
        console.log("\n4️⃣ Deploying Farming Rewards Template...");
        const FarmingRewards = await ethers.getContractFactory("XpSwapFarmingRewards");
        const farmingRewardsTemplate = await FarmingRewards.deploy(
            "0x0000000000000000000000000000000000000000", // placeholder staking token
            governanceToken.address // rewards token
        );
        await farmingRewardsTemplate.deployed();
        console.log(`✅ Farming Rewards Template deployed to: ${farmingRewardsTemplate.address}`);
        
        // Step 5: Deploy Cross-chain Bridge
        console.log("\n5️⃣ Deploying Cross-chain Bridge...");
        const CrosschainBridge = await ethers.getContractFactory("XpSwapCrosschainBridge");
        const crosschainBridge = await CrosschainBridge.deploy();
        await crosschainBridge.deployed();
        console.log(`✅ Cross-chain Bridge deployed to: ${crosschainBridge.address}`);
        
        // Step 6: Setup initial configuration
        console.log("\n6️⃣ Setting up initial configuration...");
        
        // Authorize AMM to mint governance tokens
        await governanceToken.authorizeMinter(advancedAMM.address);
        console.log("✅ Authorized Advanced AMM to mint governance tokens");
        
        // Create initial XP-USDT pool in Advanced AMM
        const xpTokenAddress = "0x0000000000000000000000000000000000000001"; // Placeholder for XP token
        const usdtTokenAddress = "0x0000000000000000000000000000000000000002"; // Placeholder for USDT token
        
        try {
            const poolId = await advancedAMM.createAdvancedPool(
                xpTokenAddress,
                usdtTokenAddress,
                30, // 0.3% base fee
                ethers.utils.parseEther("0.022"), // Initial XP price
                ethers.utils.parseEther("1.0")    // Initial USDT price
            );
            console.log("✅ Created initial XP-USDT pool");
        } catch (error) {
            console.log("⚠️ Could not create initial pool (tokens not deployed)");
        }
        
        // Configure bridge for Ethereum mainnet
        await crosschainBridge.configureChain(1, {
            chainId: 1,
            minAmount: ethers.utils.parseEther("0.1"),
            maxAmount: ethers.utils.parseEther("10000"),
            dailyLimit: ethers.utils.parseEther("100000"),
            fee: 50, // 0.5%
            isActive: true
        });
        console.log("✅ Configured bridge for Ethereum mainnet");
        
        // Configure bridge for BSC
        await crosschainBridge.configureChain(56, {
            chainId: 56,
            minAmount: ethers.utils.parseEther("0.1"),
            maxAmount: ethers.utils.parseEther("10000"),
            dailyLimit: ethers.utils.parseEther("100000"),
            fee: 30, // 0.3%
            isActive: true
        });
        console.log("✅ Configured bridge for BSC");
        
        // Step 7: Verify deployments
        console.log("\n7️⃣ Verifying deployments...");
        
        // Check governance token
        const tokenName = await governanceToken.name();
        const tokenSymbol = await governanceToken.symbol();
        console.log(`✅ Governance Token: ${tokenName} (${tokenSymbol})`);
        
        // Check AMM
        const ammOwner = await advancedAMM.owner();
        console.log(`✅ Advanced AMM owner: ${ammOwner}`);
        
        // Check bridge
        const bridgeAdmin = await crosschainBridge.owner();
        console.log(`✅ Bridge admin: ${bridgeAdmin}`);
        
        // Step 8: Generate deployment summary
        const deploymentInfo = {
            network: "Xphere",
            chainId: 20250217,
            deployer: deployer.address,
            timestamp: new Date().toISOString(),
            contracts: {
                governanceToken: {
                    address: governanceToken.address,
                    name: "XpSwap Governance Token",
                    symbol: "XPSGOV"
                },
                advancedAMM: {
                    address: advancedAMM.address,
                    name: "XpSwap Advanced AMM"
                },
                liquidityPoolTemplate: {
                    address: liquidityPoolTemplate.address,
                    name: "XpSwap Liquidity Pool Template"
                },
                farmingRewardsTemplate: {
                    address: farmingRewardsTemplate.address,
                    name: "XpSwap Farming Rewards Template"
                },
                crosschainBridge: {
                    address: crosschainBridge.address,
                    name: "XpSwap Cross-chain Bridge"
                }
            },
            features: [
                "MEV Protection",
                "Dynamic Fee Pricing",
                "Price Impact Safeguards",
                "Yield Farming with Boosting",
                "Cross-chain Asset Transfer",
                "Governance Token Rewards",
                "Time-locked Liquidity",
                "Advanced Analytics"
            ]
        };
        
        console.log("\n🎉 Advanced Contract Deployment Complete!");
        console.log("=" * 60);
        console.log(JSON.stringify(deploymentInfo, null, 2));
        
        // Save deployment info to file
        const fs = require('fs');
        const path = require('path');
        
        const deploymentsDir = path.join(__dirname, '../deployments');
        if (!fs.existsSync(deploymentsDir)) {
            fs.mkdirSync(deploymentsDir, { recursive: true });
        }
        
        fs.writeFileSync(
            path.join(deploymentsDir, `advanced-deployment-${Date.now()}.json`),
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log("\n📁 Deployment info saved to deployments directory");
        
        return deploymentInfo;
        
    } catch (error) {
        console.error("❌ Deployment failed:", error);
        throw error;
    }
}

async function verifyDeployment(contractAddress, contractName) {
    try {
        console.log(`🔍 Verifying ${contractName} at ${contractAddress}...`);
        
        // Check if contract exists
        const code = await ethers.provider.getCode(contractAddress);
        if (code === "0x") {
            throw new Error("Contract not found at address");
        }
        
        console.log(`✅ ${contractName} verified successfully`);
        return true;
    } catch (error) {
        console.error(`❌ Verification failed for ${contractName}:`, error.message);
        return false;
    }
}

// Run deployment if script is executed directly
if (require.main === module) {
    deployAdvancedContracts()
        .then(() => {
            console.log("\n🚀 All advanced contracts deployed successfully!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("💥 Deployment failed:", error);
            process.exit(1);
        });
}

module.exports = {
    deployAdvancedContracts,
    verifyDeployment
};