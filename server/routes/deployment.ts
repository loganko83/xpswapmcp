import { Router } from "express";
import { BlockchainService } from "../services/blockchain";

const router = Router();
const blockchainService = new BlockchainService();

// Generate new deployment wallet
router.get("/generate-wallet", async (req, res) => {
  try {
    const wallet = await blockchainService.getDeploymentWallet();
    res.json({
      success: true,
      wallet: {
        address: wallet.address,
        mnemonic: wallet.mnemonic,
        message: wallet.message
      }
    });
  } catch (error) {
    console.error("Error generating wallet:", error);
    res.status(500).json({ error: "Failed to generate deployment wallet" });
  }
});

// Check wallet balance
router.get("/check-balance/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const balance = await blockchainService.checkBalance(address);
    res.json({
      success: true,
      address,
      balance: balance + " XP",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error checking balance:", error);
    res.status(500).json({ error: "Failed to check balance" });
  }
});

// Deploy contracts
router.post("/deploy", async (req, res) => {
  try {
    const { privateKey } = req.body;
    
    if (!privateKey) {
      return res.status(400).json({ error: "Private key is required" });
    }

    const result = await blockchainService.deployContracts(privateKey);
    res.json(result);
  } catch (error) {
    console.error("Error deploying contracts:", error);
    res.status(500).json({ error: "Failed to deploy contracts: " + error.message });
  }
});

// Get deployment status
router.get("/deployment-status", async (req, res) => {
  try {
    // Check if contracts are deployed by looking at constants file
    const fs = require('fs');
    const path = require('path');
    const constantsPath = path.join(__dirname, '../../client/src/lib/constants.ts');
    
    if (fs.existsSync(constantsPath)) {
      const content = fs.readFileSync(constantsPath, 'utf8');
      const hasContracts = content.includes('CONTRACT_ADDRESSES');
      
      res.json({
        success: true,
        deployed: hasContracts,
        message: hasContracts 
          ? "Contracts are deployed and configured"
          : "Contracts not yet deployed",
        recommendedWallet: "0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A" // Previous working wallet
      });
    } else {
      res.json({
        success: true,
        deployed: false,
        message: "Configuration file not found"
      });
    }
  } catch (error) {
    console.error("Error checking deployment status:", error);
    res.status(500).json({ error: "Failed to check deployment status" });
  }
});

export default router;
