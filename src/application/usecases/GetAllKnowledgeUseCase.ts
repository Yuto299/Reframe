import { KnowledgeRepository } from '@/domain/repositories/KnowledgeRepository';
import { Knowledge } from '@/domain/models/Knowledge';
import { UseCaseExecutionError } from '../errors/ApplicationError';

export class GetAllKnowledgeUseCase {
    constructor(private repository: KnowledgeRepository) {}

    async execute(): Promise<Knowledge[]> {
        try {
            return await this.repository.findAll();
        } catch (error) {
            throw new UseCaseExecutionError(
                'Failed to get all knowledge',
                error instanceof Error ? error : new Error(String(error))
            );
        }
    }
}
