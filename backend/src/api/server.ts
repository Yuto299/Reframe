import { OpenAPIHono } from '@hono/zod-openapi';
import { Context } from 'hono';
import { cors } from 'hono/cors';
import { swaggerUI } from '@hono/swagger-ui';
import { knowledgeRoutes } from './routes/knowledge.js';
import { DomainError } from '../domain/errors/DomainError.js';
import { ApplicationError } from '../application/errors/ApplicationError.js';

export function createServer(): OpenAPIHono {
    const app = new OpenAPIHono();

    // OpenAPI設定
    app.doc('/api/doc', {
        openapi: '3.0.0',
        info: {
            version: '1.0.0',
            title: 'Reframe API',
            description: 'Reframe Knowledge Management API',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: '開発環境',
            },
        ],
    });

    // Swagger UI
    app.get('/api/ui', swaggerUI({ url: '/api/doc' }));

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
