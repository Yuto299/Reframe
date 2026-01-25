import { config } from 'dotenv';
import { resolve } from 'path';
import { serve } from '@hono/node-server';
import { createServer } from './api/server.js';
import { createContainerWithDatabase } from './infrastructure/di/container.js';

// .envファイルを読み込む（プロジェクトルートから）
config({ path: resolve(process.cwd(), '../.env') });

const PORT = parseInt(process.env.PORT || '8080', 10);

// データベースを初期化してからサーバーを起動
async function startServer() {
    try {
        // データベースを初期化（マイグレーション実行）
        const { initializeContainer } = await import('./infrastructure/di/container.js');
        await initializeContainer();
        console.log('Database initialized successfully');

        const app = createServer();

        serve({
            fetch: app.fetch,
            port: PORT,
        }, (info: { port: number; address: string }) => {
            console.log(`Server is running on port ${info.port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
