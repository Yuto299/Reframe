import { Pool } from "pg";

/**
 * PostgreSQL接続プールを作成
 */
export function createDatabasePool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  return new Pool({
    connectionString: databaseUrl, // 接続プールの設定
    max: 20, // 最大接続数
    idleTimeoutMillis: 30000, // アイドルタイムアウト
    connectionTimeoutMillis: 2000, // 接続タイムアウト
  });
}
