// POST /api/documents/save
import { type NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import type { PostResponse, UploadedImageResult } from '@/lib/type'

const MAX_IMAGES = 10
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

export async function POST(
  req: NextRequest,
): Promise<NextResponse<PostResponse>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証に失敗しました。再度ログインしてください。' },
        { status: 401 },
      )
    }

    const form = await req.formData()

    // 画像とURLの取得・バリデーション
    const imagesWithUrls = []
    for (let i = 0; i < MAX_IMAGES; i++) {
      const img = form.get(`images[${i}]`)
      const url = form.get(`imageUrls[${i}]`)
      if (isValidImage(img) && url && typeof url === 'string') {
        if (img.size > MAX_IMAGE_SIZE) {
          throw new Error('画像サイズが大きすぎます（最大5MB）')
        }
        imagesWithUrls.push({ img, url })
      }
    }

    if (imagesWithUrls.length > MAX_IMAGES) {
      return NextResponse.json(
        { error: `画像は${MAX_IMAGES}枚までアップロード可能です。` },
        { status: 400 },
      )
    }

    // Cloudflare Images upload
    let uploadedPairs: UploadedImageResult[] = []
    try {
      uploadedPairs = await Promise.all(
        imagesWithUrls.map(async ({ img, url }) => {
          const uploadedUrl = await uploadToCloudflareImages(img)

          // 画像IDをURLから抽出（例: Cloudflare ImagesのURLは https://imagedelivery.net/xxxx/yyyy/public の形式）
          // "imagedelivery.net/xxxx/yyyy/public" の "yyyy" 部分を抽出
          let cloudflareImageId = ''
          try {
            const match = uploadedUrl.match(
              /imagedelivery\.net\/[^/]+\/([^/]+)/,
            )
            cloudflareImageId = match?.[1] ?? ''
          } catch {
            cloudflareImageId = ''
          }
          return { original: url, uploaded: uploadedUrl, cloudflareImageId }
        }),
      )
    } catch (_) {
      return NextResponse.json(
        {
          error:
            'Cloudflare Imagesへのアップロードに失敗しました。時間をおいて再度お試しください。',
        },
        { status: 502 },
      )
    }

    // DB保存やMarkdown置換はここでは行わず、アップロード結果のみ返却
    return NextResponse.json({ urls: uploadedPairs })
  } catch (e) {
    if (e instanceof Error && e.message.includes('画像サイズが大きすぎます')) {
      return NextResponse.json({ error: e.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
