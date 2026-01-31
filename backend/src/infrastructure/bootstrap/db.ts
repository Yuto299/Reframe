import { Pool } from "pg";
import { createDatabasePool } from "../database/pool.js";
import { migrateDatabase } from "../database/migrate.js";

/**
 * データベース接続プール（シングルトン）
 */
let databasePool: Pool | null = null;

/**
 * データベース接続プールを初期化してマイグレーションを実行
 */
export async function initializeDatabase(): Promise<Pool> {
  if (databasePool) {
    return databasePool;
  }
  databasePool = createDatabasePool();
  try {
    await migrateDatabase(databasePool);
  } catch (error) {
    console.error("Database migration failed:", error);
    throw error;
  }

  return databasePool;
}

/**
 * データベース接続プールを取得
 */
export function getDatabasePool(): Pool {
  if (!databasePool) {
    throw new Error(
      "Database pool not initialized. Call initializeDatabase() first.",
    );
  }
  return databasePool;
}

/**
 * データベース接続を終了
 */
export async function closeDatabase(): Promise<void> {
  if (databasePool) {
    await databasePool.end();
    databasePool = null;
    console.log("Database connection pool closed");
  }
}
