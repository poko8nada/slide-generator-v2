// src/app/api/images/[imageId]/route.ts
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db/schema'
import { images } from '@/db/schema'
import { auth } from '@/auth'

const CLOUDFLARE_IMAGES_URL = `https://imagedelivery.net/${process.env.CLOUDFLARE_ACCOUNT_HASH}`

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ imageId: string }> },
) {
  try {
    // paramsからimageIdを取得（awaitが必要）
    const { imageId } = await params

    // 認証
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証に失敗しました。再度ログインしてください。' },
        { status: 401 },
      )
    }
    const userId = session.user.id

    // DBで画像IDとユーザー権限チェック
    const image = await db
      .select()
      .from(images)
      .where(eq(images.cloudflareImageId, imageId))
      .then(rows => rows[0])

    if (!image) {
      return NextResponse.json(
        { error: '画像が見つかりませんでした。' },
        { status: 404 },
      )
    }

    if (image.userId !== userId) {
      return NextResponse.json({ error: '権限がありません。' }, { status: 403 })
    }

    // Cloudflare Imagesから画像取得
    const cfUrl = `${CLOUDFLARE_IMAGES_URL}/${image.cloudflareImageId}/public`

    const cfRes = await fetch(cfUrl, {
      method: 'GET',
    })

    if (!cfRes.ok) {
      console.error(
        'Cloudflare Images fetch failed:',
        cfRes.status,
        cfRes.statusText,
      )
      return NextResponse.json(
        {
          error: `Cloudflare Imagesから画像取得に失敗しました。Status: ${cfRes.status}`,
        },
        { status: 502 },
      )
    }

    // 画像データをそのままレスポンス
    const contentType = cfRes.headers.get('content-type') ?? 'image/jpeg'
    const arrayBuffer = await cfRes.arrayBuffer()

    return new NextResponse(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    console.error('API Error in /api/images/[imageId]:', error)
    return NextResponse.json(
      {
        error: 'サーバー内部でエラーが発生しました。',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
