# slide / mdData 用語整理・リファクタ手順

## 1. 用語定義
- **mdData**: DB保存のMarkdown全体（編集・CRUD・一覧表示対象）
- **slide**: mdDataをreveal等で変換した「1枚分スライド」またはその集合（表示・操作対象）

## 2. mdData命名修正対象（DB・データ管理・md一覧表示責務）
- [`src/feature/display-sheet/index.tsx`](src/feature/display-sheet/index.tsx)
- [`src/feature/display-sheet/handle-create-newSlide.ts`](src/feature/display-sheet/handle-create-newSlide.ts)
- [`src/feature/display-slideItem-onSheet/index.tsx`](src/feature/display-slideItem-onSheet/index.tsx)
- [`src/feature/display-slideItem-onSheet/handle-delete-slide.ts`](src/feature/display-slideItem-onSheet/handle-delete-slide.ts)
- [`src/feature/edit-markdown/markdownAction.ts`](src/feature/edit-markdown/markdownAction.ts)
- [`src/lib/slide-crud.ts`](src/lib/slide-crud.ts)
- [`src/lib/relative-md-data-pvd.ts`](src/lib/relative-md-data-pvd.ts)
- [`src/providers/md-data-provider.tsx`](src/providers/md-data-provider.tsx)

## 3. slide命名維持（UI/状態管理/一時操作責務）
- [`src/feature/display-slide/index.tsx`](src/feature/display-slide/index.tsx)
- [`src/providers/slide-container-provider.tsx`](src/providers/slide-container-provider.tsx)
- [`src/providers/slide-snap-provider.tsx`](src/providers/slide-snap-provider.tsx)

## 4. ファイル名リネーム対象（slide→mdData）
- [`src/lib/slide-crud.ts`](src/lib/slide-crud.ts) → mdData-crud.ts

---

## 5. リファクタ実施手順（全手順でユーザー確認必須）

### 1. DBスキーマ・型定義のリネーム
- **ユーザー確認**: テーブル・型・マイグレーション内容を必ずプレビュー・承認
- slidesテーブル名・型名・カラム名等をmdData系へリネーム
- マイグレーションファイル作成・適用
- 影響範囲（drizzle, schema.ts等）を洗い出し

### 2. 永続層・データ取得/保存ロジックのリネーム
- **ユーザー確認**: 関数名・型名・import/exportの変更内容を必ずプレビュー・承認
- [`src/lib/slide-crud.ts`]をmdData-crud.tsへリネーム
- CRUD関数・型・引数・戻り値・import/export全てmdData系へ統一

### 3. Provider/Context/データ流通層のリネーム
- **ユーザー確認**: Provider/Context名・型名の変更内容を必ずプレビュー・承認
- [`src/providers/md-data-provider.tsx`]等でslide→mdDataへ型・props・context名を統一

### 4. Feature/Component/Handler層のリネーム
- **ユーザー確認**: ファイル名・コンポーネント名・props名・型名の変更内容を必ずプレビュー・承認
- display-slideItem-onSheet配下のindex.tsx, handle-*.ts, custom-slideItem.tsx等でslide→mdDataへ型・props・変数・ファイル名を統一

### 5. その他lib/utility層のリネーム
- **ユーザー確認**: 変更内容を必ずプレビュー・承認
- relative-md-data-pvd.ts等でslide→mdDataへ型・関数・変数名を統一

### 6. テスト・動作確認
- 全リネーム箇所のテストケース修正・動作確認
- **ユーザー確認**: テスト結果・動作確認内容を必ずレビュー・承認

---

## 6. 注意点
- 各工程で必ずユーザーに具体的な変更内容を提示し、承認を得てから次工程へ進むこと
- 影響範囲が広いため段階的にコミット推奨