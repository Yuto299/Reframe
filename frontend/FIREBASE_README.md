# Firebase Hosting設定ファイル

このディレクトリには、Firebase Hostingへのデプロイに必要な設定ファイルが含まれています。

## ファイル一覧

- `firebase.json`: Firebase Hosting設定
- `.firebaserc`: Firebaseプロジェクト設定

## セットアップ手順

### 1. Firebase CLIのインストール

```bash
npm install -g firebase-tools
```

### 2. Firebaseログイン

```bash
firebase login
```

### 3. プロジェクトの設定

`.firebaserc`ファイルを編集して、自分のFirebaseプロジェクトIDに置き換えてください:

```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

または、以下のコマンドでプロジェクトを選択:

```bash
firebase use --add
```

### 4. ビルド

```bash
npm run build
```

Next.jsのstatic exportが実行され、`out/`ディレクトリに静的ファイルが生成されます。

### 5. デプロイ

```bash
firebase deploy --only hosting
```

## firebase.json の設定

### public
- 静的ファイルの出力ディレクトリ: `out`
- Next.js の `output: 'export'` でビルドされたファイルが配置される

### rewrites
- SPAルーティング対応
- すべてのパスを `index.html` にリダイレクト

### headers
- **静的アセット**: 1年キャッシュ（immutable）
- **HTML**: キャッシュなし

## トラブルシューティング

### デプロイが失敗する

```bash
# Firebase CLIを最新版に更新
npm install -g firebase-tools@latest

# ビルド出力を確認
ls out/
```

### 404エラー

- `next.config.ts`で`output: 'export'`が設定されているか確認
- ビルドが正常に完了しているか確認

## 参考資料

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Next.js Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
