import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";
import path from 'path';

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// SQLite 파일 경로 설정
const dbPath = process.env.DATABASE_URL.replace('sqlite:', '');
const resolvedPath = path.resolve(dbPath);

console.log(`Using SQLite database at: ${resolvedPath}`);

// SQLite 데이터베이스 생성
const sqlite = new Database(resolvedPath);
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
export const pool = null; // PostgreSQL pool 대신 null