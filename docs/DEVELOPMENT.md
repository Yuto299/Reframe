# 開発ガイドライン

## 1. 開発環境のセットアップ

### 1.1 必要な環境

- **Node.js**: 20以上
- **npm**: 9以上
- **Docker**: 20以上（Docker Compose使用時）
- **TypeScript**: 5以上

### 1.2 セットアップ手順

```bash
# リポジトリのクローン
git clone https://github.com/Yuto299/Reframe.git
cd Reframe

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集して必要な設定を行う
```

### 1.3 開発サーバーの起動

#### 方法1: Docker Composeを使用（推奨）

```bash
# 全てのサービスを起動
docker compose up -d

# ログを確認
docker compose logs -f

# サービスを停止
docker compose down
```

#### 方法2: npm workspacesを使用

```bash
# フロントエンド（ターミナル1）
npm run dev:frontend

# バックエンド（ターミナル2）
npm run dev:backend
```

## 2. コーディング規約

### 2.1 TypeScript

- **strictモード**: 有効
- **型推論**: 可能な限り型推論を使用
- **明示的な型**: パブリックAPIでは明示的に型を指定
- **anyの使用**: 禁止（やむを得ない場合は`unknown`を使用）

### 2.2 命名規則

- **変数・関数**: camelCase
- **クラス・インターフェース**: PascalCase
- **定数**: UPPER_SNAKE_CASE
- **ファイル名**: kebab-case（コンポーネントはPascalCase）

### 2.3 インポート順序

1. 外部ライブラリ
2. 内部モジュール（@/で始まるもの）
3. 相対パス

```typescript
import { useState } from 'react';
import { Knowledge } from '@reframe/shared';
import { knowledgeApi } from '@/lib/api/knowledge';
```

### 2.4 コメント

- **JSDoc**: パブリックAPIにはJSDocコメントを記述
- **複雑なロジック**: 説明コメントを追加
- **TODO**: 将来の改善点はTODOコメントで記録

## 3. アーキテクチャ原則

### 3.1 クリーンアーキテクチャ

- **依存関係の方向**: 外側から内側へのみ
- **インターフェース依存**: 具象実装ではなくインターフェースに依存
- **レイヤー分離**: Domain、Application、Infrastructure、Presentationを明確に分離

### 3.2 ディレクトリ構造

```
backend/src/
├── api/              # API層（Honoルート）
├── application/      # アプリケーション層（ユースケース）
└── infrastructure/   # インフラ層（リポジトリ実装）

frontend/src/
├── app/              # Next.js App Router
├── presentation/     # プレゼンテーション層（UIコンポーネント）
└── lib/              # ユーティリティ（APIクライアントなど）

shared/src/
└── domain/           # ドメイン層（エンティティ、値オブジェクト、インターフェース）
```

### 3.3 依存性注入

- **コンストラクタインジェクション**: 依存関係はコンストラクタで注入
- **DIコンテナ**: `backend/src/infrastructure/di/container.ts`で管理
- **テスト**: モックを注入してテスト可能にする

## 4. テスト

### 4.1 テストの種類

- **ユニットテスト**: 各ユースケースとドメインロジック
- **統合テスト**: APIエンドポイント
- **E2Eテスト**: 主要なユーザーフロー（将来実装）

### 4.2 テストファイルの配置

```
backend/src/
├── application/
│   └── usecases/
│       ├── CreateKnowledgeUseCase.ts
│       └── CreateKnowledgeUseCase.test.ts
```

### 4.3 テストの実行

```bash
# 全てのテストを実行
npm test

# ウォッチモード
npm test -- --watch

# カバレッジ
npm test -- --coverage
```

## 5. Git運用

### 5.1 ブランチ戦略

- **main**: 本番環境用ブランチ
- **develop**: 開発用ブランチ
- **feature/**: 機能追加用ブランチ
- **fix/**: バグ修正用ブランチ

### 5.2 コミットメッセージ

```
feat: 新機能の追加
fix: バグ修正
docs: ドキュメントの更新
style: コードスタイルの変更（フォーマットなど）
refactor: リファクタリング
test: テストの追加・修正
chore: ビルドプロセスやツールの変更
```

### 5.3 プルリクエスト

- **タイトル**: 変更内容を簡潔に記述
- **説明**: 変更の背景、実装内容、テスト方法を記述
- **レビュー**: 最低1名の承認が必要

## 6. コードレビュー

### 6.1 レビューの観点

- **アーキテクチャ**: クリーンアーキテクチャの原則に従っているか
- **型安全性**: TypeScriptの型が適切に使用されているか
- **エラーハンドリング**: エラーが適切に処理されているか
- **パフォーマンス**: パフォーマンスに問題がないか
- **テスト**: テストが適切に書かれているか

### 6.2 レビューコメント

- **必須修正**: マージ前に修正が必要
- **提案**: 改善提案（任意）
- **質問**: 理解を深めるための質問

## 7. デバッグ

### 7.1 ログ

- **バックエンド**: `console.log`を使用（本番環境では適切なログライブラリを使用）
- **フロントエンド**: `console.log`を使用（開発環境のみ）

### 7.2 デバッグツール

- **バックエンド**: Node.jsデバッガー、Postman
- **フロントエンド**: React DevTools、ブラウザの開発者ツール

## 8. パフォーマンス最適化

### 8.1 バックエンド

- **データベースクエリ**: N+1問題を避ける
- **キャッシュ**: 適切なキャッシュ戦略を実装
- **非同期処理**: 適切にasync/awaitを使用

### 8.2 フロントエンド

- **コード分割**: Next.jsの自動コード分割を活用
- **メモ化**: React.memo、useMemo、useCallbackを適切に使用
- **画像最適化**: Next.jsのImageコンポーネントを使用

## 9. セキュリティ

### 9.1 入力検証

- **サーバーサイド**: 全ての入力はサーバーサイドで検証
- **クライアントサイド**: UX向上のための検証（補助的）

### 9.2 XSS対策

- **React**: 自動エスケープを活用
- **dangerouslySetInnerHTML**: 使用を避ける

### 9.3 CSRF対策

- 将来実装予定

## 10. ドキュメント

### 10.1 コードドキュメント

- **JSDoc**: パブリックAPIにはJSDocコメント
- **README**: 各パッケージにREADME.mdを配置

### 10.2 APIドキュメント

- **API仕様書**: `docs/API.md`に記述
- **OpenAPI**: 将来実装予定

## 11. トラブルシューティング

### 11.1 よくある問題

#### Docker Composeが起動しない
```bash
# ポートが使用されている場合
lsof -i :5432
# 使用しているプロセスを停止

# コンテナを再ビルド
docker compose build --no-cache
docker compose up -d
```

#### 型エラーが発生する
```bash
# TypeScriptの型チェック
npm run type-check

# キャッシュをクリア
rm -rf node_modules/.cache
```

#### 依存関係のエラー
```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

## 12. 参考資料

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Hono Documentation](https://hono.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
