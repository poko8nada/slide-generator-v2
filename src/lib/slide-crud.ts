'use server'
import { db, slides } from '@/db/schema'
import { desc, eq, and } from 'drizzle-orm'
import type { Session } from 'next-auth'
import { unstable_cache } from 'next/cache'
import { revalidateTag } from 'next/cache'

export type Slide = typeof slides.$inferSelect

export const getSlides = unstable_cache(
  async (session: Session | null): Promise<Slide[]> => {
    if (!session?.user?.id) {
      console.log('[getSlides] session.user.id is missing')
      return []
    }
    try {
      const result = await db
        .select()
        .from(slides)
        .where(eq(slides.userId, session.user.id))
        .orderBy(desc(slides.updatedAt))
      return result
    } catch (_e) {
      throw new Error('[getSlides] error')
    }
  },
  ['slides'],
  {
    tags: ['slides'],
  },
)

/**
 * スライド本文からタイトルを生成
 */
export async function createTitleByBody(body: string): Promise<string> {
  const trimmedBody = body.trim()
  if (!trimmedBody) return 'Untitled'

  const firstSlide = trimmedBody.split(/(?<=\n|^)---(?=\n|$)/)[0]
  const cleanText = firstSlide
    .replace(/^#+\s*/, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/!\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*\|.*\|\s*$/gm, '')
    .replace(/^\s*\|?[-: ]+\|?\s*$/gm, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return cleanText.length > 30
    ? `${cleanText.slice(0, 30)}...`
    : cleanText || 'Untitled'
}

export async function updateSlide(
  id: string,
  body: string,
  session: Session | null,
) {
  if (!session?.user?.id) {
    throw new Error('ユーザー情報がありません（未ログイン）')
  }
  try {
    const title = await createTitleByBody(body)
    await db
      .update(slides)
      .set({ title, body, updatedAt: new Date() })
      .where(eq(slides.id, String(id)))
    revalidateTag('slides')
  } catch (e) {
    throw e instanceof Error ? e : new Error('スライド保存に失敗しました')
  }
}

export async function createSlide(
  session: Session | null,
  title = 'New slide',
): Promise<Slide> {
  if (!session?.user?.id) {
    throw new Error('ユーザー情報がありません（未ログイン）')
  }
  try {
    const date = new Date()
    const [inserted] = await db
      .insert(slides)
      .values({
        userId: session.user.id,
        title,
        body: '',
        createdAt: date,
        updatedAt: date,
      })
      .returning()
    if (!inserted) {
      throw new Error('スライド作成に失敗しました')
    }
    return inserted
  } catch (e) {
    throw e instanceof Error ? e : new Error('スライド作成に失敗しました')
  }
}
/**
 * スライド削除（認証・権限チェック、削除後revalidateTag）
 */
export async function deleteSlide(id: string, session: Session | null) {
  if (!session?.user?.id) {
    throw new Error('ユーザー情報がありません（未ログイン）')
  }
  try {
    // 権限チェック: 自分のスライドのみ削除可
    const result = await db
      .delete(slides)
      .where(and(eq(slides.id, String(id)), eq(slides.userId, session.user.id)))
    if (!result) {
      throw new Error('スライドが見つからないか、権限がありません')
    }
    revalidateTag('slides')
  } catch (e) {
    throw e instanceof Error ? e : new Error('スライド削除に失敗しました')
  }
}
