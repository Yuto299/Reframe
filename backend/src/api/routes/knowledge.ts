import { Hono } from "hono";
import { getContainer } from "../../infrastructure/bootstrap/container.js";
import type { CreateKnowledgeInput } from "@/domain/models/Knowledge";

/**
 * ナレッジルートのファクトリ関数
 * 初期化後にコンテナを取得してルートを作成
 */
export function createKnowledgeRoutes(): Hono {
  const app = new Hono();
  const container = getContainer();

  // GET /api/knowledge - 全ナレッジ取得
  app.get("/", async (c) => {
    const knowledge = await container.getAllKnowledgeUseCase.execute();
    const serialized = knowledge.map((k) => ({
      ...k,
      createdAt: k.createdAt.toISOString(),
      connections: [...k.connections],
    }));
    return c.json({ data: serialized });
  });

  // GET /api/knowledge/:id - IDでナレッジ取得
  app.get("/:id", async (c) => {
    const id = c.req.param("id");
    const knowledge = await container.getKnowledgeByIdUseCase.execute(id);
    return c.json({
      data: {
        ...knowledge,
        createdAt: knowledge.createdAt.toISOString(),
        connections: [...knowledge.connections],
      },
    });
  });

  // POST /api/knowledge/search - ナレッジ検索
  app.post("/search", async (c) => {
    const { query } = await c.req.json<{ query: string }>();
    const results = await container.searchKnowledgeUseCase.execute(query);
    const serialized = results.map((r) => ({
      knowledge: {
        ...r.knowledge,
        createdAt: r.knowledge.createdAt.toISOString(),
        connections: [...r.knowledge.connections],
      },
      relevanceScore: r.relevanceScore,
    }));
    return c.json({ data: serialized });
  });

  // POST /api/knowledge - ナレッジ作成
  app.post("/", async (c) => {
    const input = await c.req.json<CreateKnowledgeInput>();
    const knowledge = await container.createKnowledgeUseCase.execute(input);
    return c.json(
      {
        data: {
          ...knowledge,
          createdAt: knowledge.createdAt.toISOString(),
          connections: [...knowledge.connections],
        },
      },
      201,
    );
  });

  // POST /api/knowledge/:id/connect - ナレッジ接続
  app.post("/:id/connect", async (c) => {
    const id = c.req.param("id");
    const { targetIds } = await c.req.json<{ targetIds: string[] }>();
    await container.connectKnowledgeUseCase.execute(id, targetIds);
    return c.body(null, 204);
  });

  // GET /api/knowledge/:id/related - 関連ナレッジ検索
  app.get("/:id/related", async (c) => {
    const id = c.req.param("id");
    const knowledge = await container.getKnowledgeByIdUseCase.execute(id);
    const topicText = `${knowledge.title}\n${knowledge.content}`;

    const results = await container.searchRelatedKnowledgeUseCase.execute(
      topicText,
      0.7, // 閾値: 70%以上
      10, // 最大10件
    );

    const serialized = results.map((r) => ({
      knowledge: {
        ...r.knowledge,
        createdAt: r.knowledge.createdAt.toISOString(),
        connections: [...r.knowledge.connections],
      },
      relevanceScore: r.relevanceScore,
    }));

    return c.json({ data: serialized });
  });

  // POST /api/knowledge/segment-topics - トピック分割
  app.post("/segment-topics", async (c) => {
    const { content } = await c.req.json<{ content: string }>();
    const topics = await container.segmentTopicsUseCase.execute(content);

    // 各トピックに関連ナレッジを検索
    const topicsWithRelatedKnowledge = await Promise.all(
      topics.map(async (topic) => {
        try {
          const topicText = `${topic.title}\n${topic.content}`;
          const relatedKnowledge =
            await container.searchRelatedKnowledgeUseCase.execute(
              topicText,
              0.7, // 閾値: 70%以上
              5, // 最大5件
            );

          const serializedRelatedKnowledge = relatedKnowledge.map((r) => ({
            knowledge: {
              ...r.knowledge,
              createdAt: r.knowledge.createdAt.toISOString(),
              connections: [...r.knowledge.connections],
            },
            relevanceScore: r.relevanceScore,
          }));

          return {
            ...topic,
            relatedKnowledge: serializedRelatedKnowledge,
          };
        } catch (error) {
          console.warn(
            `Failed to search related knowledge for topic "${topic.title}":`,
            error,
          );
          return {
            ...topic,
            relatedKnowledge: [],
          };
        }
      }),
    );

    return c.json({ data: topicsWithRelatedKnowledge });
  });

  // POST /api/knowledge/connect-topics - トピックをナレッジとして作成・接続
  app.post("/connect-topics", async (c) => {
    const { topics } = await c.req.json<{
      topics: Array<{
        title: string;
        content: string;
        relatedKnowledgeIds?: string[];
      }>;
    }>();

    // 各トピックをナレッジとして作成
    const createdKnowledgeList: Array<{
      id: string;
      title: string;
      content: string;
      embedding: number[];
    }> = [];

    for (const topic of topics) {
      const newKnowledge = await container.createKnowledgeUseCase.execute({
        title: topic.title,
        content: topic.content,
      });

      // 埋め込みベクトルを生成（トピック同士の類似度計算用）
      const embedding = await container.vertexAIService.generateEmbedding(
        `${topic.title}\n${topic.content}`,
      );

      createdKnowledgeList.push({
        id: newKnowledge.id,
        title: topic.title,
        content: topic.content,
        embedding,
      });

      // 関連ナレッジがある場合、接続
      if (topic.relatedKnowledgeIds && topic.relatedKnowledgeIds.length > 0) {
        await container.connectKnowledgeUseCase.execute(
          newKnowledge.id,
          topic.relatedKnowledgeIds,
        );
      }
    }

    // トピック同士の類似度を計算して接続
    const similarityThreshold = 0.7;

    for (let i = 0; i < createdKnowledgeList.length; i++) {
      for (let j = i + 1; j < createdKnowledgeList.length; j++) {
        const knowledge1 = createdKnowledgeList[i];
        const knowledge2 = createdKnowledgeList[j];

        const similarity = container.vertexAIService.cosineSimilarity(
          knowledge1.embedding,
          knowledge2.embedding,
        );

        if (similarity >= similarityThreshold) {
          await container.connectKnowledgeUseCase.execute(knowledge1.id, [
            knowledge2.id,
          ]);
        }
      }
    }

    return c.body(null, 204);
  });

  return app;
}
