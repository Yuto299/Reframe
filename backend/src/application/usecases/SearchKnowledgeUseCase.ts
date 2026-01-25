import { KnowledgeRepository } from '../../domain/repositories/KnowledgeRepository.js';
import { SearchResult } from '../../domain/models/Knowledge.js';
import { UseCaseExecutionError } from '../errors/ApplicationError.js';

export class SearchKnowledgeUseCase {
    constructor(private repository: KnowledgeRepository) {}

    async execute(query: string): Promise<SearchResult[]> {
        if (!query || typeof query !== 'string') {
            throw new UseCaseExecutionError('Search query must be a non-empty string');
        }

        const trimmedQuery = query.trim();
        if (trimmedQuery.length === 0) {
            return [];
        }

        try {
            return await this.repository.search(trimmedQuery);
        } catch (error) {
            throw new UseCaseExecutionError(
                'Failed to search knowledge',
                error instanceof Error ? error : new Error(String(error))
            );
        }
    }
}
