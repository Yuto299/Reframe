# Reframe - Knowledge Network

知識をつなげて可視化するアプリケーション。

## プロジェクト構成

このプロジェクトは2つの独立したプロジェクトで構成されています：

- **frontend/**: Next.jsアプリケーション（Firebase Hostingでデプロイ）
- **backend/**: Hono APIサーバー（Cloud Runでデプロイ）

## 開発環境

### ローカル開発（Docker Compose使用）

```bash
# 開発環境を起動
npm run docker:dev

# ビルドして起動
npm run docker:dev:build

# 停止
npm run docker:dev:down

# または直接コマンド実行
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

起動後、以下のURLにアクセス可能：
- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8080/api/knowledge
- **Swagger UI**: http://localhost:8080/api/ui（APIドキュメントとテスト）
- **OpenAPI仕様書**: http://localhost:8080/api/doc
- **ヘルスチェック**: http://localhost:8080/health
- **PostgreSQL**: localhost:5432

### 本番環境（Docker Compose使用）

```bash
# 本番環境を起動（バックグラウンド）
npm run docker:prod:up

# ビルドして起動
npm run docker:prod:build

# 停止
npm run docker:prod:down
```

本番環境では、事前ビルド済みのイメージを使用し、最適化された本番用設定で動作します。

### 個別に開発

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Backend

```bash
cd backend
npm install
npm run dev
```

## APIドキュメント

バックエンドAPIはOpenAPI仕様に準拠しており、Swagger UIで確認・テストできます。

### 開発環境でのアクセス

開発サーバー起動後、以下のURLにアクセス：

- **Swagger UI**: http://localhost:8080/api/ui
  - ブラウザでAPIエンドポイントを確認・テストできます
- **OpenAPI仕様書**: http://localhost:8080/api/doc
  - OpenAPI 3.0形式のJSON仕様書

### 利用可能なエンドポイント

- `GET /api/knowledge` - 全ナレッジ取得
- `GET /api/knowledge/:id` - IDでナレッジ取得
- `POST /api/knowledge/search` - ナレッジ検索
- `POST /api/knowledge` - ナレッジ作成
- `POST /api/knowledge/:id/connect` - ナレッジ接続

詳細なAPI仕様はSwagger UIで確認してください。

## デプロイ

### Frontend (Firebase Hosting)

```bash
cd frontend
npm run build
firebase deploy --only hosting
```

### Backend (Cloud Run)

```bash
cd backend
docker build -t gcr.io/YOUR_PROJECT_ID/reframe-backend .
docker push gcr.io/YOUR_PROJECT_ID/reframe-backend
gcloud run deploy reframe-backend --image gcr.io/YOUR_PROJECT_ID/reframe-backend --region asia-northeast1
```

詳細は各プロジェクトのREADMEを参照してください。
