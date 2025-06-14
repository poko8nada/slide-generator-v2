'use server'
import { db, images } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { Session } from 'next-auth'

export type ImageUpsertInput = {
  cloudflareImageId: string
  userId: string
  originalFilename?: string
  fileSize?: number
  contentType?: string
  hash?: string
}

export async function upsertImageToDB(input: ImageUpsertInput) {
  if (!input.cloudflareImageId || !input.userId) {
    throw new Error('cloudflareImageIdとuserIdは必須です')
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
export async function findImageByHash(hash: string) {
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

export async function getCloudFlareImageIds(session: Session | null) {
  if (!session?.user?.id) {
    return []
  }

  return await db
    .select({
      cloudflareImageId: images.cloudflareImageId,
    })
    .from(images)
    .where(eq(images.userId, session.user.id))
}
