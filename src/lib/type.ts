type serverResponseResult =
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }

export type { serverResponseResult }
