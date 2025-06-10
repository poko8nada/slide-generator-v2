const ALLOWED_HOSTS = process.env.ALLOWED_IMAGE_HOSTS?.split(',') ?? []

/**
 * 指定されたホスト名がホワイトリストに含まれるかどうかを判定する。
 * サブドメイン対応：example.com → *.example.com も許可
 */
export function isAllowedHost(hostname: string): boolean {
  return ALLOWED_HOSTS.some(
    allowed => hostname === allowed || hostname.endsWith(`.${allowed}`),
  )
}
