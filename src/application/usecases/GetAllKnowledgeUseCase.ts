import { KnowledgeRepository } from '@/domain/repositories/KnowledgeRepository';
import { Knowledge } from '@/domain/models/Knowledge';

export class GetAllKnowledgeUseCase {
    constructor(private repository: KnowledgeRepository) { }

    async execute(): Promise<Knowledge[]> {
        return await this.repository.findAll();
    }
}
