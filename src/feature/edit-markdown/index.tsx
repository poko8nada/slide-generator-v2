'use client'
import type { Session } from 'next-auth'
import { useMemo, useRef } from 'react'
import Loader from '@/components/loader'
import MarkdownEditor from '@/components/markdown-editor'
import type { MdData } from '@/lib/mdData-crud'
import { cn } from '@/lib/utils'
import { useMdData } from '@/providers/md-data-provider'
import { useSaveAction } from '@/providers/save-action-provider'
import type { ImageStore } from './markdown.client'
import { createOptions } from './markdown.client'
import {
  useInitialDataSync,
  useMde,
  useRegisterSaveFlow,
  useUnsavedChanges,
} from './mde-hooks'

export default function EditMarkdown({
  allMdDatas,
  session,
}: {
  allMdDatas: MdData[]
  session: Session | null
}) {
  const { mdData, updateMdBody, isDiff } = useMdData()
  const { isSaving } = useSaveAction()

  const mdeRef = useRef<{ getMdeInstance: () => EasyMDE } | null>(null)

  // 画像管理Map
  const imageMapRef = useRef<Map<string, ImageStore>>(new Map())
  // console.log('[EditMarkdown] imageMapRef.current', imageMapRef.current)

  useMde(mdeRef)
  useInitialDataSync(allMdDatas)
  const { markAsSaved } = useUnsavedChanges()
  useRegisterSaveFlow(mdData, updateMdBody, imageMapRef, session, markAsSaved)

  const options = useMemo(() => createOptions(imageMapRef), [])

  return (
    <div
      className={cn(
        'relative',
        'relative w-full',
        'max-w-[640px]',
        'min-h-[371px]',
        'lg:h-[425px]',
        'xl:h-[450px]',
      )}
    >
      {isSaving && <Loader />}
      <MarkdownEditor
        mdDataBody={mdData.body}
        updateMdBody={updateMdBody}
        options={options}
        mdeRef={mdeRef}
      />
    </div>
  )
}
