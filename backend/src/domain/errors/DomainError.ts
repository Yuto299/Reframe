/**
 * ドメイン層のエラー基底クラス
 * ビジネスルール違反を表現する
 */
export abstract class DomainError extends Error {
    constructor(message: string, public readonly code: string) {
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

/**
 * ナレッジが見つからない場合のエラー
 */
export class KnowledgeNotFoundError extends DomainError {
    constructor(id: string) {
        super(`Knowledge with id "${id}" not found`, 'KNOWLEDGE_NOT_FOUND');
    }
}

/**
 * ナレッジのバリデーションエラー
 */
export class KnowledgeValidationError extends DomainError {
    constructor(message: string) {
        super(message, 'KNOWLEDGE_VALIDATION_ERROR');
    }
}

/**
 * 接続のバリデーションエラー
 */
export class ConnectionValidationError extends DomainError {
    constructor(message: string) {
        super(message, 'CONNECTION_VALIDATION_ERROR');
    }
}
