'use server'
import { getMdDatas } from '@/lib/mdData-crud'
import { FREE_LIMIT, PRO_LIMIT } from '@/lib/mdData-constants'
import type { Session } from 'next-auth'

export async function getMdDataCountAction(session: Session | null) {
  if (!session?.user?.id) {
    return { current: 0, limit: FREE_LIMIT, isPro: false }
  }

  const mdDatas = await getMdDatas(session)
  const isPro = !!session.user?.isPro
  const limit = isPro ? PRO_LIMIT : FREE_LIMIT

  return {
    current: mdDatas.length,
    limit,
    isPro,
  }
}
