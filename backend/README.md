# Reframe Backend

Cloud RunでデプロイするバックエンドAPIサーバー。

## セットアップ

```bash
npm install
```

## 開発

```bash
npm run dev
```

サーバーは `http://localhost:8080` で起動します。

## ビルド

```bash
npm run build
```

## Cloud Runへのデプロイ

```bash
# イメージをビルド
docker build -t gcr.io/YOUR_PROJECT_ID/reframe-backend .

# イメージをプッシュ
docker push gcr.io/YOUR_PROJECT_ID/reframe-backend

# Cloud Runにデプロイ
gcloud run deploy reframe-backend \
  --image gcr.io/YOUR_PROJECT_ID/reframe-backend \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --port 8080
```

## 環境変数

- `PORT`: サーバーポート（デフォルト: 8080）
- `NODE_ENV`: 環境（development/production）
- `DATABASE_URL`: PostgreSQL接続URL（本番環境）
