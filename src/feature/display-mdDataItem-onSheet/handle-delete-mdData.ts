'use server'
import { revalidateTag } from 'next/cache'
import type { Session } from 'next-auth'
import { deleteMdData, getMdDatas, getOrCreateMdDatas } from '@/lib/mdData-crud'
import type { ServerResponseResult } from '@/lib/type'

export default async function handleDeleteMdData(
  id: string,
  session: Session | null,
): Promise<ServerResponseResult & { createdNew?: boolean }> {
  try {
    // 削除前の件数を取得
    const beforeCount = (await getMdDatas(session)).length
    await deleteMdData(id, session)
    // 削除後にゼロ件になった場合、自動で新規作成
    const after = await getOrCreateMdDatas(session)
    // 削除前が1件で、削除後に getOrCreateMdDatas で新規作成された場合
    const createdNew = beforeCount === 1 && after.length === 1
    revalidateTag('mdDatas')
    return {
      status: 'success',
      message: createdNew ? '削除し、新規作成しました。' : '削除しました。',
      createdNew,
    }
  } catch (e) {
    return {
      status: 'error',
      message: String(e) || '削除に失敗しました。',
    }
  }
}
