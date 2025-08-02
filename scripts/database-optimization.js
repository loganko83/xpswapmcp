#!/usr/bin/env node

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'test.db');

console.log('🔧 Starting database optimization...');
console.log(`📁 Database path: ${dbPath}`);

try {
  const db = new Database(dbPath);
  
  // 1. 기본 SQLite 최적화 설정
  console.log('⚡ Applying SQLite performance settings...');
  db.exec(`
    -- WAL 모드 (이미 설정되어 있을 수 있음)
    PRAGMA journal_mode = WAL;
    
    -- 동기화 모드 최적화
    PRAGMA synchronous = NORMAL;
    
    -- 캐시 크기 증가 (16MB)
    PRAGMA cache_size = -16000;
    
    -- 메모리 맵 크기 설정 (64MB)
    PRAGMA mmap_size = 67108864;
    
    -- 임시 테이블을 메모리에 저장
    PRAGMA temp_store = MEMORY;
    
    -- 자동 VACUUM 활성화
    PRAGMA auto_vacuum = INCREMENTAL;
    
    -- 외래 키 제약조건 활성화
    PRAGMA foreign_keys = ON;
  `);
  
  // 2. 인덱스 생성
  console.log('📊 Creating optimized indexes...');
  
  // tokens 테이블 인덱스
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tokens_symbol ON tokens(symbol);
    CREATE INDEX IF NOT EXISTS idx_tokens_address ON tokens(address);
    CREATE INDEX IF NOT EXISTS idx_tokens_active ON tokens(is_active);
  `);
  
  // trading_pairs 테이블 인덱스
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_trading_pairs_token_a ON trading_pairs(token_a_id);
    CREATE INDEX IF NOT EXISTS idx_trading_pairs_token_b ON trading_pairs(token_b_id);
    CREATE INDEX IF NOT EXISTS idx_trading_pairs_active ON trading_pairs(is_active);
    CREATE INDEX IF NOT EXISTS idx_trading_pairs_volume ON trading_pairs(volume_24h);
    CREATE INDEX IF NOT EXISTS idx_trading_pairs_composite ON trading_pairs(token_a_id, token_b_id, is_active);
  `);
  
  // transactions 테이블 인덱스
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_address);
    CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(transaction_hash);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
    CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);
    CREATE INDEX IF NOT EXISTS idx_transactions_composite ON transactions(user_address, type, status);
  `);
  
  // liquidity_pools 테이블 인덱스
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_liquidity_pools_pair ON liquidity_pools(pair_id);
    CREATE INDEX IF NOT EXISTS idx_liquidity_pools_active ON liquidity_pools(is_active);
    CREATE INDEX IF NOT EXISTS idx_liquidity_pools_apr ON liquidity_pools(apr);
  `);
  
  // lp_tokens 테이블 인덱스
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_lp_tokens_symbol ON lp_tokens(symbol);
    CREATE INDEX IF NOT EXISTS idx_lp_tokens_address ON lp_tokens(address);
    CREATE INDEX IF NOT EXISTS idx_lp_tokens_pair ON lp_tokens(pair_id);
    CREATE INDEX IF NOT EXISTS idx_lp_tokens_active ON lp_tokens(is_active);
  `);
  
  // lp_token_holdings 테이블 인덱스
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_lp_holdings_user ON lp_token_holdings(user_address);
    CREATE INDEX IF NOT EXISTS idx_lp_holdings_token ON lp_token_holdings(lp_token_id);
    CREATE INDEX IF NOT EXISTS idx_lp_holdings_balance ON lp_token_holdings(balance);
    CREATE INDEX IF NOT EXISTS idx_lp_holdings_composite ON lp_token_holdings(user_address, lp_token_id);
  `);
  
  // lp_rewards 테이블 인덱스
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_lp_rewards_token ON lp_rewards(lp_token_id);
    CREATE INDEX IF NOT EXISTS idx_lp_rewards_user ON lp_rewards(user_address);
    CREATE INDEX IF NOT EXISTS idx_lp_rewards_claimed ON lp_rewards(claimed);
    CREATE INDEX IF NOT EXISTS idx_lp_rewards_type ON lp_rewards(reward_type);
    CREATE INDEX IF NOT EXISTS idx_lp_rewards_date ON lp_rewards(distribution_date);
    CREATE INDEX IF NOT EXISTS idx_lp_rewards_composite ON lp_rewards(user_address, claimed, reward_type);
  `);
  
  // lp_staking_pools 테이블 인덱스
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_lp_staking_token ON lp_staking_pools(lp_token_id);
    CREATE INDEX IF NOT EXISTS idx_lp_staking_active ON lp_staking_pools(is_active);
    CREATE INDEX IF NOT EXISTS idx_lp_staking_start ON lp_staking_pools(start_time);
    CREATE INDEX IF NOT EXISTS idx_lp_staking_end ON lp_staking_pools(end_time);
  `);
  
  // 3. 데이터베이스 분석 및 최적화
  console.log('🔍 Analyzing database...');
  db.exec('ANALYZE;');
  
  // 4. VACUUM으로 공간 최적화
  console.log('🧹 Optimizing database space...');
  db.exec('VACUUM;');
  
  // 5. 통계 수집
  const stats = db.prepare(`
    SELECT name, COUNT(*) as count 
    FROM sqlite_master 
    WHERE type='index' AND name LIKE 'idx_%'
    GROUP BY name
  `).all();
  
  const tableStats = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
  `).all();
  
  console.log('\n✅ Database optimization completed!');
  console.log(`📊 Created ${stats.length} optimized indexes`);
  console.log(`📋 Tables: ${tableStats.length}`);
  
  // 6. 성능 테스트
  console.log('\n🏃 Running performance tests...');
  
  const performanceTests = [
    {
      name: 'Token lookup by symbol',
      query: "SELECT * FROM tokens WHERE symbol = 'XP' AND is_active = 1"
    },
    {
      name: 'Active trading pairs',
      query: "SELECT * FROM trading_pairs WHERE is_active = 1 ORDER BY volume24h DESC LIMIT 10"
    },
    {
      name: 'User transactions',
      query: "SELECT * FROM transactions WHERE user_address = '0x123' AND status = 'confirmed' ORDER BY created_at DESC LIMIT 20"
    },
    {
      name: 'LP token holdings',
      query: "SELECT * FROM lp_token_holdings WHERE user_address = '0x123' AND balance > '0'"
    }
  ];
  
  for (const test of performanceTests) {
    const start = Date.now();
    try {
      const result = db.prepare(test.query).all();
      const duration = Date.now() - start;
      console.log(`  ✓ ${test.name}: ${duration}ms (${result.length} rows)`);
    } catch (error) {
      console.log(`  ✗ ${test.name}: Error - ${error.message}`);
    }
  }
  
  db.close();
  console.log('\n🎉 Database optimization completed successfully!');
  
} catch (error) {
  console.error('❌ Database optimization failed:', error.message);
  process.exit(1);
}
