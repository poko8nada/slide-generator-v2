'use server'
import { db, images } from '@/db/schema'

export type ImageUpsertInput = {
  cloudflareImageId: string
  userId: string
  documentId?: string
  originalFilename?: string
  fileSize?: number
  contentType?: string
}

/**
 * Cloudflare画像ID・ユーザーID・ドキュメントIDでupsert（存在すればupdate、なければinsert）
 */
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
      documentId: input.documentId ?? '',
      originalFilename: input.originalFilename ?? '',
      fileSize: input.fileSize ?? 0,
      contentType: input.contentType ?? '',
      createdAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [images.cloudflareImageId, images.userId, images.documentId],
      set: {
        originalFilename: input.originalFilename ?? '',
        fileSize: input.fileSize ?? 0,
        contentType: input.contentType ?? '',
        createdAt: new Date(),
      },
    })
}
