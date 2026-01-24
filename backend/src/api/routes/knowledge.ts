import { Hono, Context } from 'hono';
import { container } from '../../infrastructure/di/container.js';
import { CreateKnowledgeInput } from '@reframe/shared';

const router = new Hono();

// GET /api/knowledge - 全ナレッジ取得
router.get('/', async (c: Context) => {
    try {
        const knowledge = await container.getAllKnowledgeUseCase.execute();
        return c.json({ data: knowledge });
    } catch (error) {
        throw error;
    }
});

// GET /api/knowledge/:id - IDでナレッジ取得
router.get('/:id', async (c: Context) => {
    try {
        const id = c.req.param('id');
        const knowledge = await container.getKnowledgeByIdUseCase.execute(id);
        return c.json({ data: knowledge });
    } catch (error) {
        throw error;
    }
});

// POST /api/knowledge/search - ナレッジ検索
router.post('/search', async (c: Context) => {
    try {
        const body = await c.req.json();
        const { query } = body;
        if (!query || typeof query !== 'string') {
            return c.json(
                {
                    error: {
                        code: 'INVALID_REQUEST',
                        message: 'Query must be a non-empty string',
                    },
                },
                400
            );
        }
        const results = await container.searchKnowledgeUseCase.execute(query);
        return c.json({ data: results });
    } catch (error) {
        throw error;
    }
});

// POST /api/knowledge - ナレッジ作成
router.post('/', async (c: Context) => {
    try {
        const input: CreateKnowledgeInput = await c.req.json();
        const knowledge = await container.createKnowledgeUseCase.execute(input);
        return c.json({ data: knowledge }, 201);
    } catch (error) {
        throw error;
    }
});

// POST /api/knowledge/:id/connect - ナレッジ接続
router.post('/:id/connect', async (c: Context) => {
    try {
        const id = c.req.param('id');
        const body = await c.req.json();
        const { targetIds } = body;

        if (!Array.isArray(targetIds)) {
            return c.json(
                {
                    error: {
                        code: 'INVALID_REQUEST',
                        message: 'targetIds must be an array',
                    },
                },
                400
            );
        }

        await container.connectKnowledgeUseCase.execute(id, targetIds);
        return c.body(null, 204);
    } catch (error) {
        throw error;
    }
});

export { router as knowledgeRoutes };
