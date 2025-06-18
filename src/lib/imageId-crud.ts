'use server'
import { db, images } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import type { Session } from 'next-auth'
import { unstable_cache } from 'next/cache'
import { FREE_IMAGE_LIMIT, PRO_IMAGE_LIMIT } from './constants'

export type ImageUpsertInput = {
  cloudflareImageId: string
  userId: string
  originalFilename?: string
  fileSize?: number
  contentType?: string
  hash?: string
}

export async function upsertImageId(
  input: ImageUpsertInput,
  session: Session | null,
) {
  if (!input.cloudflareImageId || !input.userId) {
    throw new Error('cloudflareImageIdとuserIdは必須です')
  }
  // 制限チェック
  const canUpsert = await canUpsertImageId(session)
  if (!canUpsert) {
    throw new Error(
      '画像アップロード上限に達しています。不要な画像を削除してください。',
    )
  }
  // drizzle-ormのonConflictDoUpdateを利用
  await db
    .insert(images)
    .values({
      cloudflareImageId: input.cloudflareImageId,
      userId: input.userId,
      originalFilename: input.originalFilename ?? '',
      fileSize: input.fileSize ?? 0,
      contentType: input.contentType ?? '',
      hash: input.hash ?? null,
      createdAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [images.cloudflareImageId, images.userId],
      set: {
        originalFilename: input.originalFilename ?? '',
        fileSize: input.fileSize ?? 0,
        contentType: input.contentType ?? '',
        hash: input.hash ?? null,
        createdAt: new Date(),
      },
    })
}

/**
 * 画像ハッシュで既存画像を検索
 */
export async function findImageIdByHash(hash: string) {
  const result = await db
    .select({
      cloudflareImageId: images.cloudflareImageId,
      userId: images.userId,
      originalFilename: images.originalFilename,
      fileSize: images.fileSize,
      contentType: images.contentType,
      hash: images.hash,
      createdAt: images.createdAt,
    })
    .from(images)
    .where(eq(images.hash, hash))
    .limit(1)

  return result[0] ?? null
}

// 画像アップサート可能か判定
export async function canUpsertImageId(
  session: Session | null,
): Promise<boolean> {
  if (!session?.user) return false
  const imageIds = await getCloudFlareImageIds(session)
  const currentCount = imageIds.length
  return session.user.isPro
    ? currentCount < PRO_IMAGE_LIMIT
    : currentCount < FREE_IMAGE_LIMIT
}

// CloudflareImageIdを取得
export const getCloudFlareImageIds = unstable_cache(
  async (session: Session | null) => {
    if (!session?.user?.id) {
      return []
    }

    return await db
      .select({
        cloudflareImageId: images.cloudflareImageId,
      })
      .from(images)
      .where(eq(images.userId, session.user.id))
  },
  ['imageIds'],
  {
    tags: ['imageIds'],
  },
)

/**
 * 画像をCloudflareImageIdとuserIdで削除
 */
export async function deleteImageId(
  cloudflareImageId: string,
  session: Session | null,
) {
  if (!cloudflareImageId || !session?.user?.id) {
    throw new Error('cloudflareImageIdとユーザーセッションは必須です')
  }

  await db
    .delete(images)
    .where(
      and(
        eq(images.cloudflareImageId, cloudflareImageId),
        eq(images.userId, session.user.id),
      ),
    )
}
