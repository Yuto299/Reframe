# API仕様書

## ベースURL

- **開発環境**: `http://localhost:8080`
- **本番環境**: Cloud RunのデプロイURL

## 共通仕様

### リクエストヘッダー
```
Content-Type: application/json
```

### レスポンス形式
```json
{
  "data": { ... }  // 成功時
}
```

または

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

### ステータスコード
- `200 OK`: リクエスト成功
- `201 Created`: リソース作成成功
- `204 No Content`: リクエスト成功（ボディなし）
- `400 Bad Request`: リクエストが不正
- `404 Not Found`: リソースが見つからない
- `500 Internal Server Error`: サーバーエラー

## エンドポイント一覧

### 1. 知識の一覧取得

**エンドポイント**: `GET /api/knowledge`

**説明**: 全ての知識を取得する

**リクエスト**: なし

**レスポンス**:
```json
{
  "data": [
    {
      "id": "knowledge-id-1",
      "title": "知識のタイトル1",
      "content": "知識の内容1",
      "createdAt": "2024-01-24T00:00:00.000Z",
      "connections": ["knowledge-id-2"]
    },
    {
      "id": "knowledge-id-2",
      "title": "知識のタイトル2",
      "content": "知識の内容2",
      "createdAt": "2024-01-24T01:00:00.000Z",
      "connections": ["knowledge-id-1"]
    }
  ]
}
```

**ステータスコード**: `200 OK`

---

### 2. 知識の取得（ID指定）

**エンドポイント**: `GET /api/knowledge/:id`

**説明**: IDで特定の知識を取得する

**パスパラメータ**:
- `id` (string, 必須): 知識のID

**リクエスト**: なし

**レスポンス**:
```json
{
  "data": {
    "id": "knowledge-id",
    "title": "知識のタイトル",
    "content": "知識の内容",
    "createdAt": "2024-01-24T00:00:00.000Z",
    "connections": ["connected-id-1", "connected-id-2"]
  }
}
```

**ステータスコード**: `200 OK`

**エラー**:
- `404 Not Found`: 知識が見つからない場合
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Knowledge not found"
  }
}
```

---

### 3. 知識の検索

**エンドポイント**: `POST /api/knowledge/search`

**説明**: キーワードで知識を検索する

**リクエストボディ**:
```json
{
  "query": "検索キーワード"
}
```

**バリデーション**:
- `query` (string, 必須): 検索キーワード（空文字列不可）

**レスポンス**:
```json
{
  "data": [
    {
      "knowledge": {
        "id": "knowledge-id-1",
        "title": "知識のタイトル1",
        "content": "知識の内容1",
        "createdAt": "2024-01-24T00:00:00.000Z",
        "connections": []
      },
      "relevanceScore": 15
    },
    {
      "knowledge": {
        "id": "knowledge-id-2",
        "title": "知識のタイトル2",
        "content": "知識の内容2",
        "createdAt": "2024-01-24T01:00:00.000Z",
        "connections": []
      },
      "relevanceScore": 8
    }
  ]
}
```

**ステータスコード**: `200 OK`

**エラー**:
- `400 Bad Request`: クエリが不正な場合
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Query must be a non-empty string"
  }
}
```

**検索アルゴリズム**:
1. タイトルに完全一致: +10点
2. コンテンツに完全一致: +5点
3. タイトルに単語一致: +3点/単語
4. コンテンツに単語一致: +1点/単語
5. スコアが0より大きいもののみ返却
6. スコアの降順でソート
7. 最大10件まで返却

---

### 4. 知識の作成

**エンドポイント**: `POST /api/knowledge`

**説明**: 新しい知識を作成する

**リクエストボディ**:
```json
{
  "title": "知識のタイトル",
  "content": "知識の内容"
}
```

**バリデーション**:
- `title` (string, 必須): 1-200文字
- `content` (string, 必須): 1-10,000文字

**レスポンス**:
```json
{
  "data": {
    "id": "new-knowledge-id",
    "title": "知識のタイトル",
    "content": "知識の内容",
    "createdAt": "2024-01-24T12:00:00.000Z",
    "connections": []
  }
}
```

**ステータスコード**: `201 Created`

**エラー**:
- `400 Bad Request`: バリデーションエラー
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title must be at least 1 character(s)"
  }
}
```

---

### 5. 知識の接続

**エンドポイント**: `POST /api/knowledge/:id/connect`

**説明**: 複数の知識を選択して、指定された知識と接続する

**パスパラメータ**:
- `id` (string, 必須): 接続元の知識のID

**リクエストボディ**:
```json
{
  "targetIds": ["target-id-1", "target-id-2"]
}
```

**バリデーション**:
- `targetIds` (array, 必須): 接続先の知識IDの配列

**動作**:
1. 指定されたIDの知識が存在するか確認
2. 各ターゲットIDの知識が存在するか確認
3. 双方向で接続を追加（既存の接続は重複しない）

**レスポンス**: ボディなし

**ステータスコード**: `204 No Content`

**エラー**:
- `400 Bad Request`: リクエストが不正な場合
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "targetIds must be an array"
  }
}
```

- `404 Not Found`: 知識が見つからない場合
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Knowledge not found"
  }
}
```

---

## エラーコード一覧

| コード | 説明 |
|--------|------|
| `INVALID_REQUEST` | リクエストが不正 |
| `VALIDATION_ERROR` | バリデーションエラー |
| `NOT_FOUND` | リソースが見つからない |
| `INTERNAL_ERROR` | サーバー内部エラー |

## データ型定義

### Knowledge
```typescript
interface Knowledge {
  id: string;                    // 一意のID（UUID形式推奨）
  title: string;                 // タイトル（1-200文字）
  content: string;               // コンテンツ（1-10,000文字）
  createdAt: Date;               // 作成日時（ISO 8601形式）
  connections: string[];          // 接続されている知識のIDリスト
}
```

### SearchResult
```typescript
interface SearchResult {
  knowledge: Knowledge;          // 知識
  relevanceScore: number;        // 関連度スコア（0以上の整数）
}
```

### CreateKnowledgeInput
```typescript
interface CreateKnowledgeInput {
  title: string;                 // タイトル（1-200文字）
  content: string;               // コンテンツ（1-10,000文字）
}
```

## 使用例

### cURLでの使用例

#### 1. 知識の一覧取得
```bash
curl -X GET http://localhost:8080/api/knowledge
```

#### 2. 知識の取得
```bash
curl -X GET http://localhost:8080/api/knowledge/knowledge-id
```

#### 3. 知識の検索
```bash
curl -X POST http://localhost:8080/api/knowledge/search \
  -H "Content-Type: application/json" \
  -d '{"query": "React"}'
```

#### 4. 知識の作成
```bash
curl -X POST http://localhost:8080/api/knowledge \
  -H "Content-Type: application/json" \
  -d '{
    "title": "React Hooks",
    "content": "React Hooksは関数コンポーネントで状態管理を行う機能です。"
  }'
```

#### 5. 知識の接続
```bash
curl -X POST http://localhost:8080/api/knowledge/knowledge-id/connect \
  -H "Content-Type: application/json" \
  -d '{
    "targetIds": ["target-id-1", "target-id-2"]
  }'
```

## レート制限

現バージョンではレート制限は実装されていません。将来の拡張で実装予定です。

## バージョニング

現バージョンではAPIバージョニングは実装されていません。将来の拡張で実装予定です。
