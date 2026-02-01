import { serve } from "@hono/node-server";
import { createServer } from "./api/server.js";
import { initializeContainer } from "./infrastructure/bootstrap/container.js";

/**
 * サーバーを起動
 * 1. 環境変数の読み込み
 * 2. データベースの初期化
 * 3. DIコンテナの初期化
 * 4. HTTPサーバーの起動
 */
async function startServer() {
  try {
    // アプリケーション全体を初期化（.envを読み込む）
    await initializeContainer();

    // .envが読み込まれた後にPORTを取得
    const PORT = parseInt(process.env.PORT || "8080", 10);

    // HTTPサーバーを作成して起動
    const app = createServer();

    serve(
      {
        fetch: app.fetch,
        port: PORT,
      },
      (info: { port: number; address: string }) => {
        console.log(`Server is running on http://${info.address}:${info.port}`);
      },
    );
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
