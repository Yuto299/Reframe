import { Hono, Context } from 'hono';
import { cors } from 'hono/cors';
import { knowledgeRoutes } from './routes/knowledge.js';
import { DomainError } from '@reframe/shared';
import { ApplicationError } from '../application/errors/ApplicationError.js';

export function createServer(): Hono {
    const app = new Hono();

    // Middleware
    app.use('*', cors());

    // Health check
    app.get('/health', (c: Context) => {
        return c.json({ status: 'ok' });
    });

    // API routes
    app.route('/api/knowledge', knowledgeRoutes);

    // Error handling middleware
    app.onError((err: Error, c: Context) => {
        if (err instanceof DomainError) {
            return c.json(
                {
                    error: {
                        code: err.code,
                        message: err.message,
                    },
                },
                400
            );
        }

        if (err instanceof ApplicationError) {
            return c.json(
                {
                    error: {
                        code: err.code,
                        message: err.message,
                    },
                },
                500
            );
        }

        // Unknown error
        console.error('Unhandled error:', err);
        return c.json(
            {
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'An unexpected error occurred',
                },
            },
            500
        );
    });

    return app;
}
