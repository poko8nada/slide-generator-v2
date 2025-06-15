// レスポンスタイプ定義
export type ServerResponseResult =
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }

// /api/documents/save 用レスポンス型
export type SaveMarkdownResponse =
  | { markdown: string; urls: string[] }
  | { error: string }

// 型を宣言
export type UploadedImageResult = {
  original: string
  uploaded: string
  cloudflareImageId: string
  hash?: string
}

export type PostResponse =
  | {
      urls: UploadedImageResult[]
      failed?: { original: string; error: string }[]
    }
  | { error: string }
