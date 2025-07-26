import { Router } from "express";
import { SecurityUtils, stakingRecords, farmStakingRecords } from "./common.js";

const router = Router();

// Liquidity pools routes
router.get("/pools", async (req, res) => {
  try {
    // Return mock pool data for now to avoid database errors
    const mockPools = [
      {
        id: 1,
        pairId: 1,
        totalLiquidity: "10100000",
        apr: "125.5",
        rewardTokens: ["XP"],
        isActive: true,
        createdAt: new Date().toISOString(),
        pair: {
          id: 1,
          tokenAId: 1,
          tokenBId: 2,
          liquidityTokenA: "5000000",
          liquidityTokenB: "5000000",
          volume24h: "3600000",
          price: "1.0",
          priceChange24h: "8.7",
          isActive: true,
          tokenA: {
            id: 1,
            symbol: "XP",
            name: "Xphere",
            address: "0x0000000000000000000000000000000000000000",
            decimals: 18,
            logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/36056.png",
            isActive: true
          },
          tokenB: {
            id: 2,
            symbol: "USDT",
            name: "Tether USD",
            address: "0x6485cc42b36b4c982d3f1b6ec42b92007fb0b596",
            decimals: 18,
            logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
            isActive: true
          }
        }
      },
      {
        id: 2,
        pairId: 2,
        totalLiquidity: "6800000",
        apr: "98.3",
        rewardTokens: ["XP"],
        isActive: true,
        createdAt: new Date().toISOString(),
        pair: {
          id: 2,
          tokenAId: 1,
          tokenBId: 3,
          liquidityTokenA: "3500000",
          liquidityTokenB: "1000",
          volume24h: "890000",
          price: "3500",
          priceChange24h: "-1.2",
          isActive: true,
          tokenA: {
            id: 1,
            symbol: "XP",
            name: "Xphere",
            address: "0x0000000000000000000000000000000000000000",
            decimals: 18,
            logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/36056.png",
            isActive: true
          },
          tokenB: {
            id: 3,
            symbol: "ETH",
            name: "Ethereum",
            address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            decimals: 18,
            logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
            isActive: true
          }
        }
      },
      {
        id: 3,
        pairId: 3,
        totalLiquidity: "4200000",
        apr: "76.1",
        rewardTokens: ["XP"],
        isActive: true,
        createdAt: new Date().toISOString(),
        pair: {
          id: 3,
          tokenAId: 4,
          tokenBId: 2,
          liquidityTokenA: "100",
          liquidityTokenB: "4200000",
          volume24h: "654000",
          price: "42000",
          priceChange24h: "0.8",
          isActive: true,
          tokenA: {
            id: 4,
            symbol: "BTC",
            name: "Bitcoin",
            address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
            decimals: 8,
            logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
            isActive: true
          },
          tokenB: {
            id: 2,
            symbol: "USDT",
            name: "Tether USD",
            address: "0x6485cc42b36b4c982d3f1b6ec42b92007fb0b596",
            decimals: 18,
            logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
            isActive: true
          }
        }
      }
    ];

    res.json(mockPools);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch liquidity pools" });
  }
});

// Yield farming endpoints
router.get("/farms", async (req, res) => {
  try {
    const farms = [
      {
        id: 1,
        poolId: 1,
        name: "XP-USDT Farm",
        token: "XP-USDT LP",
        apr: "245.5%",
        totalStaked: "8,934,567",
        rewardToken: "XP",
        multiplier: "40x",
        allocation: "40%",
        status: "active",
        lockPeriod: 0,
        harvestFee: "0%",
        depositFee: "0%"
      },
      {
        id: 2,
        poolId: 2,
        name: "XP-ETH Farm",
        token: "XP-ETH LP",
        apr: "189.2%",
        totalStaked: "3,456,789",
        rewardToken: "XP",
        multiplier: "25x",
        allocation: "25%",
        status: "active",
        lockPeriod: 0,
        harvestFee: "0%",
        depositFee: "0%"
      },
      {
        id: 3,
        poolId: 3,
        name: "BTC-USDT Farm", 
        token: "BTC-USDT LP",
        apr: "124.8%",
        totalStaked: "2,123,456",
        rewardToken: "XP",
        multiplier: "15x",
        allocation: "15%",
        status: "active",
        lockPeriod: 0,
        harvestFee: "0%",
        depositFee: "0%"
      }
    ];

    res.json(farms);
  } catch (error) {
    console.error("Failed to fetch farms:", error);
    res.status(500).json({ error: "Failed to fetch farms" });
  }
});

// Staking info for specific farm
router.get("/farms/:farmId/staking-info", async (req, res) => {
  try {
    const { farmId } = req.params;
    const userAddress = req.query.userAddress as string;

    if (!userAddress) {
      return res.status(400).json({ error: "User address required" });
    }

    // Find user's staking records for this farm
    const userStakes = farmStakingRecords.filter(record => 
      record.farmId === farmId && 
      record.userAddress === userAddress &&
      record.isActive
    );

    const totalStaked = userStakes.reduce((sum, stake) => sum + stake.amount, 0);
    const totalRewards = userStakes.reduce((sum, stake) => {
      // Calculate rewards based on time staked
      const timeStaked = Date.now() - stake.stakedAt;
      const daysStaked = timeStaked / (1000 * 60 * 60 * 24);
      const dailyReward = stake.amount * 0.005; // 0.5% daily
      return sum + (dailyReward * daysStaked);
    }, 0);

    res.json({
      farmId,
      userAddress,
      totalStaked: totalStaked.toString(),
      totalRewards: totalRewards.toString(),
      stakingRecords: userStakes
    });
  } catch (error) {
    console.error("Failed to fetch staking info:", error);
    res.status(500).json({ error: "Failed to fetch staking info" });
  }
});

// Farm Staking APIs
router.post("/stake-tokens", async (req, res) => {
  try {
    const { farmId, amount, lockPeriod, userAddress } = req.body;
    
    if (!farmId || !amount || !userAddress) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Create staking record
    const stakeRecord = {
      id: Date.now().toString(),
      farmId,
      userAddress,
      amount: parseFloat(amount),
      lockPeriod: parseInt(lockPeriod) || 30,
      stakedAt: Date.now(),
      unlockAt: Date.now() + (parseInt(lockPeriod) || 30) * 24 * 60 * 60 * 1000,
      rewards: 0,
      isActive: true
    };
    
    farmStakingRecords.push(stakeRecord);
    
    res.json({
      success: true,
      message: "Tokens staked successfully",
      stakeRecord
    });
  } catch (error) {
    console.error("Stake tokens error:", error);
    res.status(500).json({ error: "Failed to stake tokens" });
  }
});

router.post("/unstake-tokens", async (req, res) => {
  try {
    const { farmId, amount, userAddress } = req.body;
    
    if (!farmId || !amount || !userAddress) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Find user's staking record
    const userStakes = farmStakingRecords.filter(record => 
      record.farmId === farmId && 
      record.userAddress === userAddress && 
      record.isActive
    );
    
    if (userStakes.length === 0) {
      return res.status(400).json({ error: "No active stakes found" });
    }
    
    // Check if lock period has passed
    const now = Date.now();
    let totalUnstaked = 0;
    const unstakeAmount = parseFloat(amount);
    
    for (const stake of userStakes) {
      if (now < stake.unlockAt) {
        return res.status(400).json({ error: "Lock period has not ended" });
      }
      
      if (totalUnstaked >= unstakeAmount) break;
      
      const amountToUnstake = Math.min(stake.amount, unstakeAmount - totalUnstaked);
      stake.amount -= amountToUnstake;
      totalUnstaked += amountToUnstake;
      
      if (stake.amount <= 0) {
        stake.isActive = false;
      }
    }
    
    res.json({
      success: true,
      message: "Tokens unstaked successfully",
      unstakedAmount: totalUnstaked
    });
  } catch (error) {
    console.error("Unstake tokens error:", error);
    res.status(500).json({ error: "Failed to unstake tokens" });
  }
});

// XPS Staking endpoints
router.post("/stake", async (req, res) => {
  try {
    const { amount, duration, userAddress } = req.body;
    
    if (!amount || !duration || !userAddress) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Calculate APY based on duration
    let apy = 150; // Default 150%
    if (duration >= 365) apy = 400;
    else if (duration >= 180) apy = 250;
    else if (duration >= 90) apy = 150;
    
    const stakeRecord = {
      id: Date.now().toString(),
      userAddress,
      amount: parseFloat(amount),
      duration: parseInt(duration),
      apy,
      stakedAt: Date.now(),
      unlockAt: Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000,
      rewards: 0,
      isActive: true
    };
    
    stakingRecords.push(stakeRecord);
    
    res.json({
      success: true,
      message: "XPS tokens staked successfully",
      apy,
      estimatedRewards: (parseFloat(amount) * apy / 100 * parseInt(duration) / 365).toFixed(6),
      txHash: SecurityUtils.generateTxHash()
    });
  } catch (error) {
    console.error("XPS staking error:", error);
    res.status(500).json({ error: "Failed to stake XPS tokens" });
  }
});

router.post("/unstake", async (req, res) => {
  try {
    const { stakeId, userAddress } = req.body;
    
    if (!stakeId || !userAddress) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const stakeIndex = stakingRecords.findIndex(record => 
      record.id === stakeId && 
      record.userAddress === userAddress &&
      record.isActive
    );
    
    if (stakeIndex === -1) {
      return res.status(400).json({ error: "Stake record not found" });
    }
    
    const stake = stakingRecords[stakeIndex];
    
    // Check if lock period has passed
    if (Date.now() < stake.unlockAt) {
      return res.status(400).json({ error: "Lock period has not ended" });
    }
    
    // Calculate rewards
    const timeStaked = Date.now() - stake.stakedAt;
    const daysStaked = timeStaked / (1000 * 60 * 60 * 24);
    const rewards = stake.amount * (stake.apy / 100) * (daysStaked / 365);
    
    stake.isActive = false;
    stake.rewards = rewards;
    
    res.json({
      success: true,
      message: "XPS tokens unstaked successfully",
      amount: stake.amount,
      rewards: rewards.toFixed(6),
      txHash: SecurityUtils.generateTxHash()
    });
  } catch (error) {
    console.error("XPS unstaking error:", error);
    res.status(500).json({ error: "Failed to unstake XPS tokens" });
  }
});

// Farming analytics
router.get("/api/farming-analytics/:poolId", async (req, res) => {
  try {
    const { poolId } = req.params;
    
    // Generate mock farming analytics data
    const analytics = {
      poolId,
      totalLiquidity: SecurityUtils.getSecureRandomInt(1000000, 10000000),
      volume24h: SecurityUtils.getSecureRandomInt(100000, 1000000),
      fees24h: SecurityUtils.getSecureRandomInt(1000, 10000),
      apr: SecurityUtils.getSecureRandomInt(50, 300),
      participants: SecurityUtils.getSecureRandomInt(100, 2000),
      rewardsDistributed: SecurityUtils.getSecureRandomInt(10000, 100000)
    };
    
    res.json(analytics);
  } catch (error) {
    console.error("Failed to fetch farming analytics:", error);
    res.status(500).json({ error: "Failed to fetch farming analytics" });
  }
});

export default router;
