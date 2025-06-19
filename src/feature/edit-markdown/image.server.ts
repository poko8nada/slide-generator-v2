// サーバー側画像関連処理統合
'use server'
import { revalidateTag } from 'next/cache'
import type { Session } from 'next-auth'
import { auth } from '@/auth'
import { db, images } from '@/db/schema'
import { FREE_IMAGE_LIMIT, PRO_IMAGE_LIMIT } from '@/lib/constants'
import {
  findImageIdByHash,
  type ImageUpsertInput,
  upsertImageId,
} from '@/lib/imageId-crud'
import type { PostResponse, UploadedImageResult } from '@/lib/type'

/**
 * Markdown本文から /api/images/[imageId] 形式の画像IDを抽出
 */
export async function extractImageIdsFromMarkdown(
  markdown: string,
): Promise<string[]> {
  const regex = /!\[.*?\]\(\/api\/images\/([^\s)]+)\)/g
  const matches = [...markdown.matchAll(regex)]
  return matches.map(m => m[1])
}

/**
 * DBから現存する画像IDリストを取得
 */
export async function fetchExistingImageIds(): Promise<string[]> {
  try {
    const result = await db
      .select({ id: images.cloudflareImageId })
      .from(images)
    return result.map(row => row.id)
  } catch (_e) {
    throw new Error('画像IDリスト取得に失敗しました')
  }
}

/**
 * 抽出画像IDと現存画像IDリストを突合し、削除済み画像IDを返す
 */
export async function detectDeletedImageIds(
  extractedIds: string[],
  existingIds: string[],
): Promise<string[]> {
  const existingSet = new Set(existingIds)
  return extractedIds.filter(id => !existingSet.has(id))
}

/**
 * Markdown本文から削除済み画像IDリストを取得（統合関数）
 */
export async function getDeletedImageIdsFromMarkdown(
  markdown: string,
): Promise<string[]> {
  const extracted = await extractImageIdsFromMarkdown(markdown)
  if (extracted.length === 0) return []

  const existing = await fetchExistingImageIds()

  return detectDeletedImageIds(extracted, existing)
}

/**
 * Markdown本文から削除済み画像IDに該当する画像リンクを除去
 */
export async function removeDeletedImageUrls(
  markdown: string,
  deletedIds: string[],
): Promise<string> {
  if (!deletedIds.length) return markdown
  let result = markdown
  for (const id of deletedIds) {
    // ![alt]( /api/images/[id] ) の形式を除去
    const regex = new RegExp(`!\\[.*?\\]\\(/api/images/${id}\\)\\s*`, 'g')
    result = result.replace(regex, '')
  }
  return result
}

// Cloudflare Images APIレスポンス型
interface CloudflareImagesResponse {
  result?: {
    variants?: string[]
  }
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

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

/**
 * 画像情報をDBにupsert
 */
export async function handleUpsertImageIds(
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
    await upsertImageId(input, session)
  }
  revalidateTag('imageIds')
}
