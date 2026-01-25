/**
 * APIレスポンスの型定義
 * BackendのAPIから返されるデータの型
 */

/**
 * ナレッジエンティティ
 */
export interface Knowledge {
    readonly id: string;
    readonly title: string;
    readonly content: string;
    readonly createdAt: string; // ISO 8601形式の文字列
    readonly connections: readonly string[]; // Array of connected knowledge IDs
}

/**
 * ナレッジ作成用の入力
 */
export interface CreateKnowledgeInput {
    title: string;
    content: string;
}

/**
 * 検索結果
 */
export interface SearchResult {
    knowledge: Knowledge;
    relevanceScore: number;
}

/**
 * トピック分割結果
 */
export interface TopicSegment {
    title: string;
    content: string;
    relatedKnowledge?: SearchResult[];
}
