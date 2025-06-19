'use server'

import { revalidateTag } from 'next/cache'
import type { Session } from 'next-auth'
import { createMdData } from '@/lib/mdData-crud'
import type { ServerResponseResult } from '@/lib/type'

export default async function handleCreateNewMdData(
  session: Session | null,
): Promise<ServerResponseResult> {
  try {
    await createMdData(session)
    revalidateTag('mdDatas')
    return {
      status: 'success',
      message: '新規作成に成功しました。',
    }
  } catch (error) {
    return {
      status: 'error',
      message: String(error) || '新規作成に失敗しました。',
    }
  }
}
