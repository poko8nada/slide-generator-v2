# 画像アップロード機能 実装ガイド

## プロジェクト概要

- **構成**: Next.js 15 + Easy Markdown Editor + Reveal.js + AuthJS + Drizzle + Turso + Cloudflare Images
- **デプロイ**: OpenNext + Cloudflare Workers
- **目的**: Markdownエディタで画像編集時はblob/外部URL表示、保存時に画像をCloudflareにアップロードし、認証付きAPI経由のURLに置換

## 実装フロー（保存時の全体像）

1. **ユーザーが保存ボタンを押す**
   - EditMarkdown の `<Form action={...}>` が発火

2. **フロントエンドで画像収集・FormData生成**
   - Markdown本文（mdData.body）を取得
   - Markdown内の画像URL（blob/external）を抽出
   - 画像ファイル（File/Blob）を FormData に `images[0]`, `images[1]` ... で追加
   - 元画像URLを `imageUrls[0]`, `imageUrls[1]` ... で追加
   - 必要なら `documentId` も追加
   - API（/api/documents/save）にFormDataをPOST

3. **サーバー側でFormData受信・バリデーション**
   - 認証・画像数・サイズチェック
   - 画像ファイルと元画像URLの対応を確認

4. **Cloudflare Imagesへ画像アップロード**
   - 画像ごとにCloudflareへアップロード
   - Cloudflareの画像ID（またはURL）を取得

5. **DBに画像情報を保存（upsert）**
   - 画像ID（cloudflareImageId）＋userId＋documentId で一意に保存
   - 既存ならupdate、なければinsert

6. **Markdown内の画像URLを `/api/images/[imageId]` 形式に置換**
   - 例: `![alt](blob:...)` → `![alt](/api/images/cf-img-001)`

7. **置換済みMarkdownをDBに保存（updateMdData）**

8. **APIレスポンスで置換済みMarkdownと画像IDリスト（または元画像URLと新画像ID/URLのペア配列）を返す**

9. **フロントエンドでMarkdownを更新し、トースト表示などUI更新**

---

## ポイント

- Cloudflare画像ID（cloudflareImageId）をDBのユニークキーにすることで重複管理が容易
- Markdownには「Cloudflare直URL」ではなく「認証付きAPI経由のURL」を埋め込む
- 画像アクセスは `/api/images/[imageId]` で認証・権限チェック
- 画像DBはupsertで管理
- レスポンスで「元画像URLと新画像ID/URLのペア配列」を返すと、クライアントでも柔軟に扱える

---

## 参考: FormData構造例

```
FormData {
  "images[0]": File/Blob object
  "images[1]": File/Blob object
  "imageUrls[0]": 元のURL（置換用）
  "imageUrls[1]": 元のURL（置換用）
}
```

---

## 参考: APIレスポンス例

```json
{
  "urls": [
    { "original": "blob:...", "uploaded": "/api/images/cf-img-001", "cloudflareImageId": "cf-img-001" },
    { "original": "https://example.com/image.jpg", "uploaded": "/api/images/cf-img-002", "cloudflareImageId": "cf-img-002" }
  ]
}
```

---

## 注意点・考慮事項

- 配列順序の維持: FormDataの画像とURLの対応関係
- 部分失敗時のハンドリング: 一部画像のアップロードが失敗した場合の処理
- プログレス表示: UX向上のため進捗表示を検討
- エラーメッセージ: ユーザーにわかりやすいエラー通知
- ファイル形式・サイズ制限、CSRF対策、画像メタデータ除去などセキュリティ面も考慮

---

## 将来的な改善・最適化

- 画像重複検知（SHA-256ハッシュ等）
- 画像削除の自動化（未使用画像の定期クリーンアップ）
- 画像圧縮・プログレッシブアップロード
- 画像編集・AIによるalt自動生成・バージョン管理