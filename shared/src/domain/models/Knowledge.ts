// Domain Model: Knowledge
import { KnowledgeValidationError } from '../errors/DomainError';

/**
 * ナレッジエンティティ
 * 不変性を保証するため、readonlyプロパティを使用
 */
export interface Knowledge {
    readonly id: string;
    readonly title: string;
    readonly content: string;
    readonly createdAt: Date;
    readonly connections: readonly string[]; // Array of connected knowledge IDs
}

/**
 * ナレッジ作成用の入力
 */
export interface CreateKnowledgeInput {
    title: string;
    content: string;
}

/**
 * 検索結果
 */
export interface SearchResult {
    knowledge: Knowledge;
    relevanceScore: number;
}

/**
 * ナレッジのバリデーション定数
 */
const KNOWLEDGE_CONSTRAINTS = {
    TITLE_MIN_LENGTH: 1,
    TITLE_MAX_LENGTH: 200,
    CONTENT_MIN_LENGTH: 1,
    CONTENT_MAX_LENGTH: 10000,
} as const;

/**
 * ナレッジのバリデーション
 */
export class KnowledgeValidator {
    static validateTitle(title: string): void {
        if (!title || title.trim().length === 0) {
            throw new KnowledgeValidationError('Title cannot be empty');
        }
        if (title.length < KNOWLEDGE_CONSTRAINTS.TITLE_MIN_LENGTH) {
            throw new KnowledgeValidationError(
                `Title must be at least ${KNOWLEDGE_CONSTRAINTS.TITLE_MIN_LENGTH} character(s)`
            );
        }
        if (title.length > KNOWLEDGE_CONSTRAINTS.TITLE_MAX_LENGTH) {
            throw new KnowledgeValidationError(
                `Title must be at most ${KNOWLEDGE_CONSTRAINTS.TITLE_MAX_LENGTH} characters`
            );
        }
    }

    static validateContent(content: string): void {
        if (!content || content.trim().length === 0) {
            throw new KnowledgeValidationError('Content cannot be empty');
        }
        if (content.length < KNOWLEDGE_CONSTRAINTS.CONTENT_MIN_LENGTH) {
            throw new KnowledgeValidationError(
                `Content must be at least ${KNOWLEDGE_CONSTRAINTS.CONTENT_MIN_LENGTH} character(s)`
            );
        }
        if (content.length > KNOWLEDGE_CONSTRAINTS.CONTENT_MAX_LENGTH) {
            throw new KnowledgeValidationError(
                `Content must be at most ${KNOWLEDGE_CONSTRAINTS.CONTENT_MAX_LENGTH} characters`
            );
        }
    }

    static validate(input: CreateKnowledgeInput): void {
        this.validateTitle(input.title);
        this.validateContent(input.content);
    }
}

/**
 * ナレッジのファクトリーメソッド
 * バリデーションを通過したナレッジのみを作成
 */
export class KnowledgeFactory {
    static create(input: CreateKnowledgeInput, id: string, createdAt: Date = new Date()): Knowledge {
        KnowledgeValidator.validate(input);

        return {
            id,
            title: input.title.trim(),
            content: input.content.trim(),
            createdAt,
            connections: [],
        };
    }

    static createFromExisting(knowledge: Knowledge, updates?: Partial<CreateKnowledgeInput>): Knowledge {
        const title = updates?.title ?? knowledge.title;
        const content = updates?.content ?? knowledge.content;

        if (updates) {
            KnowledgeValidator.validate({ title, content });
        }

        return {
            ...knowledge,
            title: title.trim(),
            content: content.trim(),
        };
    }
}
