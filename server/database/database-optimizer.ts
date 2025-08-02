// 🔧 XPSwap 데이터베이스 최적화 도구
// 데이터베이스 성능 최적화 및 인덱스 관리

import { sqliteDb } from '../db.js';

export class DatabaseOptimizer {
  private db = sqliteDb;

  /**
   * 데이터베이스 인덱스 생성 및 최적화
   */
  async createOptimizedIndexes(): Promise<void> {
    console.log('🔧 Creating optimized database indexes...');

    try {
      // 토큰 관련 인덱스
      this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_tokens_symbol ON tokens(symbol)`).run();
      this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_tokens_address ON tokens(address)`).run();
      this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_tokens_chain_id ON tokens(chain_id)`).run();

      // 풀 관련 인덱스
      this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_pools_token0_token1 ON pools(token0_address, token1_address)`).run();
      this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_pools_active ON pools(is_active)`).run();
      this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_pools_tvl ON pools(tvl DESC)`).run();

      // 거래 관련 인덱스
      this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_trades_user ON trades(user_address)`).run();
      this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_trades_timestamp ON trades(timestamp DESC)`).run();
      this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_trades_pool ON trades(pool_address)`).run();

      // 유동성 관련 인덱스
      this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_liquidity_user ON liquidity_positions(user_address)`).run();
      this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_liquidity_pool ON liquidity_positions(pool_address)`).run();
      this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_liquidity_active ON liquidity_positions(is_active)`).run();

      // 파밍 관련 인덱스
      this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_farms_pool ON farms(pool_address)`).run();
      this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_farms_active ON farms(is_active)`).run();
      this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_farms_apy ON farms(apy DESC)`).run();

      // 가격 히스토리 인덱스
      this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_price_history_token_time ON price_history(token_address, timestamp DESC)`).run();

      console.log('✅ Database indexes created successfully');
    } catch (error) {
      console.error('❌ Error creating database indexes:', error);
      throw error;
    }
  }

  /**
   * 데이터베이스 성능 분석
   */
  async analyzePerformance(): Promise<any> {
    console.log('📊 Analyzing database performance...');

    try {
      const stats = {
        // 데이터베이스 크기
        databaseSize: this.db.prepare(`SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()`).get(),
        
        // 테이블별 행 수
        tableCounts: {
          tokens: this.db.prepare(`SELECT COUNT(*) as count FROM tokens`).get(),
          pools: this.db.prepare(`SELECT COUNT(*) as count FROM pools`).get(),
          trades: this.db.prepare(`SELECT COUNT(*) as count FROM trades`).get(),
          liquidity_positions: this.db.prepare(`SELECT COUNT(*) as count FROM liquidity_positions`).get(),
          farms: this.db.prepare(`SELECT COUNT(*) as count FROM farms`).run()
        },

        // 인덱스 정보
        indexes: this.db.prepare(`
          SELECT name, tbl_name, sql 
          FROM sqlite_master 
          WHERE type = 'index' AND name NOT LIKE 'sqlite_%'
        `).all(),

        // 캐시 히트율
        cacheStats: this.db.prepare(`PRAGMA cache_size`).get(),
        
        // WAL 모드 상태
        walMode: this.db.prepare(`PRAGMA journal_mode`).get()
      };

      console.log('📊 Database Performance Stats:', JSON.stringify(stats, null, 2));
      return stats;
    } catch (error) {
      console.error('❌ Error analyzing database performance:', error);
      throw error;
    }
  }

  /**
   * 데이터베이스 정리 및 최적화
   */
  async optimizeDatabase(): Promise<void> {
    console.log('🧹 Optimizing database...');

    try {
      // 데이터베이스 분석 및 통계 업데이트
      this.db.prepare(`ANALYZE`).run();
      
      // VACUUM으로 데이터베이스 정리 (주의: 시간이 오래 걸릴 수 있음)
      this.db.prepare(`VACUUM`).run();
      
      // WAL 체크포인트
      this.db.prepare(`PRAGMA wal_checkpoint(TRUNCATE)`).run();

      console.log('✅ Database optimization completed');
    } catch (error) {
      console.error('❌ Error optimizing database:', error);
      throw error;
    }
  }

  /**
   * 쿼리 성능 측정
   */
  async measureQueryPerformance(query: string, params: any[] = []): Promise<any> {
    const startTime = process.hrtime.bigint();
    
    try {
      const result = this.db.prepare(query).all(...params);
      const endTime = process.hrtime.bigint();
      const executionTime = Number(endTime - startTime) / 1000000; // ms로 변환

      return {
        executionTime: `${executionTime.toFixed(2)}ms`,
        rowCount: result.length,
        result: result.slice(0, 5) // 첫 5개 행만 반환
      };
    } catch (error) {
      const endTime = process.hrtime.bigint();
      const executionTime = Number(endTime - startTime) / 1000000;

      return {
        executionTime: `${executionTime.toFixed(2)}ms`,
        error: error.message
      };
    }
  }

  /**
   * 자주 사용되는 쿼리들의 성능 테스트
   */
  async runPerformanceTests(): Promise<any> {
    console.log('🧪 Running database performance tests...');

    const tests = [
      {
        name: 'Get all active pools',
        query: 'SELECT * FROM pools WHERE is_active = 1 ORDER BY tvl DESC LIMIT 10'
      },
      {
        name: 'Get user liquidity positions',
        query: 'SELECT * FROM liquidity_positions WHERE user_address = ? AND is_active = 1',
        params: ['0x1234567890abcdef']
      },
      {
        name: 'Get recent trades',
        query: 'SELECT * FROM trades ORDER BY timestamp DESC LIMIT 20'
      },
      {
        name: 'Get token by symbol',
        query: 'SELECT * FROM tokens WHERE symbol = ?',
        params: ['XP']
      },
      {
        name: 'Get top farms by APY',
        query: 'SELECT * FROM farms WHERE is_active = 1 ORDER BY apy DESC LIMIT 10'
      }
    ];

    const results = {};
    for (const test of tests) {
      results[test.name] = await this.measureQueryPerformance(test.query, test.params || []);
    }

    console.log('🧪 Performance test results:', JSON.stringify(results, null, 2));
    return results;
  }

  /**
   * 데이터베이스 건강성 체크
   */
  async checkDatabaseHealth(): Promise<any> {
    console.log('🏥 Checking database health...');

    try {
      const healthCheck = {
        connection: true,
        integrity: this.db.prepare(`PRAGMA integrity_check`).get(),
        foreignKeys: this.db.prepare(`PRAGMA foreign_key_check`).all(),
        journalMode: this.db.prepare(`PRAGMA journal_mode`).get(),
        synchronous: this.db.prepare(`PRAGMA synchronous`).get(),
        cacheSize: this.db.prepare(`PRAGMA cache_size`).get(),
        tempStore: this.db.prepare(`PRAGMA temp_store`).get()
      };

      console.log('🏥 Database health check results:', JSON.stringify(healthCheck, null, 2));
      return healthCheck;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return { connection: false, error: error.message };
    }
  }
}

// 싱글톤 인스턴스
export const databaseOptimizer = new DatabaseOptimizer();
