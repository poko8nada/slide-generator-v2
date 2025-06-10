'use server'

import { revalidateTag } from 'next/cache'
import { createMdData } from '@/lib/mdData-crud'
import type { Session } from 'next-auth'
import type { serverResponseResult } from '@/lib/type'

export default async function handleCreateNewMdData(
  session: Session | null,
): Promise<serverResponseResult> {
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
