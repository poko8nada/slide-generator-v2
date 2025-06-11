import type { ImageStore } from './markdownAction'

// 外部画像URL抽出関数
export function extractExternalImageUrls(markdown: string): string[] {
  const urlRegex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/g
  const matches = [...markdown.matchAll(urlRegex)]
  return matches.map(match => match[1])
}

// fetchを/api/image-proxy経由に変更
export async function fetchAndRegisterExternalImages(
  markdown: string,
  imageMap: Map<string, ImageStore>,
) {
  const urls = extractExternalImageUrls(markdown)
  for (const url of urls) {
    if (!imageMap.has(url)) {
      try {
        const res = await fetch(
          `/api/image-proxy?url=${encodeURIComponent(url)}`,
        )
        const blob = await res.blob()
        const ext = blob.type.split('/')[1] || 'png'
        const file = new File([blob], `external.${ext}`, { type: blob.type })
        const tempUrl = URL.createObjectURL(file)
        imageMap.set(url, { file, tempUrl })
      } catch {
        // fetch失敗時はスキップ
      }
    }
  }
}
