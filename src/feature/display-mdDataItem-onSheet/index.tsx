'use client'
import { Trash2 } from 'lucide-react'
import Form from 'next/form'
import type { Session } from 'next-auth'
import CustomMdDataItem from '@/components/custom-mdDataItem'
import { CustomPopover } from '@/components/custom-popover'
import CustomSubmitButton from '@/components/custom-submit-button'
import { toastError, toastSuccess } from '@/components/custom-toast'
import { SheetContentHeader } from '@/components/sheet-content-header'
import type { MdData } from '@/lib/mdData-crud'
import { cn } from '@/lib/utils'
import { useMdData } from '@/providers/md-data-provider'
import handleDeleteMdData from './handle-delete-mdData'

export default function DisplayMdDataItemOnSheet({
  mdDatas,
  session,
  current,
  limit,
}: {
  mdDatas: MdData[]
  session: Session | null
  current: number
  limit: number
}) {
  const { mdData, setIsNew } = useMdData()
  return (
    <div className='mt-4 overflow-y-scroll max-h-5/12 min-h-[240px]'>
      <SheetContentHeader title='Slides' current={current} limit={limit} />
      <div className='mt-[-14px]'>
        {mdDatas.map(item => {
          return (
            <div
              key={item.id}
              className={cn(
                'group bg-gray-50 hover:bg-gray-200 transition flex justify-between w-full items-center gap-1 border-b  cursor-pointer pl-4 pr-1 py-2',
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
                    console.log('result', result)

                    if (result.status === 'error') {
                      toastError(result.message)
                      return
                    }
                    if (result.createdNew) {
                      setIsNew(true)
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
