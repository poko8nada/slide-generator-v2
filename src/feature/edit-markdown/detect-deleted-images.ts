'use server'
import { db, images } from '@/db/schema'

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
  } catch (e) {
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
