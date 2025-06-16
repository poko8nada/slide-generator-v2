'use server'
import { upsertImageToDB, type ImageUpsertInput } from '@/lib/image-crud'
import type { Session } from 'next-auth'
import { revalidateTag } from 'next/cache'

export async function handleUpsertImagesToDB(
  imagePairs: {
    original: string
    uploaded: string
    cloudflareImageId: string
    hash?: string
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
      hash: pair.hash,
    }
    await upsertImageToDB(input, session)
  }
  revalidateTag('imageIds')
}
