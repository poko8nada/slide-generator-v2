// レスポンスタイプ定義
export type ServerResponseResult =
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }

// /api/documents/save 用レスポンス型
export type SaveMarkdownResponse =
  | { markdown: string; urls: string[] }
  | { error: string }
