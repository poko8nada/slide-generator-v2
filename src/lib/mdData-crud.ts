'use server'
import { db, mdDatas } from '@/db/schema'
import { desc, eq, and } from 'drizzle-orm'
import type { Session } from 'next-auth'
import { unstable_cache } from 'next/cache'
import { revalidateTag } from 'next/cache'
import { FREE_LIMIT, PRO_LIMIT } from './mdData-constants'
import type { InferSelectModel } from 'drizzle-orm'

export type MdData = InferSelectModel<typeof mdDatas>

export async function canCreateMdData(
  user: Session['user'],
  currentCount: number,
): Promise<boolean> {
  if (!user) return false
  return user.isPro ? currentCount < PRO_LIMIT : currentCount < FREE_LIMIT
}

export const getMdDatas = unstable_cache(
  async (session: Session | null): Promise<MdData[]> => {
    if (!session?.user?.id) {
      console.log('[getMdDatas] session.user.id is missing')
      return []
    }
    try {
      const result = await db
        .select()
        .from(mdDatas)
        .where(eq(mdDatas.userId, session.user.id))
        .orderBy(desc(mdDatas.updatedAt))
      return result
    } catch (_e) {
      throw new Error('[getMdDatas] error')
    }
  },
  ['mdDatas'],
  {
    tags: ['mdDatas'],
  },
)

/**
 * mdData本文からタイトルを生成
 */
export async function createMdDataTitleByBody(body: string): Promise<string> {
  const trimmedBody = body.trim()
  if (!trimmedBody) return 'Untitled'

  const firstMdData = trimmedBody.split(/(?<=\n|^)---(?=\n|$)/)[0]
  const cleanText = firstMdData
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

export async function updateMdData(
  id: string,
  body: string,
  session: Session | null,
) {
  if (!session?.user?.id) {
    throw new Error('ユーザー情報がありません（未ログイン）')
  }
  try {
    const title = await createMdDataTitleByBody(body)
    await db
      .update(mdDatas)
      .set({ title, body, updatedAt: new Date() })
      .where(eq(mdDatas.id, String(id)))
    revalidateTag('mdDatas')
  } catch (e) {
    throw e instanceof Error ? e : new Error('mdData保存に失敗しました')
  }
}

export async function createMdData(
  session: Session | null,
  title = 'New mdData',
): Promise<MdData> {
  const user = session?.user

  if (!user?.id) {
    throw new Error('ユーザー情報がありません（未ログイン）')
  }

  const currentCount = await db
    .select()
    .from(mdDatas)
    .where(eq(mdDatas.userId, user.id))
    .then(rows => rows.length)
  if (!canCreateMdData(user, currentCount)) {
    throw new Error(
      user.isPro
        ? `保存上限(${PRO_LIMIT})に達しています`
        : `保存上限(${FREE_LIMIT})に達しています`,
    )
  }
  try {
    const date = new Date()
    const [inserted] = await db
      .insert(mdDatas)
      .values({
        userId: user.id,
        title,
        body: '',
        createdAt: date,
        updatedAt: date,
      })
      .returning()
    if (!inserted) {
      throw new Error('mdData作成に失敗しました')
    }
    return inserted
  } catch (e) {
    throw e instanceof Error ? e : new Error('mdData作成に失敗しました')
  }
}
/**
 * mdData削除（認証・権限チェック、削除後revalidateTag）
 */
export async function deleteMdData(id: string, session: Session | null) {
  if (!session?.user?.id) {
    throw new Error('ユーザー情報がありません（未ログイン）')
  }
  try {
    // 権限チェック: 自分のmdDataのみ削除可
    const result = await db
      .delete(mdDatas)
      .where(
        and(eq(mdDatas.id, String(id)), eq(mdDatas.userId, session.user.id)),
      )
    if (!result) {
      throw new Error('mdDataが見つからないか、権限がありません')
    }
    revalidateTag('mdDatas')
  } catch (e) {
    throw e instanceof Error ? e : new Error('mdData削除に失敗しました')
  }
}
