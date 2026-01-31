/**
 * APIクライアント
 * openapi-fetchを使用した型安全なAPIクライアント
 */
import createClient from 'openapi-fetch';
import type { paths } from '../../../contracts/api';

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

export const apiClient = createClient<paths>({ baseUrl: API_BASE_URL });
