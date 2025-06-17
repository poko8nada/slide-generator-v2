// const ALLOWED_HOSTS = process.env.ALLOWED_IMAGE_HOSTS?.split(',') ?? []

/**
 * 全てのホストを許可する（開発用）
 */
export function isAllowedHost(_hostname: string): boolean {
  // return ALLOWED_HOSTS.some(
  //   allowed => hostname === allowed || hostname.endsWith(`.${allowed}`),
  // )
  return true
}
