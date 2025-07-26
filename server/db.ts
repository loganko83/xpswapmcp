import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import Database from 'better-sqlite3';
import postgres from 'postgres';
import * as sqliteSchema from "@shared/schema";
import * as postgresSchema from "@shared/schema.postgres";
import path from 'path';

// Check if we should use PostgreSQL
const USE_POSTGRES = process.env.USE_POSTGRES === 'true';

if (USE_POSTGRES && !process.env.POSTGRES_URL) {
  throw new Error(
    "POSTGRES_URL must be set when USE_POSTGRES is true.",
  );
} else if (!USE_POSTGRES && !process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set when using SQLite.",
  );
}

// Export database instance
export let db: any;
export let pool: any = null;

if (USE_POSTGRES) {
  // PostgreSQL configuration
  console.log('🐘 Using PostgreSQL database');
  
  const connectionString = process.env.POSTGRES_URL!;
  const sql = postgres(connectionString, {
    max: 10, // Maximum number of connections
    idle_timeout: 30, // Seconds to close idle connections
    connect_timeout: 30, // Connection timeout in seconds
    ssl: 'require', // Supabase requires SSL
  });

  db = drizzlePostgres(sql, { schema: postgresSchema });
  pool = sql; // For PostgreSQL, we expose the connection pool
  
  console.log('✅ PostgreSQL connection established');
} else {
  // SQLite configuration
  console.log('💾 Using SQLite database');
  
  const dbPath = process.env.DATABASE_URL!.replace('sqlite:', '');
  const resolvedPath = path.resolve(dbPath);

  console.log(`SQLite database path: ${resolvedPath}`);

  // Create SQLite database
  const sqlite = new Database(resolvedPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('synchronous = NORMAL');
  sqlite.pragma('cache_size = -2000'); // 2MB cache
  sqlite.pragma('temp_store = MEMORY');

  db = drizzleSqlite(sqlite, { schema: sqliteSchema });
  
  console.log('✅ SQLite connection established');
}

// Database health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    if (USE_POSTGRES) {
      // PostgreSQL health check
      const result = await pool`SELECT 1`;
      return result.length > 0;
    } else {
      // SQLite health check
      const result = db.select().from(sqliteSchema.tokens).limit(1);
      return true; // If query doesn't throw, connection is healthy
    }
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
}

// Export the appropriate schema based on database type
export const schema = USE_POSTGRES ? postgresSchema : sqliteSchema;
