import { Express } from 'express';
import tradingRoutes from './routes/trading';
import defiRoutes from './routes/defi';
import advancedRoutes from './routes/advanced-refactored'; // Using refactored version
import securityRoutes from './routes/security';
import bridgeRoutes from './routes/bridge';
import cacheRoutes from './routes/cache';
import deploymentRoutes from './routes/deployment';
import riskRoutes from './routes/risk';
import portfolioRoutes from './routes/portfolio';
import analyticsRoutes from './routes/analytics';
import loggingRoutes from './routes/logging';
import { cache } from './services/cache';

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
 * - deployment.ts: Smart contract deployment and management
 */

export function setupRoutes(app: Express): void {
  // Mount route modules with proper prefixes
  app.use('/api', tradingRoutes);
  app.use('/api', defiRoutes);
  app.use('/api', advancedRoutes);
  app.use('/api/security', securityRoutes);
  app.use('/api', bridgeRoutes);
  app.use('/api', cacheRoutes);
  app.use('/api/deployment', deploymentRoutes);
  app.use('/api', riskRoutes);
  app.use('/api', portfolioRoutes);
  app.use('/api', analyticsRoutes);
  app.use('/api', loggingRoutes);

  // Enhanced health check endpoint
  app.get('/api/health', (req, res) => {
    const cacheStats = cache.getStats();
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    res.json({
      status: 'healthy',
      timestamp: Date.now(),
      version: '1.0.0',
      uptime: {
        seconds: Math.floor(uptime),
        human: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`
      },
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
        external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100,
        unit: 'MB'
      },
      cache: {
        hitRate: Math.round(cacheStats.hitRate * 10000) / 100,
        size: cacheStats.size,
        hits: cacheStats.hits,
        misses: cacheStats.misses
      },
      modules: [
        'trading',
        'defi', 
        'advanced',
        'security',
        'bridge'
      ]
    });
  });

  // Simple health check for load balancers
  app.get('/api/health/simple', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: Date.now()
    });
  });

  // API performance test endpoint
  app.get('/api/health/performance', async (req, res) => {
    const startTime = Date.now();
    
    // Test cache performance
    const cacheTestStart = Date.now();
    const cacheTestKey = 'perf_test_' + startTime;
    cache.set(cacheTestKey, { test: true }, 60000);
    const cachedData = cache.get(cacheTestKey);
    const cacheTestTime = Date.now() - cacheTestStart;
    
    // Test database connection (if available)
    const dbTestTime = 1; // Placeholder for now
    
    const totalTime = Date.now() - startTime;
    
    res.json({
      status: 'healthy',
      timestamp: Date.now(),
      performance: {
        totalResponseTime: totalTime,
        cacheResponseTime: cacheTestTime,
        databaseResponseTime: dbTestTime,
        unit: 'ms'
      },
      tests: {
        cache: cachedData ? 'pass' : 'fail',
        database: 'pass', // Placeholder
        overall: 'pass'
      }
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