/**
 * APIクライアント
 * バックエンドAPIとの通信を担当
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

if (typeof window === 'undefined' && !API_BASE_URL) {
    console.warn('NEXT_PUBLIC_API_URL is not set. Using default: http://localhost:8080');
}

export class ApiError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly status: number
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({
            error: {
                code: 'UNKNOWN_ERROR',
                message: response.statusText,
            },
        }));

        throw new ApiError(
            errorData.error?.message || 'An error occurred',
            errorData.error?.code || 'UNKNOWN_ERROR',
            response.status
        );
    }

    // 204 No Contentの場合は空のレスポンス
    if (response.status === 204) {
        return undefined as T;
    }

    // Content-Typeがapplication/jsonでない場合も空を返す
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        return undefined as T;
    }

    const data = await response.json();
    return data.data as T;
}

export const apiClient = {
    async get<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return handleResponse<T>(response);
    },

    async post<T>(endpoint: string, body?: unknown): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        return handleResponse<T>(response);
    },
};
