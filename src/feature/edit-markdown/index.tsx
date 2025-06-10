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
import handleCreateNewMdData from './handle-update-mdData'

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
            const result = await handleCreateNewMdData(
              mdData.id,
              mdData.body,
              session,
            )
            if (result.status === 'error') {
              toastError(result.message)
            }
            markAsSaved()
            toastSuccess(result.message)
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
