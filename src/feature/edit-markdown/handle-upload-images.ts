'use server'

import { auth } from '@/auth'
import type { PostResponse, UploadedImageResult } from '@/lib/type'
import { findImageIdByHash } from '@/lib/imageId-crud'
import { FREE_IMAGE_LIMIT, PRO_IMAGE_LIMIT } from '@/lib/constants'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

// Cloudflare Images APIレスポンス型
interface CloudflareImagesResponse {
  result?: {
    variants?: string[]
  }
}

async function uploadToCloudflareImages(file: Blob): Promise<string> {
  const form = new FormData()
  form.append('file', file)

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const apiToken = process.env.CLOUDFLARE_API_TOKEN
  if (!accountId || !apiToken) throw new Error('Cloudflare env missing')

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      body: form,
    },
  )

  const data = (await res.json()) as CloudflareImagesResponse
  if (!res.ok || !data.result?.variants?.[0]) {
    throw new Error('Cloudflare Images upload failed')
  }
  return data.result.variants[0]
}

function isValidImage(img: unknown): img is File {
  return Boolean(
    img &&
      typeof img === 'object' &&
      'size' in img &&
      typeof (img as File).size === 'number' &&
      'name' in img &&
      typeof (img as File).name === 'string',
  )
}

// Edgeランタイム対応SHA-256ハッシュ生成
async function generateHashFromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function handleUploadImages(
  form: FormData,
): Promise<PostResponse> {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return { error: '認証に失敗しました。再度ログインしてください。' }
    }

    // 利用プランごとの画像上限
    const imageLimit = session?.user?.isPro ? PRO_IMAGE_LIMIT : FREE_IMAGE_LIMIT

    // 画像とURLの取得・バリデーション
    const imagesWithUrls: { img: File; url: string }[] = []
    for (let i = 0; i < imageLimit; i++) {
      const img = form.get(`images[${i}]`)
      const url = form.get(`imageUrls[${i}]`)
      if (isValidImage(img) && url && typeof url === 'string') {
        if (img.size > MAX_IMAGE_SIZE) {
          throw new Error('画像サイズが大きすぎます（最大5MB）')
        }
        imagesWithUrls.push({ img, url })
      }
    }

    if (imagesWithUrls.length > imageLimit) {
      return { error: `画像は${imageLimit}枚までアップロード可能です。` }
    }

    // Cloudflare Images upload
    const uploadedPairs: UploadedImageResult[] = []
    const failedUploads: { original: string; error: string }[] = []
    for (const { img, url } of imagesWithUrls) {
      try {
        // 1. ハッシュ生成
        const hash = await generateHashFromFile(img)
        // 2. 重複チェック
        const found = await findImageIdByHash(hash)
        if (found?.cloudflareImageId) {
          // 既存画像
          const uploadedUrl = `https://imagedelivery.net/${process.env.CLOUDFLARE_ACCOUNT_ID}/${found.cloudflareImageId}/public`
          uploadedPairs.push({
            original: url,
            uploaded: uploadedUrl,
            cloudflareImageId: found.cloudflareImageId,
            hash,
          })
          continue
        }
        // 3. 新規アップロード
        const uploadedUrl = await uploadToCloudflareImages(img)
        let cloudflareImageId = ''
        try {
          const match = uploadedUrl.match(/imagedelivery\.net\/[^/]+\/([^/]+)/)
          cloudflareImageId = match?.[1] ?? ''
        } catch {
          cloudflareImageId = ''
        }
        // DB upsertはここでは行わない（責務分離のため）
        uploadedPairs.push({
          original: url,
          uploaded: uploadedUrl,
          cloudflareImageId,
          hash,
        })
      } catch (err) {
        failedUploads.push({
          original: url,
          error: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }

    // DB保存やMarkdown置換はここでは行わず、アップロード結果のみ返却
    return {
      urls: uploadedPairs,
      failed: failedUploads,
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes('画像サイズが大きすぎます')) {
      return { error: e.message }
    }
    return { error: e instanceof Error ? e.message : 'Unknown error' }
  }
}
