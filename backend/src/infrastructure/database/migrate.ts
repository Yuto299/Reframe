import { Pool } from "pg";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { existsSync } from "node:fs";

/**
 * データベースマイグレーションを実行
 */
export async function migrateDatabase(pool: Pool): Promise<void> {
  // スキーマファイルのパスを複数試す
  const schemaPaths = [
    resolve(process.cwd(), "src/infrastructure/database/schema.sql"), // ローカル開発
    resolve(process.cwd(), "dist/infrastructure/database/schema.sql"), // ビルド後
  ];

  let schemaPath: string | null = null;
  for (const path of schemaPaths) {
    if (existsSync(path)) {
      schemaPath = path;
      break;
    }
  }

  if (!schemaPath) {
    throw new Error("Schema file not found. Tried: " + schemaPaths.join(", "));
  }

  const schema = readFileSync(schemaPath, "utf-8");

  // トランザクション内で実行
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(schema);
    await client.query("COMMIT");
    console.log("Database migration completed successfully");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
