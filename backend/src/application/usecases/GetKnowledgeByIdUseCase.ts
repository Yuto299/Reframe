import { KnowledgeRepository, Knowledge, KnowledgeNotFoundError, DomainError } from '@reframe/shared';
import { UseCaseExecutionError } from '../errors/ApplicationError.js';

export class GetKnowledgeByIdUseCase {
    constructor(private repository: KnowledgeRepository) {}

    async execute(id: string): Promise<Knowledge> {
        if (!id || id.trim().length === 0) {
            throw new UseCaseExecutionError('Knowledge ID cannot be empty');
        }

        try {
            const knowledge = await this.repository.findById(id);
            
            if (!knowledge) {
                throw new KnowledgeNotFoundError(id);
            }
            
            return knowledge;
        } catch (error) {
            if (error instanceof DomainError) {
                throw error;
            }
            throw new UseCaseExecutionError(
                `Failed to get knowledge with id "${id}"`,
                error instanceof Error ? error : new Error(String(error))
            );
        }
    }
}
