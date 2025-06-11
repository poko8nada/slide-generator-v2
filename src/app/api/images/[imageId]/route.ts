// src/app/api/images/[imageId]/route.ts
import { type NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db/schema' // DBインスタンス仮定
// imagesテーブル定義はcloudflare-images-overview.md準拠で仮定
import { images } from '@/db/schema'
import { auth } from '@/auth'

const CLOUDFLARE_IMAGES_URL = `https://imagedelivery.net/${process.env.CLOUDFLARE_ACCOUNT_HASH}`

export async function GET(
  req: NextRequest,
  { params }: { params: { imageId: string } },
) {
  try {
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
      .where(eq(images.id, params.imageId))
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
    const cfRes = await fetch(
      `${CLOUDFLARE_IMAGES_URL}/${image.cloudflareImageId}/public`,
      { method: 'GET' },
    )
    if (!cfRes.ok) {
      return NextResponse.json(
        { error: 'Cloudflare Imagesから画像取得に失敗しました。' },
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
  } catch (e) {
    return NextResponse.json(
      { error: 'サーバー内部でエラーが発生しました。' },
      { status: 500 },
    )
  }
}
