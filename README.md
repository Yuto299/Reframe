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

# または
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

- フロントエンド: http://localhost:3000
- バックエンド: http://localhost:8080
- PostgreSQL: localhost:5432

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
