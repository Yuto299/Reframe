import { serve } from "@hono/node-server";
import { createServer } from "./api/server.js";
import { initializeContainer } from "./infrastructure/bootstrap/container.js";

const PORT = parseInt(process.env.PORT || "8080", 10);

async function startServer() {
  try {
    // アプリケーション全体を初期化
    await initializeContainer();

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
