// サーバー側: mdData更新のみ
'use server'

import { revalidateTag } from 'next/cache'
import type { Session } from 'next-auth'
import { updateMdData } from '@/lib/mdData-crud'
import type { ServerResponseResult } from '@/lib/type'

/**
 * mdDataを更新し、キャッシュを再検証する
 */
export async function handleUpdateMdData(
  id: string,
  replacedMd: string,
  session: Session | null,
): Promise<ServerResponseResult> {
  try {
    await updateMdData(id, replacedMd, session)

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
