import { KnowledgeRepository } from '@/domain/repositories/KnowledgeRepository';
import { SearchResult } from '@/domain/models/Knowledge';

export class SearchKnowledgeUseCase {
    constructor(private repository: KnowledgeRepository) { }

    async execute(query: string): Promise<SearchResult[]> {
        return await this.repository.search(query);
    }
}
