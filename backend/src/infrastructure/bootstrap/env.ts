import { config } from "dotenv";
import { resolve } from "path";

/**
 * 環境変数を初期化
 * 開発環境: トップレベルの.envを読み込む
 * 本番環境: クラウドの環境変数を使用
 */
export function initializeEnv(): void {
  config({ path: resolve(process.cwd(), ".env") });
  validateEnv();
}

/**
 * 必須の環境変数を検証
 */
export function validateEnv(): void {
  const required = ["DATABASE_URL", "GCP_PROJECT_ID", "GCP_LOCATION"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
}
