import { config } from 'dotenv';
import { resolve } from 'path';
import { serve } from '@hono/node-server';
import { createServer } from './api/server.js';

// .envファイルを読み込む（プロジェクトルートから）
config({ path: resolve(process.cwd(), '../.env') });

const PORT = parseInt(process.env.PORT || '8080', 10);

const app = createServer();

serve({
    fetch: app.fetch,
    port: PORT,
}, (info: { port: number; address: string }) => {
    console.log(`Server is running on port ${info.port}`);
});
