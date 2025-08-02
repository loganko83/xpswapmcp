// 🗄️ XPSwap Database Optimizer
// Advanced database performance optimization and monitoring

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DatabaseOptimizer {
  private db: Database.Database;
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(__dirname, '..', '..', 'test.db');
    this.db = new Database(this.dbPath);
  }

  // 🔍 데이터베이스 성능 분석
  async analyzePerformance() {
    const start = Date.now();
    
    try {
      // 기본 정보 수집
      const dbSize = this.getFileSize();
      const walMode = this.db.prepare('PRAGMA journal_mode').get();
      const cacheSize = this.db.prepare('PRAGMA cache_size').get();
      const mmapSize = this.db.prepare('PRAGMA mmap_size').get();
      
      // 테이블 통계 수집
      const tables = await this.getTableStatistics();
      
      // 인덱스 정보
      const indexes = await this.getIndexStatistics();
      
      // 성능 벤치마크
      const benchmarks = await this.runQuickBenchmarks();
      
      const analysisTime = Date.now() - start;
      
      return {
        database: {
          path: this.dbPath,
          size: dbSize,
          analyzedAt: new Date().toISOString(),
          analysisTime: `${analysisTime}ms`
        },
        configuration: {
          journalMode: walMode?.journal_mode || 'unknown',
          cacheSize: cacheSize?.cache_size || 0,
          mmapSize: mmapSize?.mmap_size || 0
        },
        tables,
        indexes,
        performance: benchmarks,
        recommendations: this.generateRecommendations(benchmarks, tables, indexes)
      };
    } catch (error) {
      throw new Error(`Performance analysis failed: ${error.message}`);
    }
  }

  // 🏥 데이터베이스 헬스 체크
  async checkDatabaseHealth() {
    try {
      const integritCheck = this.db.prepare('PRAGMA integrity_check').get();
      const quickCheck = this.db.prepare('PRAGMA quick_check').get();
      const walCheckpoint = this.db.prepare('PRAGMA wal_checkpoint').get();
      
      const health = {
        status: 'healthy',
        checks: {
          integrity: integritCheck?.integrity_check === 'ok',
          quickCheck: quickCheck?.quick_check === 'ok',
          walCheckpoint: walCheckpoint?.busy === 0
        },
        lastChecked: new Date().toISOString()
      };
      
      // 전체 상태 결정
      health.status = Object.values(health.checks).every(check => check) ? 'healthy' : 'warning';
      
      return health;
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        lastChecked: new Date().toISOString()
      };
    }
  }

  // 🏃 성능 테스트 실행
  async runPerformanceTests() {
    const tests = [
      {
        name: 'Token Symbol Lookup',
        query: "SELECT * FROM tokens WHERE symbol = 'XP' AND is_active = 1",
        target: 5 // target: under 5ms
      },
      {
        name: 'Active Trading Pairs',
        query: "SELECT * FROM trading_pairs WHERE is_active = 1 ORDER BY volume_24h DESC LIMIT 10",
        target: 10
      },
      {
        name: 'Recent Transactions',
        query: "SELECT * FROM transactions WHERE created_at > datetime('now', '-1 hour') ORDER BY created_at DESC LIMIT 20",
        target: 15
      },
      {
        name: 'User LP Holdings',
        query: "SELECT lth.*, lt.symbol FROM lp_token_holdings lth JOIN lp_tokens lt ON lth.lp_token_id = lt.id WHERE lth.balance > '0' LIMIT 50",
        target: 20
      },
      {
        name: 'LP Rewards Summary',
        query: "SELECT reward_type, COUNT(*) as count, SUM(CAST(reward_amount as REAL)) as total FROM lp_rewards WHERE claimed = 0 GROUP BY reward_type",
        target: 25
      }
    ];

    const results = [];
    
    for (const test of tests) {
      const start = Date.now();
      let status = 'success';
      let rowCount = 0;
      let error = null;
      
      try {
        const result = this.db.prepare(test.query).all();
        rowCount = result.length;
      } catch (err) {
        status = 'error';
        error = err.message;
      }
      
      const duration = Date.now() - start;
      const performance = duration <= test.target ? 'excellent' : 
                         duration <= test.target * 2 ? 'good' : 
                         duration <= test.target * 4 ? 'fair' : 'poor';
      
      results.push({
        name: test.name,
        duration: `${duration}ms`,
        target: `${test.target}ms`,
        performance,
        status,
        rowCount,
        error
      });
    }
    
    return {
      tests: results,
      summary: {
        total: results.length,
        passed: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'error').length,
        excellent: results.filter(r => r.performance === 'excellent').length,
        needsOptimization: results.filter(r => r.performance === 'poor').length
      },
      executedAt: new Date().toISOString()
    };
  }

  // 🔧 최적화된 인덱스 생성
  async createOptimizedIndexes() {
    const indexCommands = [
      // Trading pairs optimization
      "CREATE INDEX IF NOT EXISTS idx_trading_pairs_volume_active ON trading_pairs(volume_24h DESC, is_active) WHERE is_active = 1",
      "CREATE INDEX IF NOT EXISTS idx_trading_pairs_price_change ON trading_pairs(price_change_24h, created_at)",
      
      // Transactions optimization
      "CREATE INDEX IF NOT EXISTS idx_transactions_recent ON transactions(created_at DESC, status) WHERE status = 'confirmed'",
      "CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_address, type, created_at DESC)",
      
      // LP token optimization
      "CREATE INDEX IF NOT EXISTS idx_lp_holdings_active ON lp_token_holdings(user_address, balance) WHERE CAST(balance as REAL) > 0",
      "CREATE INDEX IF NOT EXISTS idx_lp_rewards_pending ON lp_rewards(user_address, claimed, reward_type) WHERE claimed = 0",
      
      // Performance indexes
      "CREATE INDEX IF NOT EXISTS idx_tokens_trading ON tokens(symbol, is_active, address) WHERE is_active = 1",
      "CREATE INDEX IF NOT EXISTS idx_lp_staking_active ON lp_staking_pools(is_active, start_time, end_time) WHERE is_active = 1"
    ];
    
    const results = [];
    
    for (const command of indexCommands) {
      const start = Date.now();
      try {
        this.db.exec(command);
        const duration = Date.now() - start;
        results.push({
          command: command.split(' ').slice(0, 6).join(' ') + '...',
          duration: `${duration}ms`,
          status: 'success'
        });
      } catch (error) {
        results.push({
          command: command.split(' ').slice(0, 6).join(' ') + '...',
          error: error.message,
          status: 'error'
        });
      }
    }
    
    return {
      indexesCreated: results.filter(r => r.status === 'success').length,
      errors: results.filter(r => r.status === 'error').length,
      details: results
    };
  }

  // 🚀 데이터베이스 최적화 실행
  async optimizeDatabase() {
    const start = Date.now();
    const results = [];
    
    try {
      // 1. Analyze 실행
      results.push(await this.executeOptimization('ANALYZE', 'Database statistics update'));
      
      // 2. Incremental vacuum
      results.push(await this.executeOptimization('PRAGMA incremental_vacuum(1000)', 'Incremental vacuum'));
      
      // 3. WAL checkpoint
      results.push(await this.executeOptimization('PRAGMA wal_checkpoint(PASSIVE)', 'WAL checkpoint'));
      
      // 4. Optimize 실행
      results.push(await this.executeOptimization('PRAGMA optimize', 'Query optimizer update'));
      
      const totalTime = Date.now() - start;
      
      return {
        success: true,
        duration: `${totalTime}ms`,
        optimizations: results,
        completedAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        partialResults: results,
        duration: `${Date.now() - start}ms`
      };
    }
  }

  // Helper methods
  private async executeOptimization(command: string, description: string) {
    const start = Date.now();
    try {
      this.db.exec(command);
      return {
        operation: description,
        duration: `${Date.now() - start}ms`,
        status: 'success'
      };
    } catch (error) {
      return {
        operation: description,
        duration: `${Date.now() - start}ms`,
        status: 'error',
        error: error.message
      };
    }
  }

  private getFileSize(): string {
    try {
      const fs = require('fs');
      const stats = fs.statSync(this.dbPath);
      const bytes = stats.size;
      const mb = (bytes / (1024 * 1024)).toFixed(2);
      return `${mb} MB`;
    } catch {
      return 'unknown';
    }
  }

  private async getTableStatistics() {
    const tables = this.db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).all();

    const stats = [];
    for (const table of tables) {
      try {
        const count = this.db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
        stats.push({
          name: table.name,
          rowCount: count?.count || 0
        });
      } catch (error) {
        stats.push({
          name: table.name,
          rowCount: 'error',
          error: error.message
        });
      }
    }
    
    return stats;
  }

  private async getIndexStatistics() {
    const indexes = this.db.prepare(`
      SELECT name, tbl_name FROM sqlite_master 
      WHERE type='index' AND name NOT LIKE 'sqlite_%'
    `).all();

    return indexes.map(index => ({
      name: index.name,
      table: index.tbl_name
    }));
  }

  private async runQuickBenchmarks() {
    const queries = [
      "SELECT COUNT(*) FROM tokens",
      "SELECT COUNT(*) FROM trading_pairs",
      "SELECT COUNT(*) FROM transactions"
    ];

    const results = [];
    for (const query of queries) {
      const start = Date.now();
      try {
        this.db.prepare(query).get();
        results.push({
          query: query.split(' ').slice(0, 3).join(' '),
          duration: Date.now() - start
        });
      } catch (error) {
        results.push({
          query: query.split(' ').slice(0, 3).join(' '),
          error: error.message
        });
      }
    }

    const avgDuration = results
      .filter(r => !r.error)
      .reduce((sum, r) => sum + r.duration, 0) / results.filter(r => !r.error).length;

    return {
      queries: results,
      averageQueryTime: `${Math.round(avgDuration)}ms`,
      overallPerformance: avgDuration < 5 ? 'excellent' : avgDuration < 15 ? 'good' : 'needs optimization'
    };
  }

  private generateRecommendations(benchmarks: any, tables: any, indexes: any) {
    const recommendations = [];

    // Performance recommendations
    if (benchmarks.averageQueryTime && parseInt(benchmarks.averageQueryTime) > 10) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'Average query time is high. Consider adding more specific indexes.'
      });
    }

    // Index recommendations
    if (indexes.length < tables.length * 2) {
      recommendations.push({
        type: 'indexes',
        priority: 'medium',
        message: 'Consider adding more indexes for frequently queried columns.'
      });
    }

    // Table size recommendations
    const largeTables = tables.filter(t => t.rowCount > 10000);
    if (largeTables.length > 0) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        message: `Large tables detected: ${largeTables.map(t => t.name).join(', ')}. Consider partitioning or archiving old data.`
      });
    }

    return recommendations;
  }

  // 정리 메서드
  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

// Export singleton instance
export const databaseOptimizer = new DatabaseOptimizer();

// Graceful shutdown
process.on('SIGINT', () => {
  databaseOptimizer.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  databaseOptimizer.close();
  process.exit(0);
});
