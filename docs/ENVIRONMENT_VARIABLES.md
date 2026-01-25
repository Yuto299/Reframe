# 環境変数設定ガイド

## 現在の状態

### データベースについて
現在、バックエンドは**モックデータ（MockKnowledgeRepository）**を使用しています。実際のPostgreSQLデータベースは使用していません。

- ✅ **開発段階では問題ありません**
- Docker ComposeでPostgreSQLコンテナは定義されていますが、バックエンドはまだ接続していません
- 将来的にPostgreSQLリポジトリを実装する際に、DIコンテナで切り替え可能な設計になっています

## 環境変数の設定

### 1. ローカル開発環境

プロジェクトルートの`.env`ファイルを編集してください：

```bash
# PostgreSQL Database Configuration（現在は未使用）
POSTGRES_DB=reframe
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
DATABASE_URL=postgresql://postgres:password@localhost:5432/reframe

# Application Ports
PORT=8080
NEXT_PUBLIC_API_URL=http://localhost:8080

# Node Environment
NODE_ENV=development

# ============================================
# Vertex AI Configuration（必須）
# ============================================
# GCPプロジェクトID（必須）
GOOGLE_CLOUD_PROJECT=your-project-id

# Vertex AIリージョン（オプション、デフォルト: asia-northeast1）
VERTEX_AI_LOCATION=asia-northeast1

# サービスアカウントキーのパス（ローカル開発時のみ必要）
# Cloud Runでデプロイする場合は、サービスアカウントの権限で自動認証されます
GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account-key.json
```

### 2. GCPプロジェクトの設定

#### 2.1 GCPプロジェクトIDの取得

```bash
# 現在のプロジェクトIDを確認
gcloud config get-value project

# プロジェクトIDを設定
gcloud config set project YOUR_PROJECT_ID
```

#### 2.2 Vertex AI APIの有効化

```bash
# Vertex AI APIを有効化
gcloud services enable aiplatform.googleapis.com

# 確認
gcloud services list --enabled | grep aiplatform
```

#### 2.3 サービスアカウントの作成と認証（ローカル開発時）

ローカル開発環境でVertex AIを使用する場合、サービスアカウントキーが必要です：

```bash
# サービスアカウントの作成（既に存在する場合はスキップ）
gcloud iam service-accounts create vertex-ai-service \
    --display-name="Vertex AI Service Account"

# 必要な権限を付与
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:vertex-ai-service@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"

# サービスアカウントキーのダウンロード
gcloud iam service-accounts keys create ./service-account-key.json \
    --iam-account=vertex-ai-service@YOUR_PROJECT_ID.iam.gserviceaccount.com

# .envファイルにパスを設定
# GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
```

**⚠️ セキュリティ注意事項**:
- `service-account-key.json`は`.gitignore`に追加してください
- このファイルをGitにコミットしないでください
- 本番環境では、Cloud Runのサービスアカウントを使用するため、このファイルは不要です

### 3. Cloud Run（本番環境）での設定

Cloud Runにデプロイする場合、環境変数は`gcloud run deploy`コマンドで設定します：

```bash
gcloud run deploy reframe-backend \
  --image YOUR_IMAGE_URL \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=your-project-id,VERTEX_AI_LOCATION=asia-northeast1,NODE_ENV=production,PORT=8080" \
  --service-account=vertex-ai-service@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

**重要**: Cloud Runでは、`GOOGLE_APPLICATION_CREDENTIALS`は設定不要です。サービスアカウントの権限で自動認証されます。

### 4. Docker Composeでの設定

Docker Composeを使用する場合、`.env`ファイルが自動的に読み込まれます：

```bash
# 開発環境
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# 本番環境
docker compose -f docker-compose.yml -f docker-compose.prod.yml up
```

バックエンドコンテナに環境変数を渡すには、`docker-compose.dev.yml`または`docker-compose.prod.yml`で設定します：

```yaml
services:
  backend:
    environment:
      - GOOGLE_CLOUD_PROJECT=${GOOGLE_CLOUD_PROJECT}
      - VERTEX_AI_LOCATION=${VERTEX_AI_LOCATION:-asia-northeast1}
      - GOOGLE_APPLICATION_CREDENTIALS=${GOOGLE_APPLICATION_CREDENTIALS}
```

### 5. 環境変数の確認

#### バックエンドで確認

```bash
# バックエンドディレクトリに移動
cd backend

# 環境変数を確認（Node.jsスクリプトで）
node -e "console.log('GOOGLE_CLOUD_PROJECT:', process.env.GOOGLE_CLOUD_PROJECT)"
```

#### Dockerコンテナ内で確認

```bash
# コンテナに入る
docker exec -it api_backend sh

# 環境変数を確認
env | grep GOOGLE
env | grep VERTEX
```

## トラブルシューティング

### エラー: "GOOGLE_CLOUD_PROJECT environment variable is required"

`.env`ファイルに`GOOGLE_CLOUD_PROJECT`が設定されていないか、読み込まれていません。

**解決方法**:
1. `.env`ファイルに`GOOGLE_CLOUD_PROJECT=your-project-id`を追加
2. Docker Composeを使用している場合、コンテナを再起動: `docker compose restart backend`

### エラー: "Could not load the default credentials"

ローカル開発環境でサービスアカウントキーが見つかりません。

**解決方法**:
1. サービスアカウントキーをダウンロード（上記の手順2.3を参照）
2. `.env`ファイルに`GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json`を設定
3. パスが正しいか確認（プロジェクトルートからの相対パス）

### エラー: "Permission denied" または "IAM permission error"

サービスアカウントに必要な権限がありません。

**解決方法**:
```bash
# Vertex AI Userロールを付与
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:YOUR_SERVICE_ACCOUNT@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"
```

## まとめ

### 必須の環境変数

| 変数名 | 説明 | ローカル | Cloud Run |
|--------|------|----------|-----------|
| `GOOGLE_CLOUD_PROJECT` | GCPプロジェクトID | ✅ 必須 | ✅ 必須 |
| `VERTEX_AI_LOCATION` | Vertex AIリージョン | ⚠️ オプション（デフォルト: asia-northeast1） | ⚠️ オプション |
| `GOOGLE_APPLICATION_CREDENTIALS` | サービスアカウントキーのパス | ✅ ローカル開発時のみ | ❌ 不要 |

### 現在のDB状態

- ✅ **モックデータで問題ありません**（開発段階）
- PostgreSQLコンテナは定義済みですが、バックエンドは未接続
- 将来的にPostgreSQLリポジトリを実装する際に切り替え可能
