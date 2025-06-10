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
import { MdDataCountIndicator } from '@/components/mdData-count-indicator'

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
      <SheetContent side='left'>
        <SheetHeader>
          <SheetTitle className='sr-only'>MarkDown</SheetTitle>
          <div className='flex gap-1'>
            <Form
              action={() => {
                handleCreateNewMdData(session)
                setIsNew(true)
                setOpen(false)
              }}
            >
              <CustomSubmitButton icon={<FilePlus />}>
                new md file
              </CustomSubmitButton>
            </Form>
            <MdDataCountIndicator
              current={mdDataCount.current}
              limit={mdDataCount.limit}
              isPro={mdDataCount.isPro}
            />
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
