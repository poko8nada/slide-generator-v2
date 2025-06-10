# Cloudflare Imagesを活用したNext.js画像管理システム概要

## 1. サービス要件

* **ベースシステム:** Next.jsで開発中のWebサービス
* **コンテンツ:** Markdown形式のスライド
* **Markdownエディタ:** [easy-markdown-editor](https://github.com/Ionaru/easy-markdown-editor)
* **スライド生成:** [reveal.js](https://revealjs.com/)
* **画像挿入方法:** Markdownエディタを通じて、ローカルファイル（Blobなど）または外部URLの画像を埋め込み
* **画像の保存場所:** Cloudflare Images

### 既存の機能と要件

* 非ログインユーザーはセッション内でMarkdownを編集し、スライドをPDFとしてダウンロード可能。
* ログインユーザー向けにMarkdownの保存機能を実装中（現在上限10個）。
* ログインユーザー向けに画像保存機能を実装中。
* **重要要件:** Markdownに保存した画像は、ブラウザで直接URLを叩いても表示されないが、Webサービス内で表示される場合は適切に表示されるようにする。
* **追加要件:** 1つのMarkdownコンテンツに使用できる画像の枚数にも上限を設定する。

---

## 2. 主要な機能とデータフロー

### 2.1. 画像アップロード・置換プロセス（「保存」ボタン押下時）

ユーザーがMarkdownエディタでコンテンツを編集し、「保存」ボタンを押した際に画像処理が実行されます。

1.  **クライアントサイド（Markdownエディタ: `easy-markdown-editor`）:**
    * ユーザーがローカルファイルをドラッグ＆ドロップまたは選択した場合、JavaScriptでその画像を読み込み、**Blob URL** (`URL.createObjectURL()`) を生成します。
    * このBlob URLを含む仮の画像タグ（例: `![Alt Text](blob:http://localhost/unique-id)`）をMarkdown内に挿入し、リアルタイムプレビュー（`reveal.js`）で表示します。
    * **重要:** このBlob URLと、それに対応する元の `File` または `Blob` オブジェクトを、クライアントサイドのメモリ（例: `useRef`で保持する `Map<string, File | Blob>`）に一時的に保存しておきます。
    * ユーザーが外部URLをペーストした場合、元の外部URL（例: `![Alt Text](https://example.com/external.jpg)`）をそのままMarkdown内に挿入し、リアルタイムプレビューで表示します。
    * この時点では、Markdown内の画像URLはまだ**仮のURL**（Blob URLまたは外部URL）です。

2.  **クライアントサイド（「保存」ボタン押下時）:**
    * 現在のMarkdownコンテンツを取得し、`remark`などのライブラリを用いて、Cloudflare ImagesのURLではない画像URL（`blob:`で始まるもの、または `http(s):`で始まるもの）を検出します。
    * 検出した各画像URLについて、**Next.jsのAPI Route (`/api/images/upload`) を非同期で呼び出し、画像をアップロード/インポートします。**
        * **Blob URLの場合:** 一時保存していた対応する `File` / `Blob` オブジェクトを `multipart/form-data` としてAPI Routeに送信します。
        * **外部URLの場合:** そのURLをJSON形式でAPI Routeに送信します。
    * API Routeからのレスポンスで、Cloudflare Imagesから発行された**署名なしのURL**（例: `https://imagedelivery.net/ACCOUNT_HASH/IMAGE_ID/public`）を受け取ります。
    * 元のMarkdown内の仮の画像URL（Blob URLや外部URL）を、この新しい**署名なしのCloudflare Images URL**に置換します。
    * **すべての画像URLの置換が完了したら、** その最終的なMarkdownコンテンツを、データベース保存用の別のNext.js API Route（例: `/api/slides/save`）に送信します。

3.  **サーバーサイド（`/api/images/upload` API Route）での処理:**
    * クライアントから送信された画像データ（`File`/`Blob`）または外部URLを受け取ります。
    * **認証チェック:** リクエストを送信しているユーザーが**ログインしており、画像アップロードの権限を持っているか**を厳しくチェックします。
    * Cloudflare Images APIを呼び出し、画像をアップロード/インポートします。この際、**`requireSignedURLs: true`** オプションを設定し、アップロードされる画像が署名なしではアクセスできないようにします。
    * アップロードが成功すると、Cloudflare Imagesから返される**署名なしのURL**をクライアントに返します。

### 2.2. Markdownコンテンツの表示プロセス

ユーザーが保存されたスライドを閲覧する際に、画像が正しく表示されるように処理されます。

1.  **サーバーサイド（Next.jsのデータフェッチ: `getServerSideProps` / Server Components）:**
    * データベースから、**署名なしのCloudflare Images URLを含むMarkdownコンテンツ**を読み込みます。
    * `remark`などのライブラリでMarkdownをパースし、含まれている署名なしのCloudflare Images URLを検出します。
    * 検出した各URLに対し、Cloudflare Imagesの**署名用秘密鍵**（サーバーサイドでのみアクセス可能）を使用して、**その時点での新しい有効期限を持つ署名付きURL**を生成します。
    * 有効期限は、アプリケーションの要件（例: 数分から数時間程度）に応じて設定します。
    * 生成された署名付きURLでMarkdown内の対応するURLを置換し、最終的なMarkdownコンテンツ（またはそれをHTMLに変換したもの）をクライアントサイドに送信します。

2.  **クライアントサイド（ブラウザ / `reveal.js`）:**
    * ブラウザは、サーバーから受け取ったHTML（またはMarkdownから変換されたHTML）をレンダリングし、`reveal.js`がスライドを表示します。
    * HTML内の`<img>`タグの`src`属性には、有効な署名付きURLが設定されているため、ブラウザはそのURLをリクエストし、Cloudflare Imagesから画像を読み込んで表示します。

---

## 3. セキュリティとコスト管理に関する対策

1.  **認証・認可 (最重要):**
    * **画像アップロード時:** Next.js API Route (`/api/images/upload`) にて、リクエストユーザーが**ログイン済みかつアップロード権限があるか**を厳格にチェックします。
    * **Markdown保存時:** データベース保存用のAPI Route (`/api/slides/save`) にて、リクエストユーザーが**ログイン済みかつ保存権限があるか**を厳格にチェックします。
    * **APIトークンと秘密鍵の管理:** Cloudflare APIトークンと署名用秘密鍵は、必要最小限の権限を与え、**絶対にクライアントサイドに公開せず**、サーバーサイドの環境変数として安全に管理します。

2.  **署名付きURL (Signed URLs):**
    * すべての画像を `requireSignedURLs: true` としてアップロードすることで、**署名なしのURLをブラウザで直接叩いても画像は表示されません**（通常はHTTP 403 Forbidden）。
    * 画像表示時には、サーバーサイドで**有効期限付きの署名付きURL**を生成して利用します。これにより、
        * URLが外部に流出しても、**有効期限が切れると無効になります**。
        * 他のサイトからの直接リンク（ホットリンク）を防止できます。
        * ページをリロードするたびに新しい署名付きURLが発行されるため、古いURLがいつまでも使われ続けることはありません。

3.  **コンテンツフィルタリングとリソース制限:**
    * **ファイルタイプ制限:** アップロードを許可する画像ファイルのタイプ（JPEG, PNG, WebPなど）をAPI Routeで厳しく制限します。
    * **ファイルサイズ制限:** Cloudflare Imagesの制限に加え、API Routeで独自のファイルサイズ上限を設定します。
    * **Markdownあたりの画像枚数制限:** 1つのMarkdownコンテンツに含めることができる画像の最大枚数を、サーバーサイド（Markdown保存用API Route）で設定・チェックし、上限を超えた場合は拒否します。これは、コスト管理、パフォーマンス維持、および悪用防止に非常に有効です。
    * **ユーザーごとのMarkdown保存上限:** 既存のユーザーあたりのMarkdown保存上限（10個）と組み合わせることで、リソースの悪用をより効果的に防ぎます。

---

## 4. 実装の補足事項

* **Markdownパーサー:** `remark` (unifiedjs) ライブラリは、Markdownの解析とAST（Abstract Syntax Tree）操作に非常に強力で推奨されます。
* **HTTPクライアント:** Next.js API RouteからCloudflare Images APIを呼び出す際に、`axios`や標準の`fetch`を利用できます。
* **`multipart/form-data`の処理:** Next.js API Routeでファイルアップロード（`multipart/form-data`）を処理する場合、`formidable`のようなサーバーサイドライブラリの利用が便利です。
* **ユーザー体験 (UX):**
    * 「保存」ボタン押下時に、画像のアップロードおよびMarkdown保存が完了するまで時間がかかる可能性があるため、ユーザーに処理中であることを示すローディング表示を行うことが必須です。
    * エラー発生時には、具体的なメッセージ（例: 「画像枚数が上限を超えています」）をユーザーに伝えます。
    * 編集中のリアルタイムプレビューでは、Blob URLを利用することで、アップロード前の画像をスムーズに表示できます。