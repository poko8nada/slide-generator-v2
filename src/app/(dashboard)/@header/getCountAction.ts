import type { Session } from 'next-auth'
import {
  FREE_MD_LIMIT,
  PRO_MD_LIMIT,
  FREE_IMAGE_LIMIT,
  PRO_IMAGE_LIMIT,
} from '@/lib/constants'

// type: 'mdData' | 'image' でリミットを自動で切り替え
export function getCountInfo<T>({
  session,
  items,
  type,
}: {
  session: Session | null
  items: T[]
  type: 'mdData' | 'image'
}) {
  const isPro = !!session?.user?.isPro
  let limit = 0
  if (type === 'mdData') {
    limit = isPro ? PRO_MD_LIMIT : FREE_MD_LIMIT
  } else {
    limit = isPro ? PRO_IMAGE_LIMIT : FREE_IMAGE_LIMIT
  }
  return {
    current: items.length,
    limit,
    isPro,
  }
}
