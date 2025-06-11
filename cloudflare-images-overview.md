# 画像アップロード機能実装ガイド

## プロジェクト概要

- **構成**: Next.js 15 + Easy Markdown Editor + Reveal.js + AuthJS + Drizzle + Turso + Cloudflare Images
- **デプロイ**: OpenNext + Cloudflare Workers
- **目的**: MDエディタでの画像編集時はblob/外部URL表示、MD保存時に画像をアップロードしてURL置換

## 実装方針

### 基本戦略
- **パターンA**: フロントエンドで画像収集 → サーバーに一括送信
- **重複処理**: 初期は無視（後で最適化）
- **画像削除**: 放置（月1程度でクリーンアップバッチ）
- **悪用防止**: MDあたりの画像数上限（10-20枚推奨）

### セキュリティ対策
- 直接画像URLアクセスを防ぐため、認証付きAPI経由でのみ画像配信
- ユーザーあたりの画像数上限設定
- ファイルサイズ・形式制限

## 実装手順

### 1. フロントエンド実装

#### 1.1 既存データの活用
- **編集中**: 既に実装済みのblob化・外部URLプロキシを活用
- **保存時**: 既存のFile objects/Blobデータを再利用

#### 1.2 MD保存処理
1. MD内の画像URL抽出（正規表現）
2. 画像数上限チェック
3. 各URLに対応するFile/Blobオブジェクトを特定
4. FormDataに画像データとメタデータを格納
5. サーバーに一括送信

#### 1.3 FormData構造
```
FormData {
  "markdown": MDテキスト全体
  "images[0]": File/Blob object
  "images[1]": File/Blob object
  "imageUrls[0]": 元のURL（置換用）
  "imageUrls[1]": 元のURL（置換用）
  "documentId": ドキュメントID
}
```

### 2. サーバーサイド実装

#### 2.1 API Route (`/api/documents/save`)
1. FormData受信・バリデーション
2. 画像数・サイズ制限チェック
3. 認証・権限確認
4. 画像アップロード処理
5. URL置換とMD変換をし、返却

#### 2.2 画像アップロード処理
1. `images[0]`, `images[1]`...を順番にCloudflare Imagesにアップロード
2. アップロード成功したURLを記録
3. MD内の`imageUrls[0]`, `imageUrls[1]`...を新URLで置換
4. 置換済みMDをDBに保存

#### 2.3 画像アクセス制御
- API Route (`/api/images/[imageId]`) で認証チェック
- ユーザーの画像アクセス権限確認
- Cloudflare Imagesから画像取得・レスポンス

#### 2.4 URL置換の仕様
**置換前（編集中）:**
```markdown
![スクリーンショット](blob:http://localhost:3000/12345-abcde)
![外部画像](https://example.com/image.jpg)
```

**置換後（保存後）:**
```markdown
![スクリーンショット](/api/images/cf-img-001)
![外部画像](/api/images/cf-img-002)
```

**アクセスフロー:**
1. ブラウザが `/api/images/cf-img-001` にリクエスト
2. API Routeで認証チェック
3. 権限OKなら Cloudflare Images から画像取得
4. 画像データをレスポンス

**プレビューURL（期間限定トークン付き）:**
```markdown
![画像](/api/images/cf-img-001?token=preview-12345)
```

### 3. データベース設計

#### 3.1 画像管理テーブル（Turso + Drizzle）

**スキーマ定義:**
```typescript
// schema.ts
export const images = sqliteTable('images', {
  id: text('id').primaryKey(),
  cloudflareImageId: text('cloudflare_image_id').notNull(),
  userId: text('user_id').notNull(),
  documentId: text('document_id').notNull(),
  originalFilename: text('original_filename'),
  fileSize: integer('file_size'),
  contentType: text('content_type'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`)
});

// インデックス
export const userIdIndex = index('idx_images_user_id').on(images.userId);
export const documentIdIndex = index('idx_images_document_id').on(images.documentId);
```

**クエリ例:**
```typescript
// ユーザーの画像数チェック
const userImageCount = await db
  .select({ count: count() })
  .from(images)
  .where(eq(images.userId, userId));

// ドキュメントの画像数チェック  
const docImageCount = await db
  .select({ count: count() })
  .from(images)
  .where(eq(images.documentId, documentId));
```

#### 3.2 テーブル更新タイミング

**基本的な更新タイミング:**
- **MD保存時**: 画像アップロード成功後に即座にINSERT
- **MD更新時**: 新しい画像のみINSERT、削除された画像はそのまま残す

**トランザクション管理:**
```typescript
// 推奨処理順序
await db.transaction(async (tx) => {
  // 1. 画像アップロード
  const uploadResults = await uploadImages(imageFiles);
  
  // 2. テーブルINSERT
  await tx.insert(images).values(uploadResults.map(result => ({
    id: generateId(),
    cloudflareImageId: result.id,
    userId,
    documentId,
    // その他のフィールド
  })));
  
  // 3. MD保存
  await tx.update(documents).set({ content: replacedMarkdown }).where(eq(documents.id, documentId));
});
```

**部分失敗時の対応:**
- アップロード済み画像が孤立した場合 → 定期クリーンアップで回収
- 削除処理は即座に行わず、月1回のバッチ処理で未使用画像を一括削除

## 注意点・考慮事項

### 開発時の注意点
1. **配列順序の維持**: FormDataの画像とURLの対応関係
2. **部分失敗ハンドリング**: 一部画像のアップロードが失敗した場合の処理
3. **プログレス表示**: UX向上のため進捗表示を検討
4. **エラーメッセージ**: ユーザーにわかりやすいエラー通知

### パフォーマンス考慮
- 大量画像時のアップロード時間
- 並列アップロード vs 順次アップロード
- ネットワーク帯域の消費量
- サーバーサイドの処理タイムアウト

### セキュリティ考慮
- ファイル形式の厳格なチェック
- ファイルサイズ制限の徹底
- 画像メタデータの除去
- CSRF対策

## 将来的な改善・最適化

### Phase 2: 効率化

#### 重複検知機能
- **検知方法**: SHA-256ハッシュでファイル内容を比較
- **テーブル拡張**: `file_hash` カラム追加
- **実装**: アップロード前に既存ハッシュをチェック、存在すれば既存画像URLを使い回し
- **権限考慮**: 同一ユーザー内のみ vs 全体での重複検知を選択

#### 画像削除の改善
**即座削除型:**
- 参照カウンタで管理
- 最後の参照削除時に即座削除
- ストレージ効率は良いが実装複雑

**GC型（推奨）:**
- 週1回：全MDスキャンで使用中画像をマーク
- 30日間未使用画像を自動削除
- 猶予期間があり安全

#### その他効率化
- **画像圧縮**: アップロード前の自動圧縮
- **プログレッシブアップロード**: 大きな画像の段階的アップロード

### Phase 3: 高度な機能
- **画像編集**: 基本的なクロップ・リサイズ機能
- **CDN最適化**: 地域別配信の最適化
- **画像分析**: AI による自動alt text生成
- **バージョン管理**: 画像の履歴管理

### Phase 4: 運用改善
- **自動クリーンアップ**: 未使用画像の定期削除
- **コスト最適化**: ストレージ使用量の監視・最適化
- **パフォーマンス監視**: 画像配信の速度監視
- **ユーザー分析**: 画像使用パターンの分析

## 運用・保守

### 定期メンテナンス
- **月1回**: 未使用画像のクリーンアップ
- **週1回**: ストレージ使用量の確認
- **日次**: エラーログの確認

### 監視項目
- 画像アップロード成功率
- 平均アップロード時間
- ストレージ使用量
- 帯域使用量
- エラー発生率

### バックアップ・災害対策
- 重要な画像データのバックアップ戦略
- Cloudflare Images の可用性監視
- 代替画像配信の準備

## 実装優先度

### 最優先 (MVP)
1. 基本的な画像アップロード機能
2. 画像数制限
3. 認証付き画像配信
4. エラーハンドリング

### 中優先
1. プログレス表示
2. 画像プレビュー改善
3. ファイルサイズ最適化
4. 基本的なクリーンアップ

### 低優先 (将来実装)
1. 重複検知
2. 高度な画像編集
3. AI機能
4. 詳細な分析機能