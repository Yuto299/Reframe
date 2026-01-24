import { KnowledgeRepository } from '@/domain/repositories/KnowledgeRepository';
import { Knowledge, CreateKnowledgeInput, KnowledgeFactory } from '@/domain/models/Knowledge';
import { UseCaseExecutionError } from '../errors/ApplicationError';
import { DomainError } from '@/domain/errors/DomainError';

export class CreateKnowledgeUseCase {
    constructor(private repository: KnowledgeRepository) {}

    async execute(input: CreateKnowledgeInput): Promise<Knowledge> {
        try {
            // ドメインバリデーション（KnowledgeFactory内で実行される）
            const knowledge = KnowledgeFactory.create(input, this.generateId());
            
            // リポジトリに保存
            return await this.repository.create({
                title: knowledge.title,
                content: knowledge.content,
            });
        } catch (error) {
            if (error instanceof DomainError) {
                throw error;
            }
            throw new UseCaseExecutionError(
                'Failed to create knowledge',
                error instanceof Error ? error : new Error(String(error))
            );
        }
    }

    private generateId(): string {
        // 実際の実装では、リポジトリやIDジェネレーターから取得
        // ここでは簡易実装
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
}
