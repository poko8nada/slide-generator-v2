'use client'
import MarkdownEditor from '@/components/markdown-editor'
import { cn } from '@/lib/utils'
import { useMdData } from '@/providers/md-data-provider'
import { useRef } from 'react'
import { options } from './markdownAction'
import { useUnsavedChanges, useInitialDataSync } from './useEditMarkdownEffects'
import useMde from './useMde'
import { Save } from 'lucide-react'
import type { MdData } from '@/lib/mdData-crud'
import type { Session } from 'next-auth'
import { toastError, toastSuccess } from '@/components/custom-toast'
import CustomSubmitButton from '@/components/custom-submit-button'
import Form from 'next/form'
import handleUpdateMdData from './handle-update-mdData'
import type { SaveMarkdownResponse } from '@/lib/type'

export default function EditMarkdown({
  allMdDatas,
  session,
}: {
  allMdDatas: MdData[]
  session: Session | null
}) {
  const { mdData, updateMdBody, isDiff } = useMdData()
  const mdeRef = useRef<{ getMdeInstance: () => EasyMDE } | null>(null)

  useMde(mdeRef)
  const initialMdData = useInitialDataSync(allMdDatas)
  const { markAsSaved } = useUnsavedChanges()

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
              // FormData生成
              const formData = new FormData()
              formData.append('markdown', mdData.body)
              // 画像データ追加（既存ロジックがあればここで追加）

              // APIへ送信
              const res = await fetch('/api/documents/save', {
                method: 'POST',
                body: formData,
              })

              if (!res.ok) {
                throw new Error('画像アップロードAPI通信エラー')
              }

              const data: SaveMarkdownResponse = await res.json()
              if ('error' in data) {
                throw new Error(data.error || '置換済みMarkdown取得失敗')
              }
              const replacedMd = data.markdown

              const result = await handleUpdateMdData(
                mdData.id,
                replacedMd,
                session,
              )
              if (result.status === 'error') {
                toastError(result.message)
                return
              }
              markAsSaved()
              toastSuccess(result.message)
            } catch (e) {
              toastError(e instanceof Error ? e.message : '保存に失敗しました')
            }
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
