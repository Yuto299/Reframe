# アーキテクチャ構成ドキュメント

## 概要

このプロジェクトは、**クリーンアーキテクチャ（ヘキサゴナルアーキテクチャ）**の原則に基づいて設計されたモノレポ構成のアプリケーションです。フロントエンド（Next.js）とバックエンド（Hono）を分離し、それぞれをDockerコンテナとしてGoogle Cloud Runにデプロイできます。

### アーキテクチャの特徴

- **モノレポ構成**: npm workspacesでフロントエンド、バックエンド、共有コードを管理
- **レイヤー分離**: Domain、Application、Infrastructure、Presentationの4層に明確に分離
- **依存関係の一方向性**: 外側のレイヤーから内側のレイヤーへの依存のみ許可
- **インターフェース依存**: 具象実装ではなく、インターフェースに依存
- **Dockerコンテナ化**: フロントエンドとバックエンドをそれぞれDockerコンテナ化
- **Cloud Run対応**: Google Cloud Runでスケーラブルにデプロイ可能
- **型安全性**: TypeScriptのstrictモードで型安全性を確保

## アーキテクチャパターン

### レイヤードアーキテクチャ

```
┌─────────────────────────────────────────────┐
│   Frontend (Next.js Docker Container)       │
│   - Presentation Layer (UI Components)       │
│   - API Client (HTTP通信)                    │
│   - Next.js App Router                      │
└──────────────┬───────────────────────────────┘
               │ HTTP (REST API)
┌──────────────▼───────────────────────────────┐
│   Backend (Hono Docker Container)           │
│   - API Routes (Hono Router)                 │
│   - Application Layer (Use Cases)            │
│   - Infrastructure Layer (Repository)        │
│   - DI Container                             │
└──────────────┬───────────────────────────────┘
               │ (インターフェースのみ使用)
┌──────────────▼───────────────────────────────┐
│   Shared (Domain Layer)                     │
│   - Knowledge (Entity)                       │
│   - KnowledgeTitle (Value Object)            │
│   - KnowledgeRepository (Port)              │
│   - Domain Errors                           │
└─────────────────────────────────────────────┘
```

**依存関係の方向**: 
- Frontend → API Client → HTTP → Backend → Application → Domain (Shared)
- Backend Infrastructure → Domain (Shared)
- Frontend/Backend → Shared (Domain層のみ)

## ディレクトリ構造

### モノレポ構成

```
Reframe/
├── frontend/              # Next.jsアプリケーション
│   ├── src/
│   │   ├── app/          # Next.js App Router
│   │   ├── presentation/ # UIコンポーネント
│   │   ├── components/  # shadcn/uiコンポーネント
│   │   └── lib/
│   │       └── api/      # APIクライアント
│   ├── Dockerfile
│   └── package.json
│
├── backend/               # Hono APIサーバー
│   ├── src/
│   │   ├── api/          # APIルートとサーバー
│   │   ├── application/  # ユースケース
│   │   └── infrastructure/ # リポジトリ実装、DIコンテナ
│   ├── Dockerfile
│   └── package.json
│
├── shared/               # 共有コード（Domain層）
│   └── src/
│       └── domain/       # ドメインモデルとインターフェース
│
├── docker-compose.yml    # ローカル開発環境
└── package.json         # ルート（workspaces設定）
```

### 各パッケージの詳細

#### 1. Shared Package (`shared/`)

**責務**: ドメイン層を共有。フロントエンドとバックエンドで共通の型定義とビジネスルールを提供。

```
shared/src/domain/
├── models/
│   ├── Knowledge.ts          # ドメインモデル（エンティティ）
│   └── KnowledgeTitle.ts     # 値オブジェクト（タイトルのビジネスルール）
├── repositories/
│   └── KnowledgeRepository.ts # リポジトリインターフェース（ポート）
└── errors/
    └── DomainError.ts         # ドメインエラー（ビジネスルール違反）
```

**特徴**:
- ビジネスルールとエンティティを定義
- 外部フレームワークに依存しない
- インターフェースのみを定義（実装は含まない）
- バリデーションロジックを含む
- 不変性を保証（readonlyプロパティ）

**主要な型**:
- `Knowledge`: ナレッジエンティティ（不変）
- `KnowledgeTitle`: タイトルの値オブジェクト
- `CreateKnowledgeInput`: ナレッジ作成用の入力型
- `SearchResult`: 検索結果型
- `KnowledgeRepository`: リポジトリのインターフェース（ポート）
- `KnowledgeValidator`: バリデーションロジック
- `KnowledgeFactory`: エンティティのファクトリーメソッド

**ドメインエラー**:
- `DomainError`: 基底クラス
- `KnowledgeNotFoundError`: ナレッジが見つからない場合
- `KnowledgeValidationError`: バリデーションエラー
- `ConnectionValidationError`: 接続のバリデーションエラー

#### 2. Backend Package (`backend/`)

**責務**: RESTful APIサーバー。ビジネスロジックの実行とデータ永続化を担当。

```
backend/src/
├── api/
│   ├── server.ts           # Honoサーバー設定
│   └── routes/
│       └── knowledge.ts    # ナレッジ関連のAPIルート
├── application/
│   ├── usecases/          # ユースケース
│   └── errors/            # アプリケーションエラー
└── infrastructure/
    ├── di/
    │   └── container.ts   # DIコンテナ
    └── repositories/
        └── MockKnowledgeRepository.ts
```

**Application Layer (`backend/src/application/`)**

**責務**: ユースケースの実装。ドメイン層のロジックを組み合わせてアプリケーションの機能を実現。

```
backend/src/application/
├── usecases/
│   ├── GetAllKnowledgeUseCase.ts      # 全ナレッジ取得
│   ├── GetKnowledgeByIdUseCase.ts    # IDでナレッジ取得
│   ├── SearchKnowledgeUseCase.ts      # ナレッジ検索
│   ├── CreateKnowledgeUseCase.ts      # ナレッジ作成
│   └── ConnectKnowledgeUseCase.ts     # ナレッジ接続
└── errors/
    └── ApplicationError.ts             # アプリケーションエラー
```

**特徴**:
- 各ユースケースは単一責任の原則に従う
- リポジトリインターフェースに依存（具象実装には依存しない）
- ビジネスロジックのオーケストレーションを行う
- バリデーションとエラーハンドリングを含む

**パターン**:
- コンストラクタインジェクションでリポジトリを受け取る
- `execute()` メソッドでユースケースを実行
- ドメインエラーをそのまま伝播
- 予期しないエラーは`UseCaseExecutionError`でラップ

**エラーハンドリング**:
- `ApplicationError`: アプリケーション層のエラー基底クラス
- `UseCaseExecutionError`: ユースケース実行時のエラー
- `Result<T, E>`: 関数型パターンによるエラーハンドリング（将来の拡張用）

**Infrastructure Layer (`backend/src/infrastructure/`)**

**責務**: 外部システムとの接続を実装（アダプター）。リポジトリインターフェースの具象実装。

```
backend/src/infrastructure/
├── repositories/
│   └── MockKnowledgeRepository.ts     # モックリポジトリ実装
└── di/
    └── container.ts                    # DIコンテナ（ファクトリーパターン）
```

**特徴**:
- ドメイン層のインターフェースを実装
- データベース、API、外部サービスとの通信を担当
- 将来的に `DatabaseKnowledgeRepository` などに差し替え可能

**実装例**:
- `MockKnowledgeRepository`: メモリ内のモックデータを使用
- 将来的には `PostgresKnowledgeRepository`、`APIKnowledgeRepository` などに拡張可能

**DIコンテナ**:
- `createContainer()`: ファクトリーメソッドでテスト時にモック注入可能
- `Container`: 型安全なコンテナインターフェース
- 環境変数での実装切り替えが可能な設計

#### 3. Frontend Package (`frontend/`)

**責務**: ユーザーインターフェース。Next.jsで実装されたSPA。

**Presentation Layer (`frontend/src/presentation/`)**

**責務**: UIコンポーネント。ユーザーインターフェースの実装。

```
frontend/src/
├── app/                    # Next.js App Router
│   ├── search/page.tsx
│   └── graph/page.tsx
├── presentation/
│   └── components/         # UIコンポーネント
│       ├── graph/
│       ├── layout/
│       └── search/
├── components/ui/          # shadcn/uiコンポーネント
└── lib/
    └── api/                # APIクライアント
        ├── client.ts
        └── knowledge.ts
```

**特徴**:
- Reactコンポーネントとして実装
- ユースケースを呼び出してデータを取得・操作
- UIロジックのみを担当（ビジネスロジックは含まない）

**API Client (`frontend/src/lib/api/`)**

**責務**: バックエンドAPIとの通信を担当。型安全なHTTPクライアント。

**特徴**:
- `apiClient`: 汎用HTTPクライアント（fetchベース）
- `knowledgeApi`: ナレッジ関連のAPIメソッド
- エラーハンドリングと型安全性を提供

**責務**: ルーティングとページレイアウト。Next.jsのApp Routerを使用。

#### 4. UI Components (`frontend/src/components/ui/`)

**責務**: 再利用可能なUIコンポーネント（shadcn/uiベース）。

```
frontend/src/components/ui/
├── button.tsx
├── card.tsx
├── input.tsx
├── sheet.tsx
└── ... (その他のshadcn/uiコンポーネント)
```

**特徴**:
- shadcn/uiベースのコンポーネント
- プレゼンテーション層から使用される
- スタイリングはTailwind CSSを使用

## Docker構成

### フロントエンドDockerfile

- Next.jsのスタンドアロンモードを使用
- マルチステージビルドで最適化
- 本番環境用の軽量コンテナ

### バックエンドDockerfile

- Node.js + Honoサーバー
- マルチステージビルドで最適化
- Cloud Run対応（PORT環境変数）

### docker-compose.yml

ローカル開発環境用の設定：
- フロントエンド: `http://localhost:3000`
- バックエンド: `http://localhost:8080`
- ホットリロード対応

## デプロイ

### ローカル開発

```bash
# docker-composeで起動
docker-compose up

# または、npm workspacesで起動
npm run dev:frontend  # 別ターミナル
npm run dev:backend   # 別ターミナル
```

### Cloud Runへのデプロイ

```bash
# バックエンドのデプロイ
gcloud run deploy backend-api \
  --source ./backend \
  --platform managed \
  --region asia-northeast1 \
  --port 8080

# フロントエンドのデプロイ
gcloud run deploy frontend-app \
  --source ./frontend \
  --platform managed \
  --region asia-northeast1 \
  --port 3000 \
  --set-env-vars NEXT_PUBLIC_API_URL=https://backend-api-xxxxx.run.app
```

### プロジェクトルート（設定ファイル）

#### 設定ファイル

```
.
├── package.json            # 依存関係とスクリプト
├── tsconfig.json          # TypeScript設定
├── next.config.ts         # Next.js設定
├── eslint.config.mjs      # ESLint設定
├── postcss.config.mjs     # PostCSS設定
├── components.json        # shadcn/ui設定
└── .gitignore            # Git除外設定
```

**主要な設定**:

1. **`tsconfig.json`**
   - `paths` で `@/*` エイリアスが設定されている
   - `strict: true` で型安全性が確保されている

2. **`next.config.ts`**
   - Next.jsの基本設定

3. **`package.json`**
   - Next.js 16.1.3
   - React 19.2.3
   - 必要な依存関係がインストールされている

4. **`components.json`**
   - shadcn/uiの設定ファイル

#### 静的ファイル

```
public/
├── file.svg
├── globe.svg
├── next.svg
├── vercel.svg
└── window.svg
```

静的アセットは `public/` ディレクトリに配置されています（Next.jsの標準）。

## データフロー

### 検索機能の例

```
1. User Input (KnowledgeInput.tsx)
   ↓
2. SearchPage (frontend/src/app/search/page.tsx)
   ↓
3. knowledgeApi.search() (frontend/src/lib/api/knowledge.ts)
   ↓
4. HTTP POST /api/knowledge/search
   ↓
5. Backend API Route (backend/src/api/routes/knowledge.ts)
   ↓
6. SearchKnowledgeUseCase (backend/src/application/usecases/)
   ↓
7. KnowledgeRepository Interface (shared/src/domain/repositories/)
   ↓
8. MockKnowledgeRepository (backend/src/infrastructure/repositories/)
   ↓
9. Return Results (SearchResult[])
   ↓
10. SearchResults Component (frontend/src/presentation/components/)
```

### ナレッジ作成と接続の例

```
1. User Action (SearchPage)
   ↓
2. knowledgeApi.create() → HTTP POST /api/knowledge
   ↓
3. Backend API Route
   ↓
4. CreateKnowledgeUseCase
   ↓
5. KnowledgeFactory.create() (バリデーション - shared)
   ↓
6. KnowledgeRepository.create()
   ↓
7. knowledgeApi.connect() → HTTP POST /api/knowledge/:id/connect
   ↓
8. ConnectKnowledgeUseCase (ビジネスルール適用)
   ↓
9. KnowledgeRepository.addConnection()
```

## 依存関係のルール

### ✅ 許可されている依存関係

- **Frontend → Shared**: ドメインモデルと型定義を使用
- **Frontend → API Client**: HTTP通信を経由
- **Backend → Shared**: ドメインモデルとインターフェースを使用
- **Backend Application → Shared**: ドメインモデルとインターフェースを使用
- **Backend Infrastructure → Shared**: インターフェースを実装

### ❌ 禁止されている依存関係

- **Shared → Frontend/Backend**: 共有パッケージは外部に依存しない
- **Frontend → Backend**: 直接依存せず、HTTP API経由のみ
- **Backend Application → Backend Infrastructure**: 具象実装に依存せず、インターフェースに依存
- **Shared → Frontend/Backend**: 共有パッケージは他のパッケージに依存しない

## 設計原則

### 1. ドメイン駆動設計（DDD）の原則

- **エンティティ**: `Knowledge` は不変性を保証（readonlyプロパティ）
- **値オブジェクト**: `KnowledgeTitle` でビジネスルールをカプセル化
- **ドメインエラー**: ビジネスルール違反を明確に表現
- **バリデーション**: ドメインモデル内で実行

### 2. エラーハンドリングの階層化

```
DomainError (ドメイン層)
  ├─ KnowledgeNotFoundError
  ├─ KnowledgeValidationError
  └─ ConnectionValidationError
       ↓
ApplicationError (アプリケーション層)
  └─ UseCaseExecutionError
       ↓
Presentation Layer (エラー表示)
```

### 3. 依存性注入（DI）パターン

- **ファクトリーパターン**: `createContainer()` でテスト時にモック注入可能
- **インターフェース依存**: 具象実装に依存しない
- **単一責任**: 各レイヤーが明確な責務を持つ

### 4. 型安全性

- **TypeScript strict mode**: 型安全性を最大限に活用
- **any型の排除**: すべての型を明示的に定義
- **readonly**: 不変性を保証

## 使用方法

### フロントエンドでのAPI呼び出し

ページコンポーネントでは、APIクライアントを使用してバックエンドAPIを呼び出します。

```typescript
// frontend/src/app/search/page.tsx
'use client';

import { knowledgeApi } from '@/lib/api/knowledge';

export default function SearchPage() {
    const handleSearch = async (query: string) => {
        const results = await knowledgeApi.search(query);
        // ...
    };
    
    const handleConnect = async () => {
        const newKnowledge = await knowledgeApi.create({
            title: '...',
            content: '...',
        });
        await knowledgeApi.connect(newKnowledge.id, selectedIds);
    };
}
```

### バックエンドでのユースケース使用

APIルートでは、DIコンテナからユースケースを取得して使用します。

```typescript
// backend/src/api/routes/knowledge.ts
import { container } from '../../infrastructure/di/container.js';

router.get('/', async (req, res) => {
    const knowledge = await container.getAllKnowledgeUseCase.execute();
    res.json({ data: knowledge });
});
```

### エラーハンドリング

各レイヤーで適切なエラーハンドリングが実装されています。

- **ドメインエラー**: ビジネスルール違反（`KnowledgeNotFoundError`, `KnowledgeValidationError`など）
- **アプリケーションエラー**: ユースケース実行時のエラー（`UseCaseExecutionError`）
- **APIエラー**: HTTPステータスコードとエラーメッセージを返す
- **フロントエンド**: `ApiError`をキャッチしてユーザーに表示

### 新しいユースケースの追加

1. `backend/src/application/usecases/` に新しいユースケースクラスを作成
2. コンストラクタで`KnowledgeRepository`（sharedから）を受け取る
3. `execute()`メソッドでビジネスロジックを実装
4. `backend/src/infrastructure/di/container.ts`に追加
5. `backend/src/api/routes/knowledge.ts`にAPIエンドポイントを追加
6. `frontend/src/lib/api/knowledge.ts`にAPIクライアントメソッドを追加

### 新しいリポジトリ実装の追加

1. `KnowledgeRepository`インターフェース（shared）を実装
2. `backend/src/infrastructure/repositories/`に配置
3. `backend/src/infrastructure/di/container.ts`で実装を切り替え

## 参考資料

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [shadcn/ui](https://ui.shadcn.com/)
