import { Pool } from "pg";
import {
  Knowledge,
  CreateKnowledgeInput,
  SearchResult,
} from "../../domain/models/Knowledge.js";
import { KnowledgeRepository } from "../../domain/repositories/KnowledgeRepository.js";

/**
 * PostgreSQL実装のKnowledgeRepository
 */
export class PostgreSQLKnowledgeRepository implements KnowledgeRepository {
  constructor(private pool: Pool) {}

  async findAll(): Promise<Knowledge[]> {
    const result = await this.pool.query<{
      id: string;
      title: string;
      content: string;
      created_at: Date;
    }>(`
            SELECT id, title, content, created_at
            FROM knowledge
            ORDER BY created_at DESC
        `);

    // 各ナレッジの接続を取得
    const knowledgeList = await Promise.all(
      result.rows.map(async (row) => {
        const connections = await this.getConnections(row.id);
        return {
          id: row.id,
          title: row.title,
          content: row.content,
          createdAt: row.created_at,
          connections,
        };
      }),
    );

    return knowledgeList;
  }

  async findById(id: string): Promise<Knowledge | null> {
    const result = await this.pool.query<{
      id: string;
      title: string;
      content: string;
      created_at: Date;
    }>(
      `
            SELECT id, title, content, created_at
            FROM knowledge
            WHERE id = $1
        `,
      [id],
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const connections = await this.getConnections(id);

    return {
      id: row.id,
      title: row.title,
      content: row.content,
      createdAt: row.created_at,
      connections,
    };
  }

  async search(query: string): Promise<SearchResult[]> {
    if (!query.trim()) {
      return [];
    }

    // PostgreSQLの全文検索を使用
    const result = await this.pool.query<{
      id: string;
      title: string;
      content: string;
      created_at: Date;
      rank: number;
    }>(
      `
            SELECT 
                id, 
                title, 
                content, 
                created_at,
                ts_rank(to_tsvector('english', title || ' ' || content), plainto_tsquery('english', $1)) as rank
            FROM knowledge
            WHERE 
                to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', $1)
            ORDER BY rank DESC
            LIMIT 10
        `,
      [query],
    );

    // 各ナレッジの接続を取得
    const searchResults = await Promise.all(
      result.rows.map(async (row) => {
        const connections = await this.getConnections(row.id);
        const knowledge: Knowledge = {
          id: row.id,
          title: row.title,
          content: row.content,
          createdAt: row.created_at,
          connections,
        };

        // ランクを0-100のスコアに変換
        const relevanceScore = Math.min(100, Math.max(0, row.rank * 10));

        return {
          knowledge,
          relevanceScore,
        };
      }),
    );

    return searchResults;
  }

  async create(input: CreateKnowledgeInput): Promise<Knowledge> {
    const result = await this.pool.query<{
      id: string;
      title: string;
      content: string;
      created_at: Date;
    }>(
      `
            INSERT INTO knowledge (title, content)
            VALUES ($1, $2)
            RETURNING id, title, content, created_at
        `,
      [input.title.trim(), input.content.trim()],
    );

    const row = result.rows[0];
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      createdAt: row.created_at,
      connections: [],
    };
  }

  async addConnection(sourceId: string, targetId: string): Promise<void> {
    // 双方向の接続を作成（既に存在する場合は無視）
    await this.pool.query(
      `
            INSERT INTO knowledge_connections (source_id, target_id)
            VALUES ($1, $2), ($2, $1)
            ON CONFLICT (source_id, target_id) DO NOTHING
        `,
      [sourceId, targetId],
    );
  }

  async removeConnection(sourceId: string, targetId: string): Promise<void> {
    // 双方向の接続を削除
    await this.pool.query(
      `
            DELETE FROM knowledge_connections
            WHERE (source_id = $1 AND target_id = $2)
               OR (source_id = $2 AND target_id = $1)
        `,
      [sourceId, targetId],
    );
  }

  /**
   * 指定されたナレッジIDの接続先IDリストを取得
   */
  private async getConnections(knowledgeId: string): Promise<string[]> {
    const result = await this.pool.query<{ target_id: string }>(
      `
            SELECT target_id
            FROM knowledge_connections
            WHERE source_id = $1
        `,
      [knowledgeId],
    );

    return result.rows.map((row) => row.target_id);
  }
}
