#!/usr/bin/env node

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'test.db');

console.log('🔍 Checking database schema...');
console.log(`📁 Database path: ${dbPath}`);

try {
  const db = new Database(dbPath);
  
  // 모든 테이블 목록 가져오기
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `).all();
  
  console.log('\n📋 Tables found:');
  tables.forEach(table => {
    console.log(`  - ${table.name}`);
  });
  
  // 각 테이블의 스키마 확인
  for (const table of tables) {
    console.log(`\n🔧 Schema for ${table.name}:`);
    const schema = db.prepare(`PRAGMA table_info(${table.name})`).all();
    schema.forEach(column => {
      console.log(`  ${column.name}: ${column.type} ${column.notnull ? 'NOT NULL' : ''} ${column.pk ? 'PRIMARY KEY' : ''}`);
    });
  }
  
  // 인덱스 확인
  console.log('\n📊 Existing indexes:');
  const indexes = db.prepare(`
    SELECT name, tbl_name FROM sqlite_master 
    WHERE type='index' AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `).all();
  
  indexes.forEach(index => {
    console.log(`  - ${index.name} on ${index.tbl_name}`);
  });
  
  db.close();
  console.log('\n✅ Schema check completed!');
  
} catch (error) {
  console.error('❌ Schema check failed:', error.message);
  process.exit(1);
}
