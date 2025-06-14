'use server'
import { upsertImageToDB, type ImageUpsertInput } from '@/lib/image-crud'
import type { Session } from 'next-auth'

/**
 * Cloudflareアップロード後の画像ペア配列をDBにupsertする
 * @param imagePairs APIから返却された { original, uploaded, cloudflareImageId }[]
 * @param session next-authのSession
 * @param metaMap 画像URL→{originalFilename, fileSize, contentType} のMap（任意）
 */
export async function handleUpsertImagesToDB(
  imagePairs: {
    original: string
    uploaded: string
    cloudflareImageId: string
  }[],
  session: Session | null,
  metaMap?: Map<
    string,
    { originalFilename?: string; fileSize?: number; contentType?: string }
  >,
) {
  if (!session?.user?.id)
    throw new Error('ユーザー情報がありません（未ログイン）')
  for (const pair of imagePairs) {
    const meta = metaMap?.get(pair.original) ?? {}
    const input: ImageUpsertInput = {
      cloudflareImageId: pair.cloudflareImageId,
      userId: session.user.id,
      originalFilename: meta.originalFilename,
      fileSize: meta.fileSize,
      contentType: meta.contentType,
    }
    await upsertImageToDB(input)
  }
}
