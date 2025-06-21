// ブラックリストは環境変数から取得（カンマ区切り）
const BLACKLISTED_HOSTS = process.env.BLACKLISTED_HOSTS_LIST?.split(',') ?? []
console.log('BLACKLISTED_IMAGE_HOSTS', BLACKLISTED_HOSTS)

/**
 * ブラックリストに含まれるホストを弾く
 */
export function isAllowedHost(hostname: string): boolean {
  if (hostname.endsWith('.onion')) {
    return false
  }
  if (
    BLACKLISTED_HOSTS.some(
      blocked => hostname === blocked || hostname.endsWith(`.${blocked}`),
    )
  ) {
    return false
  }
  return true
}
