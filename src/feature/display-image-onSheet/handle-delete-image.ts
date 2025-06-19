'use server'
import { revalidateTag } from 'next/cache'
import type { Session } from 'next-auth'
import { deleteImageId } from '@/lib/imageId-crud'

/**
 * 画像削除サーバーアクション
 * - DBからImageIdを削除
 * - Cloudflare Imagesから画像を削除
 * @param imageId Cloudflareの画像ID
 * @param session next-authのセッション
 */
export async function handleDeleteImage({
  imageId,
  session,
}: {
  imageId: string
  session: Session | null
}): Promise<{ status: 'success' | 'error'; message: string }> {
  if (!imageId || !session) {
    return { status: 'error', message: '認証情報または画像IDがありません' }
  }

  try {
    // 1. DBから削除
    await deleteImageId(imageId, session)

    // 2. Cloudflare Imagesから削除
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = process.env.CLOUDFLARE_API_TOKEN
    if (!accountId || !apiToken) {
      return { status: 'error', message: 'Cloudflare認証情報がありません' }
    }
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${imageId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      },
    )
    if (!res.ok) {
      return { status: 'error', message: 'Cloudflare画像削除に失敗しました' }
    }
    revalidateTag('imageIds')
    return { status: 'success', message: '画像を削除しました' }
  } catch {
    return { status: 'error', message: '画像削除中にエラーが発生しました' }
  }
}
