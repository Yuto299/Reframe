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
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('SegmentTopicsUseCase error:', errorMessage);
            console.error('Error details:', error);
            
            // より詳細なエラーメッセージを提供
            if (errorMessage.includes('GOOGLE_AI_API_KEY')) {
                throw new UseCaseExecutionError(
                    'GOOGLE_AI_API_KEY environment variable is not set. Please check your .env file.'
                );
            }
            if (errorMessage.includes('API key not valid') || errorMessage.includes('API_KEY_INVALID')) {
                throw new UseCaseExecutionError(
                    'Invalid API key. Please check your GOOGLE_AI_API_KEY in .env file.'
                );
            }
            if (errorMessage.includes('not found') || errorMessage.includes('404')) {
                throw new UseCaseExecutionError(
                    'Model not found. Please check the model name configuration.'
                );
            }
            
            // 元のエラーメッセージをそのまま返す（より具体的な情報を提供）
            throw new UseCaseExecutionError(
                `Failed to segment topics: ${errorMessage}`,
                error instanceof Error ? error : new Error(String(error))
            );
        }
    }
}
