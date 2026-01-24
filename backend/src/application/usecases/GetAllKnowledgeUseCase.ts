import { KnowledgeRepository, Knowledge } from '@reframe/shared';
import { UseCaseExecutionError } from '../errors/ApplicationError.js';

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
