'use client'
import { SignOutBtn } from '@/components/ui/auth-btn'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { handleSignOut } from '@/lib/handle-auth'
import { Menu } from 'lucide-react'
import Form from 'next/form'
import CustomSubmitButton from '@/components/custom-submit-button'
import { FilePlus } from 'lucide-react'
import type { Session } from 'next-auth'
import { useState } from 'react'
import handleCreateNewMdData from './handle-create-new-mdData'
import { useMdData } from '@/providers/md-data-provider'
import { toastSuccess, toastError } from '@/components/custom-toast'
import UserLevel from '@/components/userLevel'

type MdDataCount = { current: number; limit: number; isPro: boolean }

export default function DisplaySheet({
  session,
  mdDataCount,
  children,
}: { session: Session; mdDataCount: MdDataCount; children?: React.ReactNode }) {
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
            <UserLevel isPro={mdDataCount.isPro} />
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
