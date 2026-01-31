import { KnowledgeRepository } from '../../domain/repositories/KnowledgeRepository.js';
import { ConnectionValidationError, DomainError } from '../../domain/errors/DomainError.js';
import { UseCaseExecutionError } from '../errors/ApplicationError.js';

export class ConnectKnowledgeUseCase {
    constructor(private repository: KnowledgeRepository) {}

    async execute(sourceId: string, targetIds: string[]): Promise<void> {
        this.validateInput(sourceId, targetIds);

        try {
            // ソースナレッジの存在確認
            const source = await this.repository.findById(sourceId);
            if (!source) {
                throw new ConnectionValidationError(`Source knowledge with id "${sourceId}" not found`);
            }

            // 各ターゲットナレッジの存在確認と接続
            for (const targetId of targetIds) {
                if (sourceId === targetId) {
                    throw new ConnectionValidationError('Cannot connect knowledge to itself');
                }

                const target = await this.repository.findById(targetId);
                if (!target) {
                    throw new ConnectionValidationError(`Target knowledge with id "${targetId}" not found`);
                }

                // 既に接続されている場合はスキップ
                if (source.connections.includes(targetId)) {
                    continue;
                }

                await this.repository.addConnection(sourceId, targetId);
            }
        } catch (error) {
            if (error instanceof DomainError) {
                throw error;
            }
            throw new UseCaseExecutionError(
                `Failed to connect knowledge "${sourceId}" to targets`,
                error instanceof Error ? error : new Error(String(error))
            );
        }
    }

    async disconnect(sourceId: string, targetId: string): Promise<void> {
        if (!sourceId || sourceId.trim().length === 0) {
            throw new UseCaseExecutionError('Source ID cannot be empty');
        }
        if (!targetId || targetId.trim().length === 0) {
            throw new UseCaseExecutionError('Target ID cannot be empty');
        }
        if (sourceId === targetId) {
            throw new ConnectionValidationError('Cannot disconnect knowledge from itself');
        }

        try {
            await this.repository.removeConnection(sourceId, targetId);
        } catch (error) {
            if (error instanceof DomainError) {
                throw error;
            }
            throw new UseCaseExecutionError(
                `Failed to disconnect knowledge "${sourceId}" from "${targetId}"`,
                error instanceof Error ? error : new Error(String(error))
            );
        }
    }

    private validateInput(sourceId: string, targetIds: string[]): void {
        if (!sourceId || sourceId.trim().length === 0) {
            throw new UseCaseExecutionError('Source ID cannot be empty');
        }
        if (!targetIds || targetIds.length === 0) {
            throw new UseCaseExecutionError('Target IDs cannot be empty');
        }
        if (targetIds.some(id => !id || id.trim().length === 0)) {
            throw new UseCaseExecutionError('Target IDs cannot contain empty values');
        }
    }
}
