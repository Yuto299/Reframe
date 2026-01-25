import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'node:fs';
import { KnowledgeRepository } from '@/domain/repositories/KnowledgeRepository';
import { MockKnowledgeRepository } from '../repositories/MockKnowledgeRepository.js';
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

/**
 * デフォルトのリポジトリ実装を生成
 */
function createDefaultRepository(): KnowledgeRepository {
    return new MockKnowledgeRepository();
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
    };
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
}

/**
 * デフォルトのDIコンテナインスタンス
 * 本番環境では環境変数などで切り替え可能
 */
export const container: Container = createContainer();
