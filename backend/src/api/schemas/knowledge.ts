import { z } from 'zod';

/**
 * OpenAPI用のZodスキーマ定義
 */

// Knowledgeスキーマ
export const KnowledgeSchema = z.object({
    id: z.string().describe('知識の一意のID'),
    title: z.string().min(1).max(200).describe('知識のタイトル（1-200文字）'),
    content: z.string().min(1).max(10000).describe('知識の内容（1-10,000文字）'),
    createdAt: z.string().datetime().describe('作成日時（ISO 8601形式）'),
    connections: z.array(z.string()).describe('接続されている知識のIDリスト'),
});

// CreateKnowledgeInputスキーマ
export const CreateKnowledgeInputSchema = z.object({
    title: z.string().min(1).max(200).describe('知識のタイトル（1-200文字）'),
    content: z.string().min(1).max(10000).describe('知識の内容（1-10,000文字）'),
});

// SearchResultスキーマ
export const SearchResultSchema = z.object({
    knowledge: KnowledgeSchema,
    relevanceScore: z.number().int().min(0).describe('関連度スコア（0以上の整数）'),
});

// SearchRequestスキーマ
export const SearchRequestSchema = z.object({
    query: z.string().min(1).describe('検索キーワード（空文字列不可）'),
});

// ConnectRequestスキーマ
export const ConnectRequestSchema = z.object({
    targetIds: z.array(z.string()).min(1).describe('接続先の知識IDリスト'),
});

// AnalyzeTopicsRequestスキーマ
export const AnalyzeTopicsRequestSchema = z.object({
    text: z.string().min(1).max(10000).describe('分割するテキスト（1-10,000文字）'),
});

// TopicSegmentスキーマ
export const TopicSegmentSchema = z.object({
    title: z.string().min(1).max(200).describe('トピックのタイトル'),
    content: z.string().min(1).max(10000).describe('トピックの内容'),
});

// AnalyzeTopicsResponseスキーマ
export const AnalyzeTopicsResponseSchema = z.object({
    data: z.array(TopicSegmentSchema).describe('分割されたトピックのリスト'),
});

// ConnectTopicsRequestスキーマ
export const ConnectTopicsRequestSchema = z.object({
    topics: z
        .array(
            z.object({
                title: z.string().min(1).max(200).describe('トピックのタイトル'),
                content: z.string().min(1).max(10000).describe('トピックの内容'),
                relatedKnowledgeIds: z.array(z.string()).optional().describe('関連する既存ナレッジのIDリスト'),
            })
        )
        .min(1)
        .describe('接続するトピックのリスト'),
});

// レスポンススキーマ
export const KnowledgeListResponseSchema = z.object({
    data: z.array(KnowledgeSchema),
});

export const KnowledgeResponseSchema = z.object({
    data: KnowledgeSchema,
});

export const SearchResponseSchema = z.object({
    data: z.array(SearchResultSchema),
});

// エラーレスポンススキーマ
export const ErrorResponseSchema = z.object({
    error: z.object({
        code: z.string().describe('エラーコード'),
        message: z.string().describe('エラーメッセージ'),
    }),
});
