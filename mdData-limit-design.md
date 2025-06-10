# スライド保存数上限設計・実装指示書

## 進捗
usersテーブルにisProカラム追加済み
型定義追加済み
認証コールバック修正済み

## 1. 要件整理

- 無料ユーザー：スライド保存上限10件
- 課金ユーザー：保存上限拡張（例：無制限、要件に応じ設定可）
- 上限超過時：警告表示・保存不可・課金誘導UI
- 非ログインユーザー：保存不可
- todos.md/requirements.mdに準拠

## 2. DB設計・認証設計

- usersテーブルに`isPro: boolean`カラム追加（課金判定用）
- 認証セッション（session.user）に`isPro`を付与（auth.config.tsのjwt/sessionコールバック拡張）
- 型名例：`UserWithPro`（型定義：lib/types.ts等）

## 3. 保存上限判定ロジック設計

- 新規作成時、`getMdDatas(session)`で件数取得
- `isPro`判定し、上限値（FREE_LIMIT/PRO_LIMIT）を分岐
- 上限値定義：**推奨案** [`src/lib/mdData-crud.ts`](src/lib/mdData-crud.ts) などサーバ専用ロジック層で定義
  - フロントから直接import不可でセキュリティ確保
  - 型安全・補完・テスト機能と一体管理
  - 例：`const FREE_LIMIT = 10; const PRO_LIMIT = 999;`
- 上限超過時は保存処理中断しエラー返却
- 判定関数例：`canCreateMdData(user: UserWithPro, currentCount: number): boolean`

## 4. UI/UX設計

- 新規作成ボタン（display-sheet/index.tsx）を上限時に非活性化
- 上限到達時、`custom-toast.ts`で警告表示
- 課金誘導：モーダル等で「プランアップグレード」案内
- 保存不可時はサーバ側でもエラー返却し、UIで反映
- **スライド保存数カウント表示（「5/10件」）**
  - 現在件数/上限件数を視覚的に表示
  - スライド一覧上部等に配置
  - リアルタイム更新（作成・削除時）

### 4.1. カウント表示の設計・実装

#### データ取得・表示方法
- サーバ: [`src/lib/mdData-crud.ts`](src/lib/mdData-crud.ts)で件数取得・上限値判定関数を実装
- サーバーアクション: mdData-crud.tsの関数を直接呼び出し、現在件数・上限値を返却
- クライアント: サーバーアクションを呼び出し、返り値でUI更新
- UI: 専用コンポーネント（` mdData-count-indicator`）で表示

#### サーバ/クライアント責務分離
- サーバ: mdData-crud.tsでDBから件数取得、認証・isPro判定、上限値管理・計算
- サーバーアクション: mdData-crud.ts関数をラップし、セッション管理・エラーハンドリング
- クライアント: サーバーアクション呼び出し、UI表示、リアルタイム更新
- **重要**: 上限値はサーバ側のみで管理、クライアントでのハードコーディング禁止

#### 型・データフロー
```typescript
type MdDataCount = {
  current: number;
  limit: number;
  isPro: boolean;
}
```
- データフロー: DB → mdData-crud.ts → サーバーアクション → feature → component
- 更新タイミング: 初回ロード、作成・削除後、認証状態変更時

#### 必要な追加ファイル
- [`src/feature/display-sheet/getMdDataCountAction.ts`](src/feature/display-sheet/getMdDataCountAction.ts) - サーバーアクション
- [`src/components/mdData-count-indicator.tsx`](src/components/mdData-count-indicator.tsx) - カウント表示UI
- [`src/lib/types.ts`](src/lib/types.ts) - MdDataCount型定義

#### 修正が必要なファイル
- [`src/feature/display-sheet/index.tsx`](src/feature/display-sheet/index.tsx) - サーバーアクション呼び出し・UI配置
- [`src/lib/mdData-crud.ts`](src/lib/mdData-crud.ts) - getMdDataCount関数・上限値管理ロジック追加

## 5. 配置方針（ファイル・関数・型名）

- DB: [`src/db/schema.ts`](src/db/schema.ts:49)（usersテーブルにisPro追加）
- 型: [`src/lib/types.ts`](src/lib/types.ts)（UserWithPro型追加）
- 認証: [`src/auth.config.ts`](src/auth.config.ts:22)（jwt/sessionコールバック拡張）
- 判定: [`src/lib/mdData-crud.ts`](src/lib/mdData-crud.ts)（canCreateMdData, createMdData修正）
- UI: [`src/feature/display-sheet/index.tsx`](src/feature/display-sheet/index.tsx:46)（ボタン制御・警告UI追加）
- 警告: [`src/components/custom-toast.ts`](src/components/custom-toast.ts)（警告表示）
- カウント表示アクション: [`src/feature/display-sheet/getMdDataCountAction.ts`](src/feature/display-sheet/getMdDataCountAction.ts)（サーバーアクション）
- カウント表示UI: [`src/components/mdData-count-indicator.tsx`](src/components/mdData-count-indicator.tsx)（「5/10件」表示）

## 6. 実装手順

### 6.1. 基本実装
1. usersテーブルに`isPro`カラム追加（マイグレーション）
2. 型定義（UserWithPro, MdDataCount等）追加
3. 認証コールバックでisProをJWT/Sessionに付与
4. mdData-crud.tsに保存上限判定関数追加・createMdData修正
5. display-sheet/index.tsxで新規作成ボタン制御・警告UI追加
6. custom-toast.tsで警告表示
7. 課金誘導UI（必要に応じモーダル等追加）

### 6.2. カウント表示追加実装
8. mdData-crud.tsにgetMdDataCount関数・上限値管理ロジック追加
9. `getMdDataCountAction.ts` サーバーアクション実装（mdData-crud.ts呼び出し・セッション管理）
10. `mdData-count-indicator` コンポーネント実装（「5/10件」表示）
11. display-sheet/index.tsxでサーバーアクション呼び出し・UI配置
12. 作成・削除後のリアルタイム更新ロジック追加（revalidatePath等）
13. テスト追加（サーバーアクション・mdData-crud.ts・コンポーネント）

## 7. 全体フロー（Mermaid）

```mermaid
flowchart TD
  A[新規作成ボタン押下] --> B{ログイン済み?}
  B -- No --> G[保存不可]
  B -- Yes --> C[getMdDatasで件数取得]
  C --> D{isPro?}
  D -- No --> E{件数>=10?}
  D -- Yes --> F{件数>=PRO_LIMIT?}
  E -- Yes --> H[警告・保存不可・課金誘導]
  E -- No --> I[保存実行]
  F -- Yes --> H
  F -- No --> I