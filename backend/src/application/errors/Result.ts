/**
 * Result型: エラーハンドリングのための関数型パターン
 * 成功時は値を持ち、失敗時はエラーを持つ
 */
export type Result<T, E = Error> = 
    | { success: true; value: T }
    | { success: false; error: E };

/**
 * Result型のヘルパー関数
 */
export const Result = {
    ok: <T>(value: T): Result<T, never> => ({ success: true, value }),
    error: <E>(error: E): Result<never, E> => ({ success: false, error }),
    
    isOk: <T, E>(result: Result<T, E>): result is { success: true; value: T } => {
        return result.success === true;
    },
    
    isError: <T, E>(result: Result<T, E>): result is { success: false; error: E } => {
        return result.success === false;
    },
    
    map: <T, U, E>(
        result: Result<T, E>,
        fn: (value: T) => U
    ): Result<U, E> => {
        if (result.success) {
            return Result.ok(fn(result.value));
        }
        return result;
    },
    
    mapError: <T, E, F>(
        result: Result<T, E>,
        fn: (error: E) => F
    ): Result<T, F> => {
        if (!result.success) {
            return Result.error(fn(result.error));
        }
        return result;
    },
};
