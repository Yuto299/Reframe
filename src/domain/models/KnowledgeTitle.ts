import { KnowledgeValidationError } from '../errors/DomainError';

/**
 * ナレッジタイトルの値オブジェクト
 * ビジネスルールをカプセル化
 */
export class KnowledgeTitle {
    private static readonly MAX_DISPLAY_LENGTH = 50;

    private constructor(private readonly value: string) {}

    static create(fullTitle: string): KnowledgeTitle {
        if (!fullTitle || fullTitle.trim().length === 0) {
            throw new KnowledgeValidationError('Title cannot be empty');
        }
        return new KnowledgeTitle(fullTitle.trim());
    }

    /**
     * 表示用の短縮タイトルを取得
     */
    getDisplayTitle(): string {
        if (this.value.length <= KnowledgeTitle.MAX_DISPLAY_LENGTH) {
            return this.value;
        }
        return this.value.slice(0, KnowledgeTitle.MAX_DISPLAY_LENGTH) + '...';
    }

    /**
     * 完全なタイトルを取得
     */
    getFullTitle(): string {
        return this.value;
    }

    /**
     * タイトルが短縮されているかどうか
     */
    isTruncated(): boolean {
        return this.value.length > KnowledgeTitle.MAX_DISPLAY_LENGTH;
    }
}
