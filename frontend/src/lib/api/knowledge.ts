import { apiClient, ApiError } from './client';
import { Knowledge, CreateKnowledgeInput, SearchResult, TopicSegment } from '@/types/knowledge';

export { ApiError };

export const knowledgeApi = {
    /**
     * 全ナレッジを取得
     */
    async getAll(): Promise<Knowledge[]> {
        return apiClient.get<Knowledge[]>('/api/knowledge');
    },

    /**
     * IDでナレッジを取得
     */
    async getById(id: string): Promise<Knowledge> {
        return apiClient.get<Knowledge>(`/api/knowledge/${id}`);
    },

    /**
     * ナレッジを検索
     */
    async search(query: string): Promise<SearchResult[]> {
        return apiClient.post<SearchResult[]>('/api/knowledge/search', { query });
    },

    /**
     * ナレッジを作成
     */
    async create(input: CreateKnowledgeInput): Promise<Knowledge> {
        return apiClient.post<Knowledge>('/api/knowledge', input);
    },

    /**
     * ナレッジを接続
     */
    async connect(sourceId: string, targetIds: string[]): Promise<void> {
        await apiClient.post<void>(`/api/knowledge/${sourceId}/connect`, { targetIds });
    },

    /**
     * テキストをトピックに分割
     */
    async analyzeTopics(text: string): Promise<TopicSegment[]> {
        return apiClient.post<TopicSegment[]>('/api/knowledge/analyze-topics', { text });
    },

    /**
     * トピックをナレッジとして作成・接続
     */
    async connectTopics(topics: Array<{ title: string; content: string; relatedKnowledgeIds?: string[] }>): Promise<void> {
        await apiClient.post<void>('/api/knowledge/connect-topics', { topics });
    },
};
