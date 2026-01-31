import { Pool } from "pg";
import { KnowledgeRepository } from "../../domain/repositories/KnowledgeRepository.js";
import { PostgreSQLKnowledgeRepository } from "../repositories/PostgreSQLKnowledgeRepository.js";
import { GetAllKnowledgeUseCase } from "../../application/usecases/GetAllKnowledgeUseCase.js";
import { GetKnowledgeByIdUseCase } from "../../application/usecases/GetKnowledgeByIdUseCase.js";
import { SearchKnowledgeUseCase } from "../../application/usecases/SearchKnowledgeUseCase.js";
import { CreateKnowledgeUseCase } from "../../application/usecases/CreateKnowledgeUseCase.js";
import { ConnectKnowledgeUseCase } from "../../application/usecases/ConnectKnowledgeUseCase.js";
import { SegmentTopicsUseCase } from "../../application/usecases/SegmentTopicsUseCase.js";
import { SearchRelatedKnowledgeUseCase } from "../../application/usecases/SearchRelatedKnowledgeUseCase.js";
import { VertexAIService } from "../services/VertexAIService.js";

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
 * DIコンテナ設定（テスト時のモック注入用）
 */
export interface ContainerConfig {
  knowledgeRepository?: KnowledgeRepository;
  vertexAIService?: VertexAIService;
}

/**
 * 純粋なDIコンテナファクトリー
 * データベース接続プールを受け取り、依存関係を注入する
 */
export function createContainer(
  pool: Pool,
  config?: Partial<ContainerConfig>,
): Container {
  // リポジトリの生成
  const repository =
    config?.knowledgeRepository ?? new PostgreSQLKnowledgeRepository(pool);

  // サービスの生成
  const vertexAIService = config?.vertexAIService ?? new VertexAIService();

  // ユースケースの生成と依存関係の注入
  return {
    getAllKnowledgeUseCase: new GetAllKnowledgeUseCase(repository),
    getKnowledgeByIdUseCase: new GetKnowledgeByIdUseCase(repository),
    searchKnowledgeUseCase: new SearchKnowledgeUseCase(repository),
    createKnowledgeUseCase: new CreateKnowledgeUseCase(repository),
    connectKnowledgeUseCase: new ConnectKnowledgeUseCase(repository),
    segmentTopicsUseCase: new SegmentTopicsUseCase(vertexAIService),
    searchRelatedKnowledgeUseCase: new SearchRelatedKnowledgeUseCase(
      repository,
      vertexAIService,
    ),
    vertexAIService,
  };
}
