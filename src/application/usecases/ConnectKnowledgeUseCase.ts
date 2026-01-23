import { KnowledgeRepository } from '@/domain/repositories/KnowledgeRepository';

export class ConnectKnowledgeUseCase {
    constructor(private repository: KnowledgeRepository) { }

    async execute(sourceId: string, targetIds: string[]): Promise<void> {
        // Add connections to all selected knowledge items
        for (const targetId of targetIds) {
            await this.repository.addConnection(sourceId, targetId);
        }
    }

    async disconnect(sourceId: string, targetId: string): Promise<void> {
        await this.repository.removeConnection(sourceId, targetId);
    }
}
