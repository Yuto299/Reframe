import { Container, createContainer } from "../di/container.js";
import { initializeDatabase } from "./db.js";
import { initializeEnv, validateEnv } from "./env.js";

/**
 * DIコンテナインスタンス（シングルトン）
 */
let containerInstance: Container | null = null;

/**
 * アプリケーション全体を初期化
 * 1. 環境変数の読み込み
 * 2. 環境変数の検証
 * 3. データベースの初期化
 * 4. DIコンテナの作成
 */
export async function initializeContainer(): Promise<Container> {
  if (containerInstance) {
    return containerInstance;
  }
  initializeEnv();
  validateEnv();
  const pool = await initializeDatabase();
  containerInstance = createContainer(pool);
  return containerInstance;
}

/**
 * DIコンテナを取得
 */
export function getContainer(): Container {
  if (!containerInstance) {
    throw new Error(
      "Container not initialized. Call initializeContainer() first.",
    );
  }
  return containerInstance;
}
