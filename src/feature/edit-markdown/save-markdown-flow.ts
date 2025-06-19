import type { Session } from 'next-auth'
import { toastError, toastSuccess } from '@/components/custom-toast'
import type { MdData } from '@/lib/mdData-crud'
import {
  fetchAndRegisterExternalImages,
  // removeCloudflareImageUrls,
} from './image.client'
import {
  getDeletedImageIdsFromMarkdown,
  handleUploadImages,
  handleUpsertImageIds,
  removeDeletedImageUrls,
} from './image.server'
import type { ImageStore } from './markdown.client'
import { handleUpdateMdData } from './markdown.server'

// 削除画像検出・除去
async function detectAndRemoveDeletedImages(
  mdBody: string,
): Promise<{ mdBody: string; deletedIds: string[] }> {
  const deletedIds = await getDeletedImageIdsFromMarkdown(mdBody)
  let newMdBody = mdBody

  if (deletedIds.length > 0) {
    const confirmMsg = `削除済み画像が本文に含まれています。\n${deletedIds.map(id => `/api/images/${id}`).join('\n')}\nこれらを除去して保存しますか？`

    const ok = window.confirm(confirmMsg)
    if (!ok) throw new Error('保存を中止しました')

    newMdBody = await removeDeletedImageUrls(newMdBody, deletedIds)
  }
  return { mdBody: newMdBody, deletedIds }
}

// 外部画像fetch・登録
async function registerExternalImages(
  mdBody: string,
  imageMap: Map<string, ImageStore>,
) {
  await fetchAndRegisterExternalImages(mdBody, imageMap)
}

// 画像アップロードとDB upsert
async function uploadImagesAndUpsertDb(
  imageMap: Map<string, ImageStore>,
  session: Session | null,
) {
  const formData = new FormData()

  Array.from(imageMap.entries()).forEach(([url, store], i) => {
    formData.append(`images[${i}]`, store.file)
    formData.append(`imageUrls[${i}]`, url)
  })
  const data = await handleUploadImages(formData)

  if ('error' in data) throw new Error(data.error)

  if (!data.urls || !Array.isArray(data.urls))
    throw new Error('画像アップロードに失敗しました')

  await handleUpsertImageIds(data.urls, session)

  return data.urls
}

// Markdown本文の画像URL置換
type UploadedImage = { original: string; cloudflareImageId: string }
function replaceImageUrlsInMarkdown(
  mdBody: string,
  uploadedImages: UploadedImage[],
): string {
  let replacedMd = mdBody
  for (const img of uploadedImages) {
    const apiUrl = `/api/images/${img.cloudflareImageId}`
    replacedMd = replacedMd.replaceAll(img.original, apiUrl)
  }
  return replacedMd
}

// メインの保存フロー
export async function saveMarkdownFlow({
  mdData,
  updateMdBody,
  imageMapRef,
  session,
  markAsSaved,
}: {
  mdData: MdData
  updateMdBody: (body: string) => void
  imageMapRef: React.MutableRefObject<Map<string, ImageStore>>
  session: Session | null
  markAsSaved: () => void
}) {
  try {
    // 1. 削除画像検出・除去
    const { mdBody } = await detectAndRemoveDeletedImages(mdData.body)

    // // 2. 特定の画像URLを除去
    // mdBody = await removeCloudflareImageUrls(mdBody)

    // 3. 外部画像fetch・登録
    await registerExternalImages(mdBody, imageMapRef.current)
    // 4. 画像アップロードとDB upsert
    const uploadedImages = await uploadImagesAndUpsertDb(
      imageMapRef.current,
      session,
    )
    // 5. Markdown本文の画像URL置換
    const replacedMd = replaceImageUrlsInMarkdown(mdBody, uploadedImages)
    // 6. mdDataを更新し、DB保存
    handleUpdateMdData(mdData.id, replacedMd, session)
    updateMdBody(replacedMd)
    markAsSaved()
    toastSuccess('画像アップロード・DB保存・Markdown置換完了')
  } catch (e) {
    toastError(e instanceof Error ? e.message : '保存に失敗しました')
  } finally {
    imageMapRef.current.clear()
  }
}
