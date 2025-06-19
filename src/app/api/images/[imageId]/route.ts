// src/app/api/images/[imageId]/route.ts

import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db, images } from '@/db/schema'

const CLOUDFLARE_IMAGES_URL = `https://imagedelivery.net/${process.env.CLOUDFLARE_ACCOUNT_HASH}`

const DELETED_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#f0f0f0"/>
  <text x="200" y="150" font-size="24" text-anchor="middle" fill="#999" dy=".3em">
    Image Not Found
  </text>
</svg>`

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
      // 画像がDBにない場合は削除済みSVGを返す
      return new NextResponse(DELETED_SVG, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=86400',
        },
      })
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
      // Cloudflareから画像が消えている場合も削除済みSVGを返す
      return new NextResponse(DELETED_SVG, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=86400',
        },
      })
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
