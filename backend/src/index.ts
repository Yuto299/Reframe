import { serve } from '@hono/node-server';
import { createServer } from './api/server.js';

const PORT = parseInt(process.env.PORT || '8080', 10);

const app = createServer();

serve({
    fetch: app.fetch,
    port: PORT,
}, (info: { port: number; address: string }) => {
    console.log(`Server is running on port ${info.port}`);
});
