'use client'
import MarkdownEditor from '@/components/markdown-editor'
import type { Slide } from '@/lib/slide-crud'
import { cn } from '@/lib/utils'
import { useMdData } from '@/providers/md-data-provider'
import { useRef } from 'react'
import { options } from './markdownAction'
import { useUnsavedChanges, useInitialDataSync } from './useEditMarkdownEffects'
import useMde from './useMde'
import { Save } from 'lucide-react'
import { updateSlide } from '@/lib/slide-crud'
import type { Session } from 'next-auth'
import { toastError, toastSuccess } from '@/components/custom-toast'
import CustomSubmitButton from '@/components/custom-submit-button'
import Form from 'next/form'

export default function EditMarkdown({
  allSlide,
  session,
}: {
  allSlide: Slide[]
  session: Session | null
}) {
  const { mdData, updateMdBody, isDiff } = useMdData()
  const mdeRef = useRef<{ getMdeInstance: () => EasyMDE } | null>(null)

  useMde(mdeRef)
  const initialSlide = useInitialDataSync(allSlide)
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
      {initialSlide && (
        <Form
          action={async () => {
            try {
              await updateSlide(mdData.id, mdData.body, session)
              markAsSaved()
              toastSuccess('保存しました')
            } catch (e) {
              toastError(
                e instanceof Error ? e : new Error('保存に失敗しました'),
              )
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
