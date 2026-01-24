/**
 * アプリケーション層のエラー基底クラス
 * ユースケース実行時のエラーを表現する
 */
export abstract class ApplicationError extends Error {
    constructor(message: string, public readonly code: string, public readonly cause?: Error) {
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

/**
 * ユースケース実行時のエラー
 */
export class UseCaseExecutionError extends ApplicationError {
    constructor(message: string, cause?: Error) {
        super(message, 'USE_CASE_EXECUTION_ERROR', cause);
    }
}
