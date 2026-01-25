import { KnowledgeRepository } from '../../domain/repositories/KnowledgeRepository.js';
import { MockKnowledgeRepository } from '../repositories/MockKnowledgeRepository.js';
import { GetAllKnowledgeUseCase } from '../../application/usecases/GetAllKnowledgeUseCase.js';
import { GetKnowledgeByIdUseCase } from '../../application/usecases/GetKnowledgeByIdUseCase.js';
import { SearchKnowledgeUseCase } from '../../application/usecases/SearchKnowledgeUseCase.js';
import { CreateKnowledgeUseCase } from '../../application/usecases/CreateKnowledgeUseCase.js';
import { ConnectKnowledgeUseCase } from '../../application/usecases/ConnectKnowledgeUseCase.js';

/**
 * DIコンテナの設定
 * テスト時にモックに差し替え可能にするため、ファクトリーパターンを使用
 */
export interface ContainerConfig {
    knowledgeRepository: KnowledgeRepository;
}

/**
 * デフォルトのリポジトリ実装を生成
 */
function createDefaultRepository(): KnowledgeRepository {
    return new MockKnowledgeRepository();
}

/**
 * DIコンテナファクトリー
 * テスト時にカスタムリポジトリを注入可能
 */
export function createContainer(config?: Partial<ContainerConfig>): Container {
    const repository = config?.knowledgeRepository ?? createDefaultRepository();

    return {
        getAllKnowledgeUseCase: new GetAllKnowledgeUseCase(repository),
        getKnowledgeByIdUseCase: new GetKnowledgeByIdUseCase(repository),
        searchKnowledgeUseCase: new SearchKnowledgeUseCase(repository),
        createKnowledgeUseCase: new CreateKnowledgeUseCase(repository),
        connectKnowledgeUseCase: new ConnectKnowledgeUseCase(repository),
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
}

/**
 * デフォルトのDIコンテナインスタンス
 * 本番環境では環境変数などで切り替え可能
 */
export const container: Container = createContainer();
