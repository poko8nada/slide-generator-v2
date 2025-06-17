'use client'
import MarkdownEditor from '@/components/markdown-editor'
import { cn } from '@/lib/utils'
import { useMdData } from '@/providers/md-data-provider'
import { useRef, useMemo } from 'react'
import type { ImageStore } from './markdown.client'
import { createOptions } from './markdown.client'
import { useUnsavedChanges, useInitialDataSync, useMde } from './mde-hooks'
import { Save } from 'lucide-react'
import type { MdData } from '@/lib/mdData-crud'
import type { Session } from 'next-auth'
import { toastError, toastSuccess } from '@/components/custom-toast'
import CustomSubmitButton from '@/components/custom-submit-button'
import Form from 'next/form'
import { handleUpdateMdData } from './markdown.server'
import {
  fetchAndRegisterExternalImages,
  removeCloudflareImageUrls,
} from './image.client'
import { handleUpsertImageIds, handleUploadImages } from './image.server'

export default function EditMarkdown({
  allMdDatas,
  session,
}: {
  allMdDatas: MdData[]
  session: Session | null
}) {
  const { mdData, updateMdBody, isDiff } = useMdData()
  const mdeRef = useRef<{ getMdeInstance: () => EasyMDE } | null>(null)

  // 画像管理Map
  const imageMapRef = useRef<Map<string, ImageStore>>(new Map())
  // console.log('[EditMarkdown] imageMapRef.current', imageMapRef.current)

  useMde(mdeRef)
  const initialMdData = useInitialDataSync(allMdDatas)
  const { markAsSaved } = useUnsavedChanges()

  const options = useMemo(() => createOptions(imageMapRef), [])

  return (
    <div
      className={cn(
        'relative w-full',
        'max-w-[640px]',
        'min-h-[371px]',
        'lg:h-[425px]',
        'xl:h-[450px]',
      )}
    >
      <MarkdownEditor
        mdDataBody={mdData.body}
        updateMdBody={updateMdBody}
        options={options}
        mdeRef={mdeRef}
      />
      {initialMdData && (
        <Form
          action={async () => {
            try {
              // 削除画像検出・確認・除去フロー
              const { getDeletedImageIdsFromMarkdown, removeDeletedImageUrls } =
                await import('./image.server')
              // Markdown本文から削除画像ID検出
              const deletedIds = await getDeletedImageIdsFromMarkdown(
                mdData.body,
              )
              let mdBodyForSave = mdData.body

              if (deletedIds.length > 0) {
                const confirmMsg = `削除済み画像が本文に含まれています。\n${deletedIds.map(id => `/api/images/${id}`).join('\n')}\nこれらを除去して保存しますか？`
                const ok = window.confirm(confirmMsg)
                if (!ok) {
                  toastError('保存を中止しました')
                  return
                }
                // Markdownから該当画像URLを除去
                mdBodyForSave = removeDeletedImageUrls(
                  mdBodyForSave,
                  deletedIds,
                )
              }

              // 特定の画像URLを取り除く
              const mdWithoutImages =
                await removeCloudflareImageUrls(mdBodyForSave)

              // blobは先にimageMapに登録済み
              // 外部画像fetch→File化→imageMap登録
              await fetchAndRegisterExternalImages(
                mdWithoutImages,
                imageMapRef.current,
              )
              console.log('[EditMarkdown] imageMapRef.current', imageMapRef)

              // FormData生成
              const formData = new FormData()
              // imageMapから画像データと元URLを配列形式でappend
              Array.from(imageMapRef.current.entries()).forEach(
                ([url, store], i) => {
                  formData.append(`images[${i}]`, store.file)
                  formData.append(`imageUrls[${i}]`, url)
                },
              )

              console.log('[EditMarkdown] formData', formData)

              // サーバーアクションで画像アップロード
              const data = await handleUploadImages(formData)

              if ('error' in data) {
                throw new Error(data.error)
              }
              if (!data.urls || !Array.isArray(data.urls)) {
                throw new Error('画像アップロードに失敗しました')
              }
              console.log('[EditMarkdown] data', data)

              // 画像情報をDBにupsert
              await handleUpsertImageIds(data.urls, session)

              // Markdown本文の画像URLをアップロード後のURLで置換
              let replacedMd = mdBodyForSave
              for (const img of data.urls) {
                // img.cloudflareImageId を使って /api/images/[imageId] 形式に置換
                const apiUrl = `/api/images/${img.cloudflareImageId}`
                replacedMd = replacedMd.replaceAll(img.original, apiUrl)
              }

              handleUpdateMdData(mdData.id, replacedMd, session)
              updateMdBody(replacedMd)

              markAsSaved()
              toastSuccess('画像アップロード・DB保存・Markdown置換完了')
            } catch (e) {
              toastError(e instanceof Error ? e.message : '保存に失敗しました')
            }
            imageMapRef.current.clear()
          }}
        >
          <CustomSubmitButton
            className='absolute top-2 right-2'
            disabled={!isDiff}
            icon={<Save />}
          >
            save
          </CustomSubmitButton>
        </Form>
      )}
    </div>
  )
}

// Markdown本文から削除画像URLを除去する関数
