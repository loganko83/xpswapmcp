import { Express } from 'express';
import tradingRoutes from './routes/trading';
import defiRoutes from './routes/defi';
import advancedRoutes from './routes/advanced';
import securityRoutes from './routes/security';
import bridgeRoutes from './routes/bridge';

/**
 * XPSwap DEX API Routes - Modular Architecture
 * 
 * This file integrates all API route modules for better maintainability
 * and performance. Each module handles specific functionality areas:
 * 
 * - trading.ts: Core trading and swap APIs
 * - defi.ts: DeFi features (pools, farming, staking) 
 * - advanced.ts: Advanced trading (options, futures, flash loans)
 * - security.ts: Security monitoring and risk management
 * - bridge.ts: Cross-chain bridge functionality
 */

export function setupRoutes(app: Express): void {
  // Mount route modules
  app.use(tradingRoutes);
  app.use(defiRoutes);
  app.use(advancedRoutes);
  app.use(securityRoutes);
  app.use(bridgeRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: Date.now(),
      version: '1.0.0',
      modules: [
        'trading',
        'defi', 
        'advanced',
        'security',
        'bridge'
      ]
    });
  });

  // API info endpoint
  app.get('/api/info', (req, res) => {
    res.json({
      name: 'XPSwap DEX API',
      version: '1.0.0',
      description: 'Advanced DeFi platform with cross-chain capabilities',
      endpoints: {
        trading: '/api/swap, /api/market-stats, /api/token-balance',
        defi: '/api/pools, /api/farming, /api/staking',
        advanced: '/api/options, /api/perpetual, /api/flashloan',
        security: '/api/security, /api/risk',
        bridge: '/api/bridge'
      },
      timestamp: Date.now()
    });
  });
}

export default setupRoutes;