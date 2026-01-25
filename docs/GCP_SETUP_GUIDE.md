# GCPセットアップガイド（初心者向け）

このガイドでは、Google Cloud Platform（GCP）を初めて使う方向けに、プロジェクトの作成から環境変数の設定まで詳しく説明します。

## 目次

1. [GCPアカウントの作成](#1-gcpアカウントの作成)
2. [プロジェクトの作成](#2-プロジェクトの作成)
3. [gcloud CLIのインストール](#3-gcloud-cliのインストール)
4. [認証の設定](#4-認証の設定)
5. [プロジェクトIDの確認と設定](#5-プロジェクトidの確認と設定)
6. [Vertex AI APIの有効化](#6-vertex-ai-apiの有効化)

---

## 1. GCPアカウントの作成

### 1.1 Google Cloud Platformにアクセス

1. ブラウザで [Google Cloud Platform](https://cloud.google.com/) にアクセス
2. 右上の「無料で始める」または「コンソールに移動」をクリック

### 1.2 Googleアカウントでログイン

- Googleアカウント（Gmailアカウント）でログインします
- 初回の場合、利用規約に同意する必要があります

### 1.3 無料トライアルの開始（オプション）

- 初回利用時、$300の無料クレジットが提供されます（12ヶ月間有効）
- クレジットカード情報の入力が必要ですが、無料枠内であれば課金されません
- Vertex AIの一部機能は無料枠内で利用可能です

---

## 2. プロジェクトの作成

### 2.1 プロジェクト作成ページにアクセス

1. GCPコンソールの左上にある「プロジェクトを選択」をクリック
2. 「新しいプロジェクト」をクリック

### 2.2 プロジェクト情報の入力

以下の情報を入力します：

- **プロジェクト名**: `Reframe` など、わかりやすい名前
- **プロジェクトID**: 自動生成されますが、変更可能です
  - 例: `reframe-project-123456`
  - 注意: プロジェクトIDは世界中で一意である必要があります
  - 小文字、数字、ハイフンのみ使用可能
- **組織**: 個人利用の場合は「組織なし」でOK

### 2.3 プロジェクトの作成

1. 「作成」ボタンをクリック
2. 数秒〜1分程度でプロジェクトが作成されます
3. 作成が完了すると、自動的にそのプロジェクトが選択されます

### 2.4 プロジェクトIDの確認

プロジェクトが作成されたら、プロジェクトIDを確認します：

1. 左上の「プロジェクトを選択」をクリック
2. 作成したプロジェクトを選択
3. プロジェクトIDが表示されます（例: `reframe-project-123456`）

**重要**: このプロジェクトIDをメモしておいてください。後で`.env`ファイルに設定します。

---

## 3. gcloud CLIのインストール

gcloud CLIは、コマンドラインからGCPを操作するためのツールです。

### 3.1 macOSでのインストール

#### 方法1: Homebrewを使用（推奨）

```bash
# Homebrewがインストールされていない場合
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# gcloud CLIをインストール
brew install --cask google-cloud-sdk
```

#### 方法2: 公式インストーラーを使用

1. [gcloud CLIのダウンロードページ](https://cloud.google.com/sdk/docs/install)にアクセス
2. macOS用のインストーラーをダウンロード
3. ダウンロードした`.pkg`ファイルを実行してインストール

### 3.2 インストールの確認

ターミナルで以下のコマンドを実行：

```bash
gcloud --version
```

以下のような出力が表示されればOKです：

```
Google Cloud SDK 450.0.0
bq 2.0.93
core 2024.01.12
gcloud-crc32c 1.0.0
gsutil 5.27
```

### 3.3 初期化

初回起動時、初期化が必要です：

```bash
gcloud init
```

以下の質問に答えます：

1. **ログイン**: `Y`を入力してブラウザでログイン
2. **プロジェクトの選択**: 作成したプロジェクトを選択
3. **デフォルトのリージョン**: `asia-northeast1`（東京）を推奨

---

## 4. 認証の設定

### 4.1 アプリケーションデフォルト認証情報の設定

ローカル開発環境でGCPサービスを使用する場合、認証情報を設定する必要があります。

```bash
# ブラウザでログインして認証
gcloud auth login

# アプリケーションデフォルト認証情報を設定
gcloud auth application-default login
```

これにより、ローカル環境からGCPサービスにアクセスできるようになります。

### 4.2 認証の確認

```bash
# 現在の認証情報を確認
gcloud auth list

# アプリケーションデフォルト認証情報を確認
gcloud auth application-default print-access-token
```

---

## 5. プロジェクトIDの確認と設定

### 5.1 現在のプロジェクトIDを確認

```bash
# 現在選択されているプロジェクトIDを確認
gcloud config get-value project
```

出力例：
```
reframe-project-123456
```

### 5.2 プロジェクトを設定

複数のプロジェクトがある場合、使用するプロジェクトを設定します：

```bash
# プロジェクトIDを設定
gcloud config set project YOUR_PROJECT_ID

# 例
gcloud config set project reframe-project-123456
```

### 5.3 プロジェクトの一覧を確認

```bash
# 利用可能なプロジェクトの一覧を表示
gcloud projects list
```

出力例：
```
PROJECT_ID              NAME           PROJECT_NUMBER
reframe-project-123456  Reframe        123456789012
```

### 5.4 .envファイルに設定

プロジェクトルートの`.env`ファイルを編集します：

```bash
# .envファイルを開く
# エディタで開くか、以下のコマンドで編集
nano .env
# または
code .env  # VS Codeを使用している場合
```

以下の行を追加または更新：

```bash
# GCP Configuration
GOOGLE_CLOUD_PROJECT=reframe-project-123456
VERTEX_AI_LOCATION=asia-northeast1
```

**重要**: `reframe-project-123456`の部分を、実際のプロジェクトIDに置き換えてください。

---

## 6. Vertex AI APIの有効化

Vertex AIを使用するには、APIを有効化する必要があります。

### 6.1 APIの有効化（コマンドライン）

```bash
# Vertex AI APIを有効化
gcloud services enable aiplatform.googleapis.com

# 有効化の確認
gcloud services list --enabled | grep aiplatform
```

### 6.2 APIの有効化（Webコンソール）

1. [GCPコンソールのAPIライブラリ](https://console.cloud.google.com/apis/library)にアクセス
2. 検索バーで「Vertex AI API」を検索
3. 「Vertex AI API」をクリック
4. 「有効にする」ボタンをクリック

### 6.3 有効化の確認

```bash
# 有効化されているAPIの一覧を確認
gcloud services list --enabled

# Vertex AI APIが含まれているか確認
gcloud services list --enabled | grep -i vertex
```

---

## 7. サービスアカウントの作成（ローカル開発時のみ）

ローカル開発環境でVertex AIを使用する場合、サービスアカウントキーが必要です。

### 7.1 サービスアカウントの作成

```bash
# サービスアカウントを作成
gcloud iam service-accounts create vertex-ai-service \
    --display-name="Vertex AI Service Account" \
    --description="Service account for Vertex AI in local development"
```

### 7.2 権限の付与

```bash
# Vertex AI Userロールを付与
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:vertex-ai-service@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"
```

**重要**: `YOUR_PROJECT_ID`を実際のプロジェクトIDに置き換えてください。

### 7.3 サービスアカウントキーのダウンロード

```bash
# キーをダウンロード（プロジェクトルートに保存）
gcloud iam service-accounts keys create ./service-account-key.json \
    --iam-account=vertex-ai-service@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### 7.4 .envファイルに設定

```bash
# .envファイルに追加
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
```

### 7.5 .gitignoreに追加（重要）

サービスアカウントキーは機密情報なので、Gitにコミットしないようにします：

```bash
# .gitignoreファイルに追加
echo "service-account-key.json" >> .gitignore
echo ".env" >> .gitignore  # .envファイルも追加（既にある場合はスキップ）
```

---

## 8. 設定の確認

### 8.1 すべての設定を確認

```bash
# 現在のgcloud設定を確認
gcloud config list

# 出力例：
# [core]
# account = your-email@gmail.com
# project = reframe-project-123456
# 
# [compute]
# region = asia-northeast1
```

### 8.2 環境変数の確認

```bash
# .envファイルの内容を確認
cat .env | grep GOOGLE

# 期待される出力：
# GOOGLE_CLOUD_PROJECT=reframe-project-123456
# VERTEX_AI_LOCATION=asia-northeast1
# GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
```

### 8.3 動作確認

バックエンドサーバーを起動して、エラーが出ないか確認：

```bash
cd backend
npm run dev
```

エラーが出ない場合は、設定が正しく完了しています。

---

## トラブルシューティング

### エラー: "gcloud: command not found"

gcloud CLIがインストールされていないか、PATHが通っていません。

**解決方法**:
```bash
# Homebrewでインストールした場合
brew install --cask google-cloud-sdk

# PATHを確認
echo $PATH | grep google-cloud-sdk

# PATHが通っていない場合、~/.zshrcまたは~/.bash_profileに追加
echo 'export PATH="$PATH:/usr/local/bin/google-cloud-sdk/bin"' >> ~/.zshrc
source ~/.zshrc
```

### エラー: "You do not have permission to access project"

プロジェクトへのアクセス権限がありません。

**解決方法**:
1. GCPコンソールでプロジェクトを確認
2. 正しいGoogleアカウントでログインしているか確認
3. プロジェクトのオーナーまたは編集者権限があるか確認

### エラー: "API [aiplatform.googleapis.com] is not enabled"

Vertex AI APIが有効化されていません。

**解決方法**:
```bash
# APIを有効化
gcloud services enable aiplatform.googleapis.com

# 確認
gcloud services list --enabled | grep aiplatform
```

### エラー: "Could not load the default credentials"

認証情報が見つかりません。

**解決方法**:
```bash
# アプリケーションデフォルト認証情報を設定
gcloud auth application-default login

# または、サービスアカウントキーを使用する場合
export GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
```

---

## 次のステップ

設定が完了したら、以下を確認してください：

1. ✅ `.env`ファイルに`GOOGLE_CLOUD_PROJECT`が設定されている
2. ✅ Vertex AI APIが有効化されている
3. ✅ サービスアカウントキーがダウンロードされている（ローカル開発時）
4. ✅ `.gitignore`に`service-account-key.json`が追加されている

これで、Vertex AI機能を使用する準備が整いました！

---

## 参考リンク

- [GCP公式ドキュメント](https://cloud.google.com/docs)
- [gcloud CLIリファレンス](https://cloud.google.com/sdk/gcloud/reference)
- [Vertex AIドキュメント](https://cloud.google.com/vertex-ai/docs)
- [無料トライアルの詳細](https://cloud.google.com/free)
