import { VertexAIService, TopicSegment } from '@/infrastructure/services/VertexAIService.js';
import { UseCaseExecutionError } from '../errors/ApplicationError.js';

/**
 * トピック分割ユースケース
 * Vertex AIを使用してテキストを複数のトピックに分割
 */
export class SegmentTopicsUseCase {
    constructor(private vertexAIService: VertexAIService) {}

    async execute(text: string): Promise<TopicSegment[]> {
        if (!text || typeof text !== 'string') {
            throw new UseCaseExecutionError('Text must be a non-empty string');
        }

        const trimmedText = text.trim();
        if (trimmedText.length === 0) {
            return [];
        }

        // テキストが長すぎる場合のバリデーション
        const MAX_TEXT_LENGTH = 10000;
        if (trimmedText.length > MAX_TEXT_LENGTH) {
            throw new UseCaseExecutionError(
                `Text length must be less than ${MAX_TEXT_LENGTH} characters`
            );
        }

        try {
            return await this.vertexAIService.segmentTopics(trimmedText);
        } catch (error) {
            throw new UseCaseExecutionError(
                'Failed to segment topics',
                error instanceof Error ? error : new Error(String(error))
            );
        }
    }
}
