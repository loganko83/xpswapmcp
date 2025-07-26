import { defineConfig } from "drizzle-kit";

// For PostgreSQL migration
export default defineConfig({
  out: "./migrations-postgres",
  schema: "./shared/schema.postgres.ts",
  dialect: "postgresql",
  dbCredentials: {
    connectionString: process.env.POSTGRES_URL || "postgresql://postgres.gqpnsljwmtatyapnmeqv:Ysjjang10!@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres",
  },
});
