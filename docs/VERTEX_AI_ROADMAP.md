# Vertex AI統合機能 実装ロードマップ

## 実装フェーズ

### Phase 1: 基本機能（トピック分割）✅ 完了
**目標**: テキストをVertex AIで分割し、結果を表示する

#### バックエンド
1. ✅ Vertex AIサービスの実装（Infrastructure層）
   - `backend/src/infrastructure/services/VertexAIService.ts`
   - Generative AI APIクライアント（gemini-pro）
   - 環境変数設定

2. ✅ トピック分割ユースケースの実装（Application層）
   - `backend/src/application/usecases/SegmentTopicsUseCase.ts`
   - 入力テキストをトピックに分割するロジック

3. ✅ Analyze Topics APIエンドポイントの実装（API層）
   - `backend/src/api/routes/knowledge.ts`に追加
   - POST `/api/knowledge/analyze-topics`

4. ✅ APIスキーマ定義（Zod）
   - `backend/src/api/schemas/knowledge.ts`に追加
   - `AnalyzeTopicsRequestSchema`, `AnalyzeTopicsResponseSchema`

5. ✅ DIコンテナにSegmentTopicsUseCaseを追加
   - `backend/src/infrastructure/di/container.ts`を更新

#### フロントエンド
6. ✅ フロントエンドAPIクライアント
   - `frontend/src/lib/api/knowledge.ts`に`analyzeTopics`関数を追加

7. ✅ フロントエンドUI - 「Analyze Topics」ボタン
   - `frontend/src/presentation/components/search/KnowledgeInput.tsx`を更新

8. ✅ フロントエンドUI - トピック分割結果の表示
   - `frontend/src/app/search/page.tsx`を更新
   - 既存の`SearchResults`コンポーネントを再利用

---

### Phase 2: 関連ナレッジ検索
**目標**: Embeddings APIを使用して既存ナレッジとの関連性を検索

#### バックエンド
1. ✅ Embeddings APIサービスの実装（Infrastructure層）
   - `backend/src/infrastructure/services/VertexAIService.ts`に追加
   - Embeddings APIクライアント（textembedding-gecko@003）

2. ✅ 関連ナレッジ検索ユースケースの実装（Application層）
   - `backend/src/application/usecases/SearchRelatedKnowledgeUseCase.ts`
   - コサイン類似度による関連度スコア計算

3. ✅ Analyze Topics APIにEmbeddings検索を統合
   - 各トピックに対して関連ナレッジを検索
   - レスポンスに`relatedKnowledge`を追加

4. ⏳ 既存ナレッジの埋め込みベクトル生成・保存機能（将来の最適化用）
   - 現時点では、検索時に都度生成（パフォーマンス最適化は後回し）

---

### Phase 3: 接続・作成機能 ✅ 完了
**目標**: 選択されたトピックをナレッジとして作成・接続

#### バックエンド
1. ✅ Connect Topics APIエンドポイントの実装（API層）
   - `backend/src/api/routes/knowledge.ts`に追加
   - POST `/api/knowledge/connect-topics`

2. ✅ Connect Topics APIスキーマ定義（Zod）
   - `backend/src/api/schemas/knowledge.ts`に追加
   - `ConnectTopicsRequestSchema`

3. ✅ ナレッジ作成・接続ロジックの実装
   - 既存の`CreateKnowledgeUseCase`と`ConnectKnowledgeUseCase`を活用
   - 関連度スコアが閾値（70以上）を超える場合のみ接続

#### フロントエンド
4. ✅ フロントエンドAPIクライアント
   - `frontend/src/lib/api/knowledge.ts`に`connectTopics`関数を追加

5. ✅ フロントエンドUI - 「Connect Topics」ボタン
   - `frontend/src/app/search/page.tsx`を更新

6. ✅ フロントエンドUI - /graphページへの自動遷移
   - `useRouter`を使用して処理完了後に自動遷移

---

## 共通タスク

### 環境変数設定
- ✅ `GOOGLE_CLOUD_PROJECT`: GCPプロジェクトID
- ✅ `VERTEX_AI_LOCATION`: リージョン（デフォルト: `asia-northeast1`）
- ✅ `GOOGLE_APPLICATION_CREDENTIALS`: サービスアカウントキーのパス（ローカル開発時）

### エラーハンドリング
- ✅ Vertex AI API呼び出しエラー
- ✅ ネットワークエラー
- ✅ バリデーションエラー

---

## 実装順序

1. **Phase 1**を完全に実装（トピック分割機能）
2. **Phase 2**を実装（関連ナレッジ検索）
3. **Phase 3**を実装（接続・作成機能）

各フェーズは独立して動作するように実装し、段階的に機能を追加していきます。
