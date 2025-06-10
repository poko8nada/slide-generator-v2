'use server'

import { revalidateTag } from 'next/cache'
import { createMdData } from '@/lib/mdData-crud'
import { toastError } from '@/components/custom-toast'
import type { Session } from 'next-auth'

export default async function handleCreateNewMdData(session: Session | null) {
  try {
    await createMdData(session)
    revalidateTag('mdDatas')
  } catch (e) {
    toastError(e instanceof Error ? e : new Error('作成に失敗しました'))
  }
}
