'use server'

import { revalidateTag } from 'next/cache'
import { createSlide } from '@/lib/slide-crud'
import { toastError } from '@/components/custom-toast'
import type { Session } from 'next-auth'

export default async function handleCreateNewSlide(session: Session | null) {
  try {
    await createSlide(session)
    revalidateTag('slides')
  } catch (e) {
    toastError(e instanceof Error ? e : new Error('スライド作成に失敗しました'))
  }
}
