'use server'

import { revalidateTag } from 'next/cache'
import { updateMdData } from '@/lib/mdData-crud'
import type { Session } from 'next-auth'
import type { ServerResponseResult } from '@/lib/type'

export default async function handleCreateNewMdData(
  id: string,
  body: string,
  session: Session | null,
): Promise<ServerResponseResult> {
  try {
    await updateMdData(id, body, session)
    revalidateTag('mdDatas')
    return {
      status: 'success',
      message: '保存しました。',
    }
  } catch (error) {
    return {
      status: 'error',
      message: String(error) || '保存に失敗しました。',
    }
  }
}
