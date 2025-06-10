'use server'

import { revalidateTag } from 'next/cache'
import { deleteMdData } from '@/lib/mdData-crud'
import type { Session } from 'next-auth'

export default async function handleDeleteSlide(
  id: string,
  session: Session | null,
) {
  try {
    await deleteMdData(id, session)
    revalidateTag('mdDatas')
  } catch (e) {
    throw e instanceof Error ? e : new Error('削除に失敗しました')
  }
}
