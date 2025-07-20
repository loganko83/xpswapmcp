            premium: 0.002,
            volume: 1250,
            openInterest: 890,
            impliedVolatility: 0.65,
            delta: 0.42,
            theta: -0.003,
            gamma: 15.2,
            vega: 0.12
          },
          position: "long",
          quantity: 5,
          entryPrice: 0.002,
          currentPrice: 0.0025,
          pnl: 12.5,
          pnlPercentage: 25.0
        },
        {
          id: "pos_002",
          contract: {
            id: "opt_002",
            type: "put",
            underlying: "XP",
            strikePrice: 0.012,
            expiryDate: "2025-08-20T16:00:00Z",
            premium: 0.0015,
            volume: 820,
            openInterest: 650,
            impliedVolatility: 0.72,
            delta: -0.35,
            theta: -0.002,
            gamma: 12.8,
            vega: 0.09
          },
          position: "short",
          quantity: 3,
          entryPrice: 0.0015,
          currentPrice: 0.001,
          pnl: 1.5,
          pnlPercentage: 33.33
        }
      ];
      
      res.json(mockPositions);
    } catch (error) {
      console.error("Error fetching option positions:", error);
      res.status(500).json({ error: "Failed to fetch option positions" });
    }
  });

  // Get option analytics
  app.get("/api/options/analytics", async (req, res) => {
    try {
      const analytics = {
        volume24h: 125000,
        openInterest: 2500000,
        activeContracts: 47,
        avgImpliedVolatility: 64.5,
        topContracts: [
          { symbol: "XP-CALL-0.015", volume: 1250 },
          { symbol: "XPS-PUT-1.00", volume: 890 },
          { symbol: "BTC-CALL-70000", volume: 650 }
        ]
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching option analytics:", error);
      res.status(500).json({ error: "Failed to fetch option analytics" });
    }
  });

  // Place option trade
  app.post("/api/options/trade", async (req, res) => {
    try {
      const { address, underlying, type, strikePrice, expiry, quantity, orderType } = req.body;
      
      // Mock option trading
      const txHash = `0x${getSecureRandom().toString(16).substr(2, 64)}`;
      const timestamp = Date.now();
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      res.json({
        success: true,
        txHash,
        orderId: `order_${timestamp}`,
        details: {
          underlying,
          type,
          strikePrice,
          expiry,
          quantity,
          orderType,
          estimatedPremium: quantity * strikePrice * 0.05
        },
        timestamp
      });
    } catch (error) {
      console.error("Error placing option trade:", error);
      res.status(500).json({ error: "Failed to place option trade" });
    }
  });

  // ========== PERPETUAL FUTURES API ==========
  
  // Get perpetual contracts
  app.get("/api/perpetuals/contracts", async (req, res) => {
    try {
      const contracts = [
        {
          symbol: "XP-PERP",
          markPrice: 0.014594,
          indexPrice: 0.014612,
          fundingRate: 0.0001,
          nextFundingTime: "2025-07-21T00:00:00Z",
          volume24h: 245000,
          openInterest: 1800000,
          maxLeverage: 100,
          minOrderSize: 10,
          priceChange24h: 0.0008,
          priceChangePercent24h: 5.82
        },
        {
          symbol: "XPS-PERP",
          markPrice: 1.0025,
          indexPrice: 1.0020,
          fundingRate: -0.00005,
          nextFundingTime: "2025-07-21T00:00:00Z",
          volume24h: 89000,
          openInterest: 650000,
          maxLeverage: 50,
          minOrderSize: 1,
          priceChange24h: 0.0125,
          priceChangePercent24h: 1.26
        },
        {
          symbol: "BTC-PERP",
          markPrice: 67850.50,
          indexPrice: 67845.25,
          fundingRate: 0.00008,
          nextFundingTime: "2025-07-21T00:00:00Z",
          volume24h: 15000000,
          openInterest: 450000000,
          maxLeverage: 125,
          minOrderSize: 0.001,
          priceChange24h: 1250.50,
          priceChangePercent24h: 1.88
        },
        {
          symbol: "ETH-PERP",
          markPrice: 3420.75,
          indexPrice: 3418.90,
          fundingRate: 0.00012,
          nextFundingTime: "2025-07-21T00:00:00Z",
          volume24h: 8500000,
          openInterest: 125000000,
          maxLeverage: 100,
          minOrderSize: 0.01,
          priceChange24h: 85.25,
          priceChangePercent24h: 2.55
        }
      ];
      
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching perpetual contracts:", error);
      res.status(500).json({ error: "Failed to fetch perpetual contracts" });
    }
  });

  // Get perpetual positions
  app.get("/api/perpetuals/positions", async (req, res) => {
    try {
      const { address } = req.query;
      
      if (!address) {
        return res.json([]);
      }
      
      const positions = [
        {
          id: "perp_pos_001",
          symbol: "XP-PERP",
          side: "long",
          size: 10000,
          leverage: 10,
          entryPrice: 0.0138,
          markPrice: 0.014594,
          liquidationPrice: 0.01242,
          unrealizedPnl: 61.4,
          unrealizedPnlPercent: 44.49,
          margin: 138,
          maintenanceMargin: 5.52,
          marginRatio: 0.04,
          fundingCost: -2.15
        },
        {
          id: "perp_pos_002",
          symbol: "BTC-PERP",
          side: "short",
          size: 5000,
          leverage: 25,
          entryPrice: 68500.00,
          markPrice: 67850.50,
          liquidationPrice: 71225.00,
          unrealizedPnl: 324.75,
          unrealizedPnlPercent: 162.38,
          margin: 200,
          maintenanceMargin: 13.57,
          marginRatio: 0.068,
          fundingCost: 8.95
        }
      ];
      
      res.json(positions);
    } catch (error) {
      console.error("Error fetching perpetual positions:", error);
      res.status(500).json({ error: "Failed to fetch perpetual positions" });
    }
  });

  // Get perpetual analytics
  app.get("/api/perpetuals/analytics", async (req, res) => {
    try {
      const analytics = {
        volume24h: 24500000,
        openInterest: 580000000,
        activeTraders: 2847,
        longShortRatio: 1.25,
        topVolume: [
          { symbol: "BTC-PERP", volume: 15000000 },
          { symbol: "ETH-PERP", volume: 8500000 },
          { symbol: "XP-PERP", volume: 245000 }
        ]
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching perpetual analytics:", error);
      res.status(500).json({ error: "Failed to fetch perpetual analytics" });
    }
  });

  // Place perpetual trade
  app.post("/api/perpetuals/trade", async (req, res) => {
    try {
      const { address, symbol, side, size, leverage, orderType, limitPrice, stopLoss, takeProfit } = req.body;
      
      // Mock perpetual trading
      const txHash = `0x${getSecureRandom().toString(16).substr(2, 64)}`;
      const timestamp = Date.now();
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      res.json({
        success: true,
        txHash,
        orderId: `perp_order_${timestamp}`,
        details: {
          symbol,
          side,
          size,
          leverage,
          orderType,
          limitPrice,
          stopLoss,
          takeProfit,
          estimatedMargin: size / leverage,
          estimatedFee: size * 0.001
        },
        timestamp
      });
    } catch (error) {
      console.error("Error placing perpetual trade:", error);
      res.status(500).json({ error: "Failed to place perpetual trade" });
    }
  });

  // Close perpetual position
  app.post("/api/perpetuals/close/:positionId", async (req, res) => {
    try {
      const { positionId } = req.params;
      const { address } = req.body;
      
      // Mock position closing
      const txHash = `0x${getSecureRandom().toString(16).substr(2, 64)}`;
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      res.json({
        success: true,
        txHash,
        positionId,
        message: "Position closed successfully",
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Error closing perpetual position:", error);
      res.status(500).json({ error: "Failed to close position" });
    }
  });

  // ========== FLASH LOANS API ==========
  
  // Get flash loan pools
  app.get("/api/flashloans/pools", async (req, res) => {
    try {
      const pools = [
        {
          token: "0x1234...abcd",
          symbol: "XP",
          available: 5000000,
          fee: 0.0009,
          maxAmount: 10000000,
          utilizationRate: 0.35
        },
        {
          token: "0x5678...efgh",
          symbol: "XPS",
          available: 2500000,
          fee: 0.0005,
          maxAmount: 5000000,
          utilizationRate: 0.42
        },
        {
          token: "0x9abc...ijkl",
          symbol: "USDT",
          available: 15000000,
          fee: 0.0003,
          maxAmount: 25000000,
          utilizationRate: 0.58
        },
        {
          token: "0xdef0...mnop",
          symbol: "ETH",
          available: 8500,
          fee: 0.0005,
          maxAmount: 15000,
          utilizationRate: 0.28
        }
      ];
      
      res.json(pools);
    } catch (error) {
      console.error("Error fetching flash loan pools:", error);
      res.status(500).json({ error: "Failed to fetch flash loan pools" });
    }
  });

  // Get flash loan templates
  app.get("/api/flashloans/templates", async (req, res) => {
    try {
      const templates = [
        {
          id: "template_001",
          name: "Simple Arbitrage",
          description: "Basic arbitrage between two DEXs with price difference detection",
          category: "Arbitrage",
          difficulty: "beginner",
          estimatedGas: 350000,
          code: `// Simple arbitrage template
function executeArbitrage(
    address tokenA,
    address tokenB,
    uint256 amount,
    address dex1,
    address dex2
) external {
    // 1. Get flash loan
    flashLoan(tokenA, amount);
    
    // 2. Swap on DEX1
    uint256 output1 = swapOnDEX(dex1, tokenA, tokenB, amount);
    
    // 3. Swap back on DEX2
    uint256 output2 = swapOnDEX(dex2, tokenB, tokenA, output1);
    
    // 4. Repay loan + fee
    require(output2 > amount + fee, "No profit");
    repayLoan(tokenA, amount + fee);
    
    // 5. Keep profit
    uint256 profit = output2 - amount - fee;
    transfer(msg.sender, profit);
}`
        },
        {
          id: "template_002",
          name: "Liquidation Bot",
          description: "Automated liquidation of undercollateralized positions",
          category: "Liquidation",
          difficulty: "intermediate",
          estimatedGas: 520000,
          code: `// Liquidation template
function executeLiquidation(
    address protocol,
    address borrower,
    address collateralToken,
    address debtToken,
    uint256 debtAmount
) external {
    // 1. Flash loan debt token
    flashLoan(debtToken, debtAmount);
    
    // 2. Liquidate position
    liquidate(protocol, borrower, debtToken, debtAmount);
    
    // 3. Receive collateral at discount
    uint256 collateralReceived = getCollateralReceived();
    
    // 4. Swap collateral to debt token
    uint256 debtTokenReceived = swap(collateralToken, debtToken, collateralReceived);
    
    // 5. Repay flash loan
    repayLoan(debtToken, debtAmount + fee);
    
    // 6. Keep liquidation bonus
    uint256 profit = debtTokenReceived - debtAmount - fee;
    require(profit > 0, "Liquidation not profitable");
}`
        },
        {
          id: "template_003",
          name: "Collateral Swap",
          description: "Swap collateral type without closing position",
          category: "DeFi",
          difficulty: "advanced",
          estimatedGas: 680000,
          code: `// Collateral swap template
function swapCollateral(
    address lendingProtocol,
    address oldCollateral,
    address newCollateral,
    uint256 debtAmount
) external {
    // 1. Flash loan to repay debt
    flashLoan(debtToken, debtAmount);
    
    // 2. Repay debt and withdraw old collateral
    repayDebt(lendingProtocol, debtToken, debtAmount);
    withdrawCollateral(lendingProtocol, oldCollateral);
    
    // 3. Swap old collateral to new collateral
    uint256 newCollateralAmount = swap(oldCollateral, newCollateral, oldCollateralAmount);
    
    // 4. Deposit new collateral and borrow again
    depositCollateral(lendingProtocol, newCollateral, newCollateralAmount);
    borrowAgain(lendingProtocol, debtToken, debtAmount);
    
    // 5. Repay flash loan
    repayLoan(debtToken, debtAmount + fee);
}`
        }
      ];
      
      res.json(templates);
    } catch (error) {
      console.error("Error fetching flash loan templates:", error);
      res.status(500).json({ error: "Failed to fetch flash loan templates" });
    }
  });

  // Get flash loan history
  app.get("/api/flashloans/history", async (req, res) => {
    try {
      const { address } = req.query;
      
      if (!address) {
        return res.json([]);
      }
      
      const history = [
        {
          id: "flash_001",
          timestamp: "2025-07-20T10:30:00Z",
          amount: 100000,
          token: "XP",
          fee: 90,
          gasUsed: 485000,
          status: "success",
          strategy: "DEX Arbitrage",
          profit: 45.50
        },
        {
          id: "flash_002",
          timestamp: "2025-07-19T15:45:00Z",
          amount: 50000,
          token: "USDT",
          fee: 15,
          gasUsed: 620000,
          status: "success",
          strategy: "Liquidation",
          profit: 125.75
        },
        {
          id: "flash_003",
          timestamp: "2025-07-18T08:20:00Z",
          amount: 25000,
          token: "XPS",
          fee: 12.5,
          gasUsed: 350000,
          status: "failed",
          strategy: "Collateral Swap",
          profit: -35.25
        }
      ];
      
      res.json(history);
    } catch (error) {
      console.error("Error fetching flash loan history:", error);
      res.status(500).json({ error: "Failed to fetch flash loan history" });
    }
  });

  // Get flash loan analytics
  app.get("/api/flashloans/analytics", async (req, res) => {
    try {
      const analytics = {
        volume24h: 2500000,
        totalLoans: 15847,
        successRate: 87.5,
        avgProfit: 42.85,
        topStrategies: [
          { name: "DEX Arbitrage", count: 8950, successRate: 92.3 },
          { name: "Liquidation", count: 4250, successRate: 88.7 },
          { name: "Collateral Swap", count: 2647, successRate: 76.2 }
        ]
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching flash loan analytics:", error);
      res.status(500).json({ error: "Failed to fetch flash loan analytics" });
    }
  });

  // Execute flash loan
  app.post("/api/flashloans/execute", async (req, res) => {
    try {
      const { address, token, amount, code, templateId } = req.body;
      
      // Mock flash loan execution
      const txHash = `0x${getSecureRandom().toString(16).substr(2, 64)}`;
      const timestamp = Date.now();
      
      // Simulate complex processing
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Simulate success/failure based on code quality
      const success = getSecureRandom() > 0.15; // 85% success rate
      
      if (success) {
        res.json({
          success: true,
          txHash,
          executionId: `exec_${timestamp}`,
          details: {
            token,
            amount,
            fee: amount * 0.0009,
            estimatedGas: 450000,
            templateUsed: templateId
          },
          estimatedProfit: amount * 0.02,
          timestamp
        });
      } else {
        res.status(400).json({
          error: "Flash loan execution failed",
          reason: "Insufficient profit or execution error",
          gasUsed: 285000,
          timestamp
        });
      }
    } catch (error) {
      console.error("Error executing flash loan:", error);
      res.status(500).json({ error: "Failed to execute flash loan" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}