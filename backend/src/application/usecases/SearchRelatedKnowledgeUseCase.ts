import { KnowledgeRepository } from "../../domain/repositories/KnowledgeRepository.js";
import { Knowledge, SearchResult } from "../../domain/models/Knowledge.js";
import { VertexAIService } from "../../infrastructure/services/VertexAIService.js";
import { UseCaseExecutionError } from "../errors/ApplicationError.js";

/**
 * 関連ナレッジ検索ユースケース
 * Vertex AIのEmbeddings APIを使用して、トピックテキストと既存ナレッジの関連度を計算
 */
export class SearchRelatedKnowledgeUseCase {
  constructor(
    private repository: KnowledgeRepository,
    private vertexAIService: VertexAIService,
  ) {}

  /**
   * トピックテキストに関連する既存ナレッジを検索
   * @param topicText トピックのテキスト
   * @param threshold 関連度の閾値（0-1、デフォルト: 0.7）
   * @param maxResults 最大結果数（デフォルト: 5）
   * @returns 関連度スコア付きのナレッジリスト
   */
  async execute(
    topicText: string,
    threshold: number = 0.7,
    maxResults: number = 5,
  ): Promise<SearchResult[]> {
    if (!topicText || typeof topicText !== "string") {
      throw new UseCaseExecutionError("Topic text must be a non-empty string");
    }

    const trimmedText = topicText.trim();
    if (trimmedText.length === 0) {
      return [];
    }

    try {
      // すべてのナレッジを取得
      const allKnowledge = await this.repository.findAll();
      if (allKnowledge.length === 0) {
        return [];
      }

      // トピックテキストの埋め込みベクトルを生成
      const topicEmbedding =
        await this.vertexAIService.generateEmbedding(trimmedText);

      // 各ナレッジの埋め込みベクトルを生成して類似度を計算
      const results: Array<{ knowledge: Knowledge; relevanceScore: number }> =
        [];

      for (const knowledge of allKnowledge) {
        try {
          // ナレッジのテキスト（タイトル + 内容）の埋め込みベクトルを生成
          const knowledgeText = `${knowledge.title}\n${knowledge.content}`;
          const knowledgeEmbedding =
            await this.vertexAIService.generateEmbedding(knowledgeText);

          // コサイン類似度を計算（0-1の範囲）
          const similarity = this.vertexAIService.cosineSimilarity(
            topicEmbedding,
            knowledgeEmbedding,
          );

          // 関連度スコアは0-1のfloat
          const relevanceScore = similarity;

          // 閾値以上の関連度を持つナレッジのみを追加
          if (relevanceScore >= threshold) {
            results.push({ knowledge, relevanceScore });
          }
        } catch (error) {
          // 個別のナレッジでエラーが発生しても続行
          console.warn(
            `Failed to generate embedding for knowledge ${knowledge.id}:`,
            error,
          );
        }
      }

      // 関連度スコアでソート（降順）
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);

      // 最大結果数まで返す
      return results.slice(0, maxResults).map((r) => ({
        knowledge: r.knowledge,
        relevanceScore: r.relevanceScore,
      }));
    } catch (error) {
      throw new UseCaseExecutionError(
        "Failed to search related knowledge",
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}
