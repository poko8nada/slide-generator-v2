// POST /api/documents/save
import { type NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import type { SaveMarkdownResponse } from '@/lib/type'

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

function replaceImageUrlsInMarkdown(
  markdown: string,
  originals: string[],
  uploaded: string[],
): string {
  let result = markdown
  originals.forEach((orig, idx) => {
    result = result.replaceAll(orig, uploaded[idx])
  })
  return result
}

export async function POST(
  req: NextRequest,
): Promise<NextResponse<SaveMarkdownResponse>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証に失敗しました。再度ログインしてください。' },
        { status: 401 },
      )
    }

    const form = await req.formData()
    const markdown = form.get('markdown')

    // 画像とURLの取得・バリデーション
    const imagesWithUrls = Array.from({ length: MAX_IMAGES }, (_, i) => {
      const img = form.get(`images[${i}]`)
      const url = form.get(`imageUrls[${i}]`)
      if (isValidImage(img) && url && typeof url === 'string') {
        if (img.size > MAX_IMAGE_SIZE) {
          throw new Error('画像サイズが大きすぎます（最大5MB）')
        }
        return { img, url }
      }
      return null
    }).filter((v): v is { img: File; url: string } => v !== null)

    if (imagesWithUrls.length > MAX_IMAGES) {
      return NextResponse.json(
        { error: `画像は${MAX_IMAGES}枚までアップロード可能です。` },
        { status: 400 },
      )
    }

    if (typeof markdown !== 'string') {
      return NextResponse.json(
        { error: 'フォームデータが不正です。' },
        { status: 400 },
      )
    }

    // Cloudflare Images upload
    let uploadedUrls: string[] = []
    try {
      uploadedUrls = await Promise.all(
        imagesWithUrls.map(({ img }) => uploadToCloudflareImages(img)),
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

    // Replace image URLs in markdown
    const replacedMarkdown = replaceImageUrlsInMarkdown(
      markdown,
      imagesWithUrls.map(({ url }) => url),
      uploadedUrls,
    )

    return NextResponse.json({ markdown: replacedMarkdown, urls: uploadedUrls })
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
