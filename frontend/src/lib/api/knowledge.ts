import { apiClient, ApiError } from './client';
import { Knowledge, CreateKnowledgeInput, SearchResult, TopicSegment } from '@/types/knowledge';

export { ApiError };

export const knowledgeApi = {
    /**
     * 全ナレッジを取得
     */
    async getAll(): Promise<Knowledge[]> {
        const { data, error } = await apiClient.GET('/api/knowledge');
        if (error) throw new ApiError(error.error.message, error.error.code, 500);
        return data?.data || [];
    },

    /**
     * IDでナレッジを取得
     */
    async getById(id: string): Promise<Knowledge> {
        const { data, error } = await apiClient.GET('/api/knowledge/{id}', {
            params: { path: { id } },
        });
        if (error) throw new ApiError(error.error.message, error.error.code, 400);
        if (!data?.data) throw new ApiError('Not found', 'NOT_FOUND', 404);
        return data.data;
    },

    /**
     * ナレッジを検索
     */
    async search(query: string): Promise<SearchResult[]> {
        const { data, error } = await apiClient.POST('/api/knowledge/search', {
            body: { query },
        });
        if (error) throw new ApiError(error.error.message, error.error.code, 400);
        return data?.data || [];
    },

    /**
     * ナレッジを作成
     */
    async create(input: CreateKnowledgeInput): Promise<Knowledge> {
        const { data, error } = await apiClient.POST('/api/knowledge', {
            body: input,
        });
        if (error) throw new ApiError(error.error.message, error.error.code, 400);
        if (!data?.data) throw new ApiError('Creation failed', 'CREATION_FAILED', 500);
        return data.data;
    },

    /**
     * ナレッジを接続
     */
    async connect(sourceId: string, targetIds: string[]): Promise<void> {
        const { error } = await apiClient.POST('/api/knowledge/{id}/connect', {
            params: { path: { id: sourceId } },
            body: { targetIds },
        });
        if (error) throw new ApiError(error.error.message, error.error.code, 400);
    },

    /**
     * 関連ナレッジを検索
     */
    async getRelated(id: string): Promise<SearchResult[]> {
        const { data, error } = await apiClient.GET('/api/knowledge/{id}/related', {
            params: { path: { id } },
        });
        if (error) throw new ApiError(error.error.message, error.error.code, 400);
        return data?.data || [];
    },

    /**
     * テキストをトピックに分割
     */
    async segmentTopics(content: string): Promise<TopicSegment[]> {
        const { data, error } = await apiClient.POST('/api/knowledge/segment-topics', {
            body: { content },
        });
        if (error) throw new ApiError(error.error.message, error.error.code, 400);
        return data?.data || [];
    },

    /**
     * トピックをナレッジとして作成・接続
     */
    async connectTopics(topics: Array<{ title: string; content: string; relatedKnowledgeIds?: string[] }>): Promise<void> {
        const { error } = await apiClient.POST('/api/knowledge/connect-topics', {
            body: { topics },
        });
        if (error) throw new ApiError(error.error.message, error.error.code, 400);
    },
};
