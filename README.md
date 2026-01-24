# Reframe - Knowledge Network

知識をつなげて可視化するアプリケーション。

## 📚 アーキテクチャ

このプロジェクトは**クリーンアーキテクチャ（ヘキサゴナルアーキテクチャ）**の原則に基づいて設計されています。

詳細は [アーキテクチャドキュメント](./docs/ARCHITECTURE.md) を参照してください。

## 🏗️ プロジェクト構成

このプロジェクトはモノレポ構成で、以下の3つのパッケージで構成されています：

- **frontend**: Next.jsアプリケーション（フロントエンド）
- **backend**: Hono APIサーバー（バックエンド）
- **shared**: 共有コード（ドメイン層）

## 🚀 セットアップ

### 依存関係のインストール

```bash
npm install
```

### ローカル開発

#### 方法1: docker-composeを使用

```bash
docker-compose up -d
```

- フロントエンド: http://localhost:3000
- バックエンド: http://localhost:8080

#### 方法2: npm workspacesを使用

```bash
# フロントエンド（別ターミナル）
npm run dev:frontend

# バックエンド（別ターミナル）
npm run dev:backend
```

### ビルド

```bash
# すべてのパッケージをビルド
npm run build

# 個別にビルド
npm run build:frontend
npm run build:backend
```

## 🐳 Docker

### ローカル開発

```bash
docker-compose up
```

### 本番ビルド

```bash
# バックエンド
docker build -f backend/Dockerfile -t reframe-backend .

# フロントエンド
docker build -f frontend/Dockerfile -t reframe-frontend .
```

## ☁️ Cloud Runへのデプロイ

### バックエンドのデプロイ

```bash
gcloud run deploy backend-api \
  --source ./backend \
  --platform managed \
  --region asia-northeast1 \
  --port 8080
```

### フロントエンドのデプロイ

```bash
# バックエンドのURLを取得
BACKEND_URL=$(gcloud run services describe backend-api --region asia-northeast1 --format 'value(status.url)')

# フロントエンドをデプロイ（環境変数にバックエンドURLを設定）
gcloud run deploy frontend-app \
  --source ./frontend \
  --platform managed \
  --region asia-northeast1 \
  --port 3000 \
  --set-env-vars NEXT_PUBLIC_API_URL=$BACKEND_URL
```

## 📚 ドキュメント

プロジェクトの詳細なドキュメントは `docs/` ディレクトリにあります：

- [要件定義書](./docs/REQUIREMENTS.md) - プロジェクトの要件と仕様
- [機能仕様書](./docs/FEATURES.md) - 各機能の詳細仕様
- [API仕様書](./docs/API.md) - RESTful APIの詳細仕様
- [アーキテクチャドキュメント](./docs/ARCHITECTURE.md) - システムアーキテクチャの説明
- [開発ガイドライン](./docs/DEVELOPMENT.md) - 開発環境のセットアップとコーディング規約
- [デプロイガイド](./docs/DEPLOYMENT.md) - GCPへのデプロイ手順

## 📖 参考資料

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Google Cloud Run](https://cloud.google.com/run/docs)
