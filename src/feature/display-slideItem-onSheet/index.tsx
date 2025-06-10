'use client'
import CustomSlideItem from '@/components/custom-slideItem'
import type { Slide } from '@/lib/slide-crud'
import type { Session } from 'next-auth'
import handleDeleteSlide from './handle-delete-slide'
import CustomSubmitButton from '@/components/custom-submit-button'
import Form from 'next/form'
import { toastSuccess, toastError } from '@/components/custom-toast'
import { CustomPopover } from '@/components/custom-popover'
import { useMdData } from '@/providers/md-data-provider'
import { cn } from '@/lib/utils'
import { Trash2 } from 'lucide-react'

export default function DisplaySlideItemOnSheet({
  slides,
  session,
}: {
  slides: Slide[]
  session: Session | null
}) {
  const { mdData } = useMdData()
  return (
    <div className='mt-4'>
      <div className='grid grid-cols-2 gap-x-4 px-4 py-2 font-semibold text-sm text-gray-500 border-b'>
        <span>ファイル名</span>
        <span className='text-right'>最終更新日</span>
      </div>
      <div>
        {slides.map(slide => {
          return (
            <div
              key={slide.id}
              className={cn(
                'group hover:bg-gray-100 transition flex justify-between w-full items-center gap-1 border-b  cursor-pointer pl-4 pr-1 py-2',
                mdData?.id === slide.id && 'bg-gray-200',
              )}
            >
              <CustomSlideItem slide={slide} />
              <CustomPopover
                triggerClassName={cn(
                  'opacity-0 group-hover:opacity-100 ',
                  mdData?.id === slide.id && 'opacity-100',
                )}
              >
                <Form
                  className=''
                  action={async () => {
                    try {
                      if (!window.confirm('本当に削除しますか？')) return
                      await handleDeleteSlide(slide.id, session)
                      toastSuccess('スライドを削除しました')
                    } catch (e) {
                      toastError(
                        e instanceof Error
                          ? e
                          : new Error('削除に失敗しました'),
                      )
                    }
                  }}
                >
                  <CustomSubmitButton
                    variant={'destructive'}
                    className=''
                    icon={<Trash2 />}
                  >
                    delete
                  </CustomSubmitButton>
                </Form>
              </CustomPopover>
            </div>
          )
        })}
      </div>
    </div>
  )
}
