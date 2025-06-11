'use server'

import { revalidateTag } from 'next/cache'
import { deleteMdData } from '@/lib/mdData-crud'
import type { Session } from 'next-auth'
import type { ServerResponseResult } from '@/lib/type'

export default async function handleDeleteMdData(
  id: string,
  session: Session | null,
): Promise<ServerResponseResult> {
  try {
    await deleteMdData(id, session)
    revalidateTag('mdDatas')
    return {
      status: 'success',
      message: '削除しました。',
    }
  } catch (e) {
    return {
      status: 'error',
      message: String(e) || '削除に失敗しました。',
    }
  }
}
