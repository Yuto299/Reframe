# デプロイガイド

## 1. デプロイ環境

### 1.1 対応プラットフォーム

- **Google Cloud Run**: 推奨（本番環境）
- **Docker**: ローカル開発環境
- **Vercel**: フロントエンドのみ（将来対応予定）

### 1.2 必要なサービス

- **Cloud Run**: フロントエンドとバックエンドのホスティング
- **Cloud SQL**: PostgreSQLデータベース
- **Artifact Registry**: Dockerイメージの保存
- **Cloud Build**: CI/CD（オプション）

## 2. 事前準備

### 2.1 GCPプロジェクトのセットアップ

```bash
# GCPプロジェクトIDを設定
export GCP_PROJECT_ID="your-project-id"
gcloud config set project $GCP_PROJECT_ID

# 必要なAPIを有効化
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 2.2 Artifact Registryのセットアップ

```bash
# リポジトリの作成
gcloud artifacts repositories create reframe-repo \
  --repository-format=docker \
  --location=asia-northeast1 \
  --description="Reframe application images"

# 認証設定
gcloud auth configure-docker asia-northeast1-docker.pkg.dev
```

### 2.3 Cloud SQLのセットアップ

```bash
# Cloud SQLインスタンスの作成
gcloud sql instances create reframe-db \
  --database-version=POSTGRES_16 \
  --tier=db-f1-micro \
  --region=asia-northeast1 \
  --root-password=YOUR_ROOT_PASSWORD

# データベースの作成
gcloud sql databases create reframe_db --instance=reframe-db

# ユーザーの作成
gcloud sql users create reframe_user \
  --instance=reframe-db \
  --password=YOUR_PASSWORD
```

## 3. バックエンドのデプロイ

### 3.1 イメージのビルドとプッシュ

```bash
# プロジェクトルートで実行
cd /path/to/Reframe

# イメージのビルド
docker build -f backend/Dockerfile \
  -t asia-northeast1-docker.pkg.dev/$GCP_PROJECT_ID/reframe-repo/backend:latest .

# イメージのプッシュ
docker push asia-northeast1-docker.pkg.dev/$GCP_PROJECT_ID/reframe-repo/backend:latest
```

### 3.2 Cloud Runへのデプロイ

```bash
# 環境変数の設定
export DB_PASSWORD="your-db-password"
export DATABASE_URL="postgresql://reframe_user:${DB_PASSWORD}@/reframe_db?host=/cloudsql/$GCP_PROJECT_ID:asia-northeast1:reframe-db"

# Cloud Runにデプロイ
gcloud run deploy reframe-backend \
  --image asia-northeast1-docker.pkg.dev/$GCP_PROJECT_ID/reframe-repo/backend:latest \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,PORT=8080" \
  --add-cloudsql-instances $GCP_PROJECT_ID:asia-northeast1:reframe-db \
  --set-env-vars "DATABASE_URL=${DATABASE_URL}" \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

### 3.3 バックエンドURLの取得

```bash
BACKEND_URL=$(gcloud run services describe reframe-backend \
  --region=asia-northeast1 \
  --format='value(status.url)')

echo $BACKEND_URL
```

## 4. フロントエンドのデプロイ

### 4.1 イメージのビルドとプッシュ

```bash
# イメージのビルド（バックエンドURLを環境変数として設定）
docker build -f frontend/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=$BACKEND_URL \
  -t asia-northeast1-docker.pkg.dev/$GCP_PROJECT_ID/reframe-repo/frontend:latest .

# イメージのプッシュ
docker push asia-northeast1-docker.pkg.dev/$GCP_PROJECT_ID/reframe-repo/frontend:latest
```

### 4.2 Cloud Runへのデプロイ

```bash
gcloud run deploy reframe-frontend \
  --image asia-northeast1-docker.pkg.dev/$GCP_PROJECT_ID/reframe-repo/frontend:latest \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,PORT=3000,NEXT_PUBLIC_API_URL=$BACKEND_URL" \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

### 4.3 フロントエンドURLの取得

```bash
FRONTEND_URL=$(gcloud run services describe reframe-frontend \
  --region=asia-northeast1 \
  --format='value(status.url)')

echo $FRONTEND_URL
```

## 5. デプロイスクリプト

### 5.1 バックエンドデプロイスクリプト

`scripts/deploy-backend.sh`を作成:

```bash
#!/bin/bash
set -e

source .env.production

GCP_PROJECT_ID=${GCP_PROJECT_ID:-"your-project-id"}
REGION=${GCP_REGION:-"asia-northeast1"}
IMAGE_NAME="asia-northeast1-docker.pkg.dev/$GCP_PROJECT_ID/reframe-repo/backend:latest"

echo "Building backend image..."
docker build -f backend/Dockerfile -t $IMAGE_NAME .

echo "Pushing image to Artifact Registry..."
docker push $IMAGE_NAME

echo "Deploying to Cloud Run..."
gcloud run deploy reframe-backend \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,PORT=8080" \
  --add-cloudsql-instances $GCP_PROJECT_ID:$REGION:reframe-db \
  --set-env-vars "DATABASE_URL=postgresql://reframe_user:${DB_PASSWORD}@/reframe_db?host=/cloudsql/$GCP_PROJECT_ID:$REGION:reframe-db" \
  --memory 512Mi \
  --cpu 1

echo "Backend deployed successfully!"
```

### 5.2 フロントエンドデプロイスクリプト

`scripts/deploy-frontend.sh`を作成:

```bash
#!/bin/bash
set -e

source .env.production

GCP_PROJECT_ID=${GCP_PROJECT_ID:-"your-project-id"}
REGION=${GCP_REGION:-"asia-northeast1"}
IMAGE_NAME="asia-northeast1-docker.pkg.dev/$GCP_PROJECT_ID/reframe-repo/frontend:latest"

# バックエンドのURLを取得
BACKEND_URL=$(gcloud run services describe reframe-backend \
  --region=$REGION \
  --format='value(status.url)')

echo "Building frontend image..."
docker build -f frontend/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=$BACKEND_URL \
  -t $IMAGE_NAME .

echo "Pushing image to Artifact Registry..."
docker push $IMAGE_NAME

echo "Deploying to Cloud Run..."
gcloud run deploy reframe-frontend \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,PORT=3000,NEXT_PUBLIC_API_URL=$BACKEND_URL" \
  --memory 512Mi \
  --cpu 1

echo "Frontend deployed successfully!"
FRONTEND_URL=$(gcloud run services describe reframe-frontend \
  --region=$REGION \
  --format='value(status.url)')
echo "Frontend URL: $FRONTEND_URL"
```

### 5.3 スクリプトの実行

```bash
# 実行権限を付与
chmod +x scripts/deploy-backend.sh scripts/deploy-frontend.sh

# バックエンドをデプロイ
./scripts/deploy-backend.sh

# フロントエンドをデプロイ
./scripts/deploy-frontend.sh
```

## 6. 環境変数

### 6.1 本番環境変数ファイル

`.env.production`を作成:

```bash
# GCP設定
GCP_PROJECT_ID=your-project-id
GCP_REGION=asia-northeast1

# データベース設定
DB_PASSWORD=your-secure-password
DATABASE_URL=postgresql://reframe_user:your-secure-password@/reframe_db?host=/cloudsql/your-project-id:asia-northeast1:reframe-db
```

### 6.2 環境変数の管理

- **機密情報**: Secret Managerを使用（推奨）
- **一般設定**: Cloud Runの環境変数として設定

## 7. CI/CD（Cloud Build）

### 7.1 Cloud Build設定

`cloudbuild.yaml`を作成:

```yaml
steps:
  # バックエンドのビルドとプッシュ
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-f', 'backend/Dockerfile', '-t', 'asia-northeast1-docker.pkg.dev/$PROJECT_ID/reframe-repo/backend:$SHORT_SHA', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'asia-northeast1-docker.pkg.dev/$PROJECT_ID/reframe-repo/backend:$SHORT_SHA']
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'reframe-backend'
      - '--image'
      - 'asia-northeast1-docker.pkg.dev/$PROJECT_ID/reframe-repo/backend:$SHORT_SHA'
      - '--region'
      - 'asia-northeast1'
      - '--platform'
      - 'managed'
images:
  - 'asia-northeast1-docker.pkg.dev/$PROJECT_ID/reframe-repo/backend:$SHORT_SHA'
```

### 7.2 GitHub Actionsとの連携

`.github/workflows/deploy.yml`を作成（将来実装予定）

## 8. デプロイ後の確認

### 8.1 サービスの状態確認

```bash
# サービスの一覧
gcloud run services list --region=asia-northeast1

# 特定のサービスの詳細
gcloud run services describe reframe-backend --region=asia-northeast1
gcloud run services describe reframe-frontend --region=asia-northeast1
```

### 8.2 ログの確認

```bash
# バックエンドのログ
gcloud run services logs read reframe-backend --region=asia-northeast1

# フロントエンドのログ
gcloud run services logs read reframe-frontend --region=asia-northeast1

# リアルタイムログ
gcloud run services logs tail reframe-backend --region=asia-northeast1
```

### 8.3 動作確認

```bash
# バックエンドのヘルスチェック
curl $BACKEND_URL/api/knowledge

# フロントエンドのアクセス
open $FRONTEND_URL
```

## 9. ロールバック

### 9.1 以前のリビジョンに戻す

```bash
# リビジョンの一覧
gcloud run revisions list --service=reframe-backend --region=asia-northeast1

# 特定のリビジョンにトラフィックを100%割り当て
gcloud run services update-traffic reframe-backend \
  --to-revisions=REVISION_NAME=100 \
  --region=asia-northeast1
```

## 10. モニタリング

### 10.1 Cloud Monitoring

- **メトリクス**: リクエスト数、レイテンシ、エラー率
- **アラート**: エラー率が閾値を超えた場合に通知

### 10.2 ログ分析

- **Cloud Logging**: 構造化ログの分析
- **エラー追跡**: エラーログの集計と分析

## 11. トラブルシューティング

### 11.1 よくある問題

#### デプロイが失敗する
```bash
# ログを確認
gcloud run services logs read reframe-backend --region=asia-northeast1 --limit=50

# イメージが正しくビルドされているか確認
docker images | grep reframe
```

#### データベース接続エラー
```bash
# Cloud SQLインスタンスの状態確認
gcloud sql instances describe reframe-db

# 接続テスト
gcloud sql connect reframe-db --user=reframe_user
```

#### メモリ不足エラー
```bash
# メモリを増やす
gcloud run services update reframe-backend \
  --memory 1Gi \
  --region=asia-northeast1
```

## 12. コスト最適化

### 12.1 Cloud Run

- **最小インスタンス数**: 0に設定（コスト削減）
- **最大インスタンス数**: 必要に応じて調整
- **CPU**: リクエスト時のみ課金

### 12.2 Cloud SQL

- **インスタンスサイズ**: 使用量に応じて調整
- **自動停止**: 開発環境では可能

## 13. セキュリティ

### 13.1 認証

- **Cloud Run**: 認証が必要な場合は`--no-allow-unauthenticated`を設定
- **IAM**: 適切な権限を設定

### 13.2 ネットワーク

- **VPC**: 必要に応じてVPC接続を設定
- **Cloud SQL**: プライベートIPを使用

## 14. 参考資料

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Artifact Registry Documentation](https://cloud.google.com/artifact-registry/docs)
