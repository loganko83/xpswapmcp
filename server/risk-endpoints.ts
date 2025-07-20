  // Risk Management API Endpoints
  
  // Get risk analysis
  app.get("/api/risk/analysis/:address/:timeframe?", async (req, res) => {
    try {
      const { address, timeframe = "7d" } = req.params;
      
      const riskAnalysis = {
        user_address: address,
        timeframe: timeframe,
        overall_risk_score: Math.floor(Math.random() * 30) + 60, // 60-90
        risk_categories: {
          concentration_risk: {
            score: Math.floor(Math.random() * 40) + 40, // 40-80
            description: "Portfolio concentration in specific tokens",
            status: "warning"
          },
          liquidity_risk: {
            score: Math.floor(Math.random() * 20) + 70, // 70-90
            description: "Risk of insufficient liquidity for large trades",
            status: "safe"
          },
          volatility_risk: {
            score: Math.floor(Math.random() * 30) + 30, // 30-60
            description: "Exposure to price volatility",
            status: "safe"
          },
          smart_contract_risk: {
            score: Math.floor(Math.random() * 10) + 85, // 85-95
            description: "Risk from smart contract vulnerabilities",
            status: "safe"
          }
        },
        recommendations: [
          "Consider diversifying token holdings",
          "Monitor impermanent loss in LP positions",
          "Use stop-loss orders for high-risk positions"
        ]
      };
      
      res.json(riskAnalysis);
    } catch (error) {
      console.error("Error fetching risk analysis:", error);
      res.status(500).json({ error: "Failed to fetch risk analysis" });
    }
  });

  // Get risk alerts
  app.get("/api/risk/alerts/:address", async (req, res) => {
    try {
      const { address } = req.params;
      
      const riskAlerts = [
        {
          id: "risk_alert_001",
          type: "concentration",
          severity: "medium",
          title: "High Token Concentration Detected",
          description: "Over 65% of portfolio is concentrated in XP tokens, increasing volatility exposure",
          impact: "Higher portfolio volatility and correlation risk",
          recommendation: "Consider diversifying into stablecoins or other assets",
          timestamp: Date.now() - 1800000, // 30 minutes ago
          affected_positions: ["XP", "XPS"],
          estimated_loss: "12-18%"
        },
        {
          id: "risk_alert_002",
          type: "impermanent_loss",
          severity: "low",
          title: "Impermanent Loss Warning",
          description: "LP position in XP/USDT showing 3.2% impermanent loss",
          impact: "Reduced returns compared to holding individual tokens",
          recommendation: "Monitor price divergence and consider rebalancing",
          timestamp: Date.now() - 3600000, // 1 hour ago
          affected_positions: ["XP/USDT LP"],
          estimated_loss: "3.2%"
        },
        {
          id: "risk_alert_003",
          type: "security",
          severity: "high",
          title: "Suspicious Transaction Pattern",
          description: "Detected potential MEV attack pattern in recent transactions",
          impact: "Possible value extraction from trades",
          recommendation: "Use MEV protection services and review transaction settings",
          timestamp: Date.now() - 7200000, // 2 hours ago
          affected_positions: ["Recent swaps"],
          estimated_loss: "0.5-2%"
        }
      ];
      
      res.json(riskAlerts);
    } catch (error) {
      console.error("Error fetching risk alerts:", error);
      res.status(500).json({ error: "Failed to fetch risk alerts" });
    }
  });

  // Get portfolio risk metrics
  app.get("/api/risk/portfolio/:address", async (req, res) => {
    try {
      const { address } = req.params;
      
      const portfolioRisk = {
        user_address: address,
        risk_score: Math.floor(Math.random() * 20) + 65, // 65-85
        diversification_score: Math.floor(Math.random() * 25) + 60, // 60-85
        liquidity_score: Math.floor(Math.random() * 15) + 80, // 80-95
        positions_at_risk: 2,
        total_positions: 8,
        risk_breakdown: {
          concentration: 65, // % concentrated in top 3 assets
          impermanent_loss: 4.2, // % potential IL
          smart_contract: 5, // % in unaudited contracts
          market: 24 // % market risk exposure
        },
        value_at_risk: {
          "1d": "2.3%",
          "7d": "8.7%",
          "30d": "15.2%"
        }
      };
      
      res.json(portfolioRisk);
    } catch (error) {
      console.error("Error fetching portfolio risk:", error);
      res.status(500).json({ error: "Failed to fetch portfolio risk" });
    }
  });

  // Get market risk data
  app.get("/api/risk/market", async (req, res) => {
    try {
      const marketRisk = {
        volatility_index: Math.floor(Math.random() * 20) + 15, // 15-35%
        market_sentiment: "neutral", // bullish, neutral, bearish
        liquidity_depth: Math.floor(Math.random() * 20) + 70, // 70-90%
        correlation_risk: Math.floor(Math.random() * 30) + 40, // 40-70%
        systemic_risk_indicators: {
          defi_tvl_change: "-2.3%",
          stablecoin_depeg_risk: "low",
          bridge_security_score: 85,
          oracle_reliability: 94
        },
        market_metrics: {
          fear_greed_index: Math.floor(Math.random() * 40) + 40, // 40-80
          funding_rates: "0.015%",
          options_skew: "neutral",
          liquidation_risk: "medium"
        }
      };
      
      res.json(marketRisk);
    } catch (error) {
      console.error("Error fetching market risk:", error);
      res.status(500).json({ error: "Failed to fetch market risk" });
    }
  });

  // Mitigate risk
  app.post("/api/risk/mitigate/:alertId", async (req, res) => {
    try {
      const { alertId } = req.params;
      const { userAddress } = req.body;
      
      // Mock risk mitigation actions
      const mitigationActions = {
        "risk_alert_001": {
          action: "diversification_suggestion",
          description: "Automatically generated diversification suggestions",
          steps: [
            "Reduce XP holdings by 20%",
            "Increase stablecoin allocation to 30%",
            "Consider adding ETH or BTC for further diversification"
          ]
        },
        "risk_alert_002": {
          action: "position_rebalancing",
          description: "LP position optimization",
          steps: [
            "Monitor price ratio closely",
            "Consider partial withdrawal if IL increases",
            "Set up automated rebalancing alerts"
          ]
        },
        "risk_alert_003": {
          action: "mev_protection",
          description: "Enhanced MEV protection activated",
          steps: [
            "Enable MEV protection for future trades",
            "Adjust slippage tolerance",
            "Use time-delayed transactions for large trades"
          ]
        }
      };
      
      const mitigation = mitigationActions[alertId] || {
        action: "general_protection",
        description: "General risk mitigation measures applied",
        steps: ["Risk monitoring enhanced", "Alerts configured"]
      };
      
      res.json({
        success: true,
        alert_id: alertId,
        mitigation: mitigation,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Error mitigating risk:", error);
      res.status(500).json({ error: "Failed to mitigate risk" });
    }
  });

  // Get risk monitoring settings
  app.get("/api/risk/settings/:address", async (req, res) => {
    try {
      const { address } = req.params;
      
      const riskSettings = {
        user_address: address,
        monitoring_enabled: true,
        alert_thresholds: {
          concentration_risk: 70, // %
          impermanent_loss: 5, // %
          portfolio_drop: 10, // %
          liquidation_risk: 80 // %
        },
        notification_preferences: {
          email: true,
          push: false,
          sms: false
        },
        auto_mitigation: {
          enabled: false,
          max_auto_action_value: "1000", // USD
          allowed_actions: ["rebalancing", "stop_loss"]
        }
      };
      
      res.json(riskSettings);
    } catch (error) {
      console.error("Error fetching risk settings:", error);
      res.status(500).json({ error: "Failed to fetch risk settings" });
    }
  });

  // Update risk monitoring settings
  app.put("/api/risk/settings/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const settings = req.body;
      
      // In a real implementation, save settings to database
      console.log(`Updating risk settings for ${address}:`, settings);
      
      res.json({
        success: true,
        message: "Risk settings updated successfully",
        updated_settings: settings,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Error updating risk settings:", error);
      res.status(500).json({ error: "Failed to update risk settings" });
    }
  });

