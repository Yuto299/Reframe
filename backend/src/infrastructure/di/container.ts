import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'node:fs';
import { KnowledgeRepository } from '@/domain/repositories/KnowledgeRepository';
import { PostgreSQLKnowledgeRepository } from '../repositories/PostgreSQLKnowledgeRepository.js';
import { createDatabasePool } from '../database/pool.js';
import { migrateDatabase } from '../database/migrate.js';
import { GetAllKnowledgeUseCase } from '../../application/usecases/GetAllKnowledgeUseCase.js';
import { GetKnowledgeByIdUseCase } from '../../application/usecases/GetKnowledgeByIdUseCase.js';
import { SearchKnowledgeUseCase } from '../../application/usecases/SearchKnowledgeUseCase.js';
import { CreateKnowledgeUseCase } from '../../application/usecases/CreateKnowledgeUseCase.js';
import { ConnectKnowledgeUseCase } from '../../application/usecases/ConnectKnowledgeUseCase.js';
import { SegmentTopicsUseCase } from '../../application/usecases/SegmentTopicsUseCase.js';
import { SearchRelatedKnowledgeUseCase } from '../../application/usecases/SearchRelatedKnowledgeUseCase.js';
import { VertexAIService } from '../services/VertexAIService.js';

// .envファイルを読み込む
// Dockerコンテナ内では /app/.env、ローカルでは ../.env を試す
const envPaths = [
    resolve(process.cwd(), '.env'), // Dockerコンテナ内
    resolve(process.cwd(), '../.env'), // ローカル開発
];

for (const envPath of envPaths) {
    if (existsSync(envPath)) {
        config({ path: envPath });
        break;
    }
}

/**
 * DIコンテナの設定
 * テスト時にモックに差し替え可能にするため、ファクトリーパターンを使用
 */
export interface ContainerConfig {
    knowledgeRepository?: KnowledgeRepository;
    vertexAIService?: VertexAIService;
}

// データベース接続プール（シングルトン）
let databasePool: ReturnType<typeof createDatabasePool> | null = null;

/**
 * データベース接続プールを初期化
 */
async function initializeDatabase(): Promise<void> {
    if (!databasePool) {
        databasePool = createDatabasePool();
        
        // マイグレーションを実行
        try {
            await migrateDatabase(databasePool);
        } catch (error) {
            console.error('Database migration failed:', error);
            throw error;
        }
    }
}

/**
 * デフォルトのリポジトリ実装を生成
 */
function createDefaultRepository(): KnowledgeRepository {
    if (!databasePool) {
        throw new Error('Database pool not initialized. Call initializeDatabase() first.');
    }
    return new PostgreSQLKnowledgeRepository(databasePool);
}

/**
 * デフォルトのVertex AIサービスを生成
 */
function createDefaultVertexAIService(): VertexAIService {
    return new VertexAIService();
}

/**
 * DIコンテナファクトリー
 * テスト時にカスタムリポジトリを注入可能
 */
export function createContainer(config?: Partial<ContainerConfig>): Container {
    const repository = config?.knowledgeRepository ?? createDefaultRepository();
    const vertexAIService = config?.vertexAIService ?? createDefaultVertexAIService();

    return {
        getAllKnowledgeUseCase: new GetAllKnowledgeUseCase(repository),
        getKnowledgeByIdUseCase: new GetKnowledgeByIdUseCase(repository),
        searchKnowledgeUseCase: new SearchKnowledgeUseCase(repository),
        createKnowledgeUseCase: new CreateKnowledgeUseCase(repository),
        connectKnowledgeUseCase: new ConnectKnowledgeUseCase(repository),
        segmentTopicsUseCase: new SegmentTopicsUseCase(vertexAIService),
        searchRelatedKnowledgeUseCase: new SearchRelatedKnowledgeUseCase(repository, vertexAIService),
        vertexAIService,
    };
}

/**
 * データベースを初期化してからコンテナを作成
 */
export async function createContainerWithDatabase(config?: Partial<ContainerConfig>): Promise<Container> {
    await initializeDatabase();
    return createContainer(config);
}

/**
 * DIコンテナの型定義
 */
export interface Container {
    getAllKnowledgeUseCase: GetAllKnowledgeUseCase;
    getKnowledgeByIdUseCase: GetKnowledgeByIdUseCase;
    searchKnowledgeUseCase: SearchKnowledgeUseCase;
    createKnowledgeUseCase: CreateKnowledgeUseCase;
    connectKnowledgeUseCase: ConnectKnowledgeUseCase;
    segmentTopicsUseCase: SegmentTopicsUseCase;
    searchRelatedKnowledgeUseCase: SearchRelatedKnowledgeUseCase;
    vertexAIService: VertexAIService;
}

/**
 * デフォルトのDIコンテナインスタンス
 * データベース初期化後に作成される
 */
let containerInstance: Container | null = null;

/**
 * コンテナインスタンスを取得（データベース初期化後）
 */
export function getContainer(): Container {
    if (!containerInstance) {
        throw new Error('Container not initialized. Call initializeContainer() first.');
    }
    return containerInstance;
}

/**
 * コンテナを初期化（データベース初期化を含む）
 */
export async function initializeContainer(config?: Partial<ContainerConfig>): Promise<void> {
    if (!containerInstance) {
        containerInstance = await createContainerWithDatabase(config);
    }
}
