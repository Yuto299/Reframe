import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { container } from '../../infrastructure/di/container.js';
import { CreateKnowledgeInput } from '../../domain/models/Knowledge.js';
import {
    KnowledgeListResponseSchema,
    KnowledgeResponseSchema,
    SearchResponseSchema,
    CreateKnowledgeInputSchema,
    SearchRequestSchema,
    ConnectRequestSchema,
    ErrorResponseSchema,
} from '../schemas/knowledge.js';

const app = new OpenAPIHono();

// GET /api/knowledge - 全ナレッジ取得
const getAllRoute = createRoute({
    method: 'get',
    path: '/',
    summary: '全ナレッジ取得',
    description: '登録されているすべてのナレッジを取得します',
    tags: ['Knowledge'],
    responses: {
        200: {
            description: '成功',
            content: {
                'application/json': {
                    schema: KnowledgeListResponseSchema,
                },
            },
        },
        500: {
            description: 'サーバーエラー',
            content: {
                'application/json': {
                    schema: ErrorResponseSchema,
                },
            },
        },
    },
});

app.openapi(getAllRoute, async (c) => {
    try {
        const knowledge = await container.getAllKnowledgeUseCase.execute();
        // DateをISO文字列に変換、readonly配列を通常の配列に変換
        const serialized = knowledge.map((k) => ({
            ...k,
            createdAt: k.createdAt.toISOString(),
            connections: [...k.connections],
        }));
        return c.json({ data: serialized }, 200);
    } catch (error) {
        throw error;
    }
});

// GET /api/knowledge/:id - IDでナレッジ取得
const getByIdRoute = createRoute({
    method: 'get',
    path: '/{id}',
    summary: 'IDでナレッジ取得',
    description: '指定されたIDのナレッジを取得します',
    tags: ['Knowledge'],
    request: {
        params: z.object({
            id: z.string().describe('ナレッジのID'),
        }),
    },
    responses: {
        200: {
            description: '成功',
            content: {
                'application/json': {
                    schema: KnowledgeResponseSchema,
                },
            },
        },
        400: {
            description: 'バリデーションエラー',
            content: {
                'application/json': {
                    schema: ErrorResponseSchema,
                },
            },
        },
        500: {
            description: 'サーバーエラー',
            content: {
                'application/json': {
                    schema: ErrorResponseSchema,
                },
            },
        },
    },
});

app.openapi(getByIdRoute, async (c) => {
    try {
        const { id } = c.req.valid('param');
        const knowledge = await container.getKnowledgeByIdUseCase.execute(id);
        return c.json({
            data: {
                ...knowledge,
                createdAt: knowledge.createdAt.toISOString(),
                connections: [...knowledge.connections],
            },
        }, 200);
    } catch (error) {
        throw error;
    }
});

// POST /api/knowledge/search - ナレッジ検索
const searchRoute = createRoute({
    method: 'post',
    path: '/search',
    summary: 'ナレッジ検索',
    description: 'キーワードでナレッジを検索します',
    tags: ['Knowledge'],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: SearchRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: '成功',
            content: {
                'application/json': {
                    schema: SearchResponseSchema,
                },
            },
        },
        400: {
            description: 'バリデーションエラー',
            content: {
                'application/json': {
                    schema: ErrorResponseSchema,
                },
            },
        },
        500: {
            description: 'サーバーエラー',
            content: {
                'application/json': {
                    schema: ErrorResponseSchema,
                },
            },
        },
    },
});

app.openapi(searchRoute, async (c) => {
    try {
        const { query } = c.req.valid('json');
        const results = await container.searchKnowledgeUseCase.execute(query);
        // DateをISO文字列に変換、readonly配列を通常の配列に変換
        const serialized = results.map((r) => ({
            knowledge: {
                ...r.knowledge,
                createdAt: r.knowledge.createdAt.toISOString(),
                connections: [...r.knowledge.connections],
            },
            relevanceScore: r.relevanceScore,
        }));
        return c.json({ data: serialized }, 200);
    } catch (error) {
        throw error;
    }
});

// POST /api/knowledge - ナレッジ作成
const createKnowledgeRoute = createRoute({
    method: 'post',
    path: '/',
    summary: 'ナレッジ作成',
    description: '新しいナレッジを作成します',
    tags: ['Knowledge'],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: CreateKnowledgeInputSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: '作成成功',
            content: {
                'application/json': {
                    schema: KnowledgeResponseSchema,
                },
            },
        },
        400: {
            description: 'バリデーションエラー',
            content: {
                'application/json': {
                    schema: ErrorResponseSchema,
                },
            },
        },
        500: {
            description: 'サーバーエラー',
            content: {
                'application/json': {
                    schema: ErrorResponseSchema,
                },
            },
        },
    },
});

app.openapi(createKnowledgeRoute, async (c) => {
    try {
        const input: CreateKnowledgeInput = c.req.valid('json');
        const knowledge = await container.createKnowledgeUseCase.execute(input);
        return c.json(
            {
                data: {
                    ...knowledge,
                    createdAt: knowledge.createdAt.toISOString(),
                    connections: [...knowledge.connections],
                },
            },
            201
        );
    } catch (error) {
        throw error;
    }
});

// POST /api/knowledge/:id/connect - ナレッジ接続
const connectRoute = createRoute({
    method: 'post',
    path: '/{id}/connect',
    summary: 'ナレッジ接続',
    description: '指定されたナレッジを他のナレッジに接続します',
    tags: ['Knowledge'],
    request: {
        params: z.object({
            id: z.string().describe('接続元のナレッジID'),
        }),
        body: {
            content: {
                'application/json': {
                    schema: ConnectRequestSchema,
                },
            },
        },
    },
    responses: {
        204: {
            description: '接続成功',
        },
        400: {
            description: 'バリデーションエラー',
            content: {
                'application/json': {
                    schema: ErrorResponseSchema,
                },
            },
        },
        500: {
            description: 'サーバーエラー',
            content: {
                'application/json': {
                    schema: ErrorResponseSchema,
                },
            },
        },
    },
});

app.openapi(connectRoute, async (c) => {
    try {
        const { id } = c.req.valid('param');
        const { targetIds } = c.req.valid('json');
        await container.connectKnowledgeUseCase.execute(id, targetIds);
        return c.body(null, 204);
    } catch (error) {
        throw error;
    }
});

export { app as knowledgeRoutes };
