# Reframe Frontend

Firebase HostingでデプロイするNext.jsフロントエンドアプリケーション。

## セットアップ

```bash
npm install
```

## 開発

```bash
npm run dev
```

アプリケーションは `http://localhost:3000` で起動します。

## ビルド

```bash
npm run build
```

## Firebase Hostingへのデプロイ

```bash
# Firebase CLIをインストール（未インストールの場合）
npm install -g firebase-tools

# Firebaseにログイン
firebase login

# プロジェクトを初期化（初回のみ）
firebase init hosting

# ビルドしてデプロイ
npm run build
firebase deploy --only hosting
```

## 環境変数

`.env.local`ファイルを作成：

```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.run.app
```

## 設定

- `next.config.ts`: Next.js設定
- `firebase.json`: Firebase Hosting設定（作成が必要）
