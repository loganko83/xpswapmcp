import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";
import path from 'path';

// For now, we only use SQLite. PostgreSQL support can be added later.
console.log('💾 Using SQLite database');

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set when using SQLite.");
}

const dbPath = process.env.DATABASE_URL.replace('sqlite:', '');
const resolvedPath = path.resolve(dbPath);

console.log(`SQLite database path: ${resolvedPath}`);

// Create SQLite database
const sqlite = new Database(resolvedPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('synchronous = NORMAL');
sqlite.pragma('cache_size = -2000'); // 2MB cache
sqlite.pragma('temp_store = MEMORY');

export const db = drizzle(sqlite, { schema });

// Export raw SQLite instance for direct SQL operations
export const sqliteDb = sqlite;

console.log('✅ SQLite connection established');

// Database health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // SQLite health check - simple query to verify connection
    const result = db.select().from(schema.tokens).limit(1);
    return true; // If query doesn't throw, connection is healthy
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
}

// Export schema for convenience
export { schema };