'use client'
import { FilePlus, Menu } from 'lucide-react'
import Form from 'next/form'
import type { Session } from 'next-auth'
import { useState } from 'react'
import CustomSubmitButton from '@/components/custom-submit-button'
import { toastError, toastSuccess } from '@/components/custom-toast'
import { SignOutBtn } from '@/components/ui/auth-btn'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { handleSignOut } from '@/lib/handle-auth'
import { useMdData } from '@/providers/md-data-provider'
import handleCreateNewMdData from './handle-create-new-mdData'

type MdDataCount = { current: number; limit: number; isPro: boolean }

export default function DisplaySheet({
  session,
  mdDataCount,
  children,
}: {
  session: Session
  mdDataCount: MdDataCount
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const { setIsNew } = useMdData()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        asChild
        className='rounded cursor-pointer hover:ring-2 transition-shadow duration-300 ring-gray-800'
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side='left' className='max-h-full'>
        <SheetHeader>
          <SheetTitle className='sr-only'>MarkDown</SheetTitle>
          <div className='flex items-center gap-2'>
            <Form
              action={async () => {
                const result = await handleCreateNewMdData(session)
                if (result.status === 'error') {
                  toastError(result.message)
                  return
                }
                toastSuccess(result.message)
                setIsNew(true)
                setOpen(false)
              }}
            >
              <CustomSubmitButton
                icon={<FilePlus />}
                disabled={mdDataCount.limit - mdDataCount.current < 1}
              >
                new md file
              </CustomSubmitButton>
            </Form>
          </div>
        </SheetHeader>
        {children}
        <SheetFooter>
          <Form action={handleSignOut} className='w-full text-right'>
            <SignOutBtn />
          </Form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
