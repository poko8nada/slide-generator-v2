'use server'

import { revalidateTag } from 'next/cache'
import { deleteSlide } from '@/lib/slide-crud'
import type { Session } from 'next-auth'

export default async function handleDeleteSlide(
  id: string,
  session: Session | null,
) {
  try {
    await deleteSlide(id, session)
    revalidateTag('slides')
  } catch (e) {
    throw e instanceof Error ? e : new Error('削除に失敗しました')
  }
}
