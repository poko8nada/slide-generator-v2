'use client'
import { Check, Copy as CopyIcon, Trash2 } from 'lucide-react'
import Form from 'next/form'
import type { Session } from 'next-auth'
import { useState } from 'react'
import { toastError, toastSuccess } from '@/components/custom-toast'
import { SheetContentHeader } from '@/components/sheet-content-header'
import { IconButton } from '@/components/ui/icon-button'
import { handleDeleteImage } from './handle-delete-image'

export default function DisplayImageOnSheet({
  cloudFlareImageIds,
  session,
  current,
  limit,
}: {
  cloudFlareImageIds: {
    cloudflareImageId: string
  }[]
  session: Session | null
  current: number
  limit: number
}) {
  const imageIds = cloudFlareImageIds.map(imageId => imageId.cloudflareImageId)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (src: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`![alt](${src})`)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1200)
    }
  }
  return (
    <div className='mt-10'>
      <SheetContentHeader title='Images' current={current} limit={limit} />
      <div className='grid grid-cols-3 gap-4 px-4 h-5/12'>
        {imageIds.map(imageId => {
          const src = `/api/images/${imageId}`
          return (
            <div
              key={imageId}
              className='group flex items-center justify-center p-2 rounded-md aspect-square bg-gray-100 relative overflow-hidden'
            >
              <img
                src={src}
                alt={`${imageId}`}
                className='w-full h-full object-contain transition duration-200 group-hover:blur-sm'
                onError={e => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = '/image-deleted-placeholder.svg'
                  e.currentTarget.alt = '画像は削除されました'
                }}
              />
              <div className='absolute inset-0 flex flex-col justify-center items-center gap-2 p-2 group-hover:opacity-100 opacity-0 transition-opacity ease-in duration-200 bg-gray-100/80'>
                <IconButton
                  type='button'
                  colorScheme='gray'
                  icon={
                    copiedId === imageId ? (
                      <Check size={14} aria-label='copied' />
                    ) : (
                      <CopyIcon size={14} aria-label='copy' />
                    )
                  }
                  onClick={() => handleCopy(src, imageId)}
                >
                  {copiedId === imageId ? 'Copied' : 'Copy'}
                </IconButton>
                <Form
                  action={async () => {
                    if (!session) return
                    const res = await handleDeleteImage({ imageId, session })
                    if (res.status === 'success') {
                      toastSuccess('画像を削除しました')
                    } else {
                      toastError(res.message)
                    }
                  }}
                >
                  <IconButton
                    type='submit'
                    colorScheme='red'
                    icon={<Trash2 size={14} aria-label='delete' />}
                  >
                    Delete
                  </IconButton>
                </Form>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
