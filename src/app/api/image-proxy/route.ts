import { type NextRequest, NextResponse } from 'next/server'
import { isAllowedHost } from '@/lib/white-list'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) {
    return NextResponse.json({ message: 'Missing url' }, { status: 400 })
  }

  // Check if the URL starts with 'blob:' or 'data:'
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    return NextResponse.json(
      { message: 'Unsupported URL scheme' },
      { status: 400 },
    )
  }

  // Check if the hostname is allowed
  let hostname: string
  try {
    const parsedUrl = new URL(url)

    hostname = parsedUrl.hostname
  } catch {
    return NextResponse.json({ message: 'Invalid URL' }, { status: 400 })
  }

  if (!isAllowedHost(hostname)) {
    return NextResponse.json(
      { message: 'Blocked by whitelist' },
      { status: 403 },
    )
  }

  try {
    const response = await fetch(url)
    const contentType =
      response.headers.get('content-type') ||
      'image/jpeg' ||
      'image/png' ||
      'image/webp' ||
      'image/svg+xml' ||
      'image/gif' ||
      'image/bmp'
    const buffer = await response.arrayBuffer()

    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (_) {
    return NextResponse.json(
      { message: 'Failed to fetch image' },
      { status: 500 },
    )
  }
}
