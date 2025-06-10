'use client'
import CustomMdDataItem from '@/components/custom-mdDataItem'
import type { MdData } from '@/lib/mdData-crud'
import type { Session } from 'next-auth'
import handleDeleteMdData from './handle-delete-mdData'
import CustomSubmitButton from '@/components/custom-submit-button'
import Form from 'next/form'
import { toastSuccess, toastError } from '@/components/custom-toast'
import { CustomPopover } from '@/components/custom-popover'
import { useMdData } from '@/providers/md-data-provider'
import { cn } from '@/lib/utils'
import { Trash2 } from 'lucide-react'

export default function DisplaySlideItemOnSheet({
  mdDatas,
  session,
}: {
  mdDatas: MdData[]
  session: Session | null
}) {
  const { mdData } = useMdData()
  return (
    <div className='mt-4 overflow-y-auto'>
      <div className='grid grid-cols-2 gap-x-4 px-4 py-2 font-semibold text-sm text-gray-500 sticky top-0 bg-white z-10'>
        <span>ファイル名</span>
        <span className='text-right'>最終更新日</span>
      </div>
      <div className='h-3 w-full bg-gradient-to-b from-black/10 to-transparent pointer-events-none z-[9] sticky top-[36px]' />
      <div className='mt-[-15px]'>
        {mdDatas.map(item => {
          return (
            <div
              key={item.id}
              className={cn(
                'group hover:bg-gray-100 transition flex justify-between w-full items-center gap-1 border-b  cursor-pointer pl-4 pr-1 py-2',
                mdData?.id === item.id && 'bg-gray-200',
              )}
            >
              <CustomMdDataItem mdData={item} />
              <CustomPopover
                triggerClassName={cn(
                  'opacity-0 group-hover:opacity-100 ',
                  mdData?.id === item.id && 'opacity-100',
                )}
              >
                <Form
                  className=''
                  action={async () => {
                    if (!window.confirm('本当に削除しますか？')) return
                    const result = await handleDeleteMdData(item.id, session)
                    if (result.status === 'error') {
                      toastError(result.message)
                      return
                    }
                    toastSuccess(result.message)
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
