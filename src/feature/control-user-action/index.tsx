'use client'
import CustomButton from '@/components/custom-button'
import { toastError, toastSuccess } from '@/components/custom-toast'
import { SignInBtn, SignOutBtn } from '@/components/ui/auth-btn'
import UserProfile from '@/components/user-profile'
import { handleSignIn, handleSignOut } from '@/lib/handle-auth'
import { useSlideSnap } from '@/providers/slide-snap-provider'
import { Download } from 'lucide-react'
import type { Session } from 'next-auth'
import Form from 'next/form'
import { useState } from 'react'
import { pdfDownload } from './pdfDownload'

export default function ControlUserAction({
  session,
}: {
  session: Session | null
}) {
  const { slideSnap } = useSlideSnap()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (!slideSnap) return
    setIsLoading(true)
    const error = await pdfDownload(slideSnap)
    if (error) {
      toastError(error)
      setIsLoading(false)
      return
    }
    toastSuccess('download success')
    setIsLoading(false)
  }
  return (
    <div className='flex items-start gap-4'>
      <CustomButton
        isLoading={isLoading}
        onClick={handleClick}
        variant={'outline'}
        icon={<Download />}
        disabled={!slideSnap}
      >
        download as PDF
      </CustomButton>
      <div className='flex flex-col items-center sm:gap-1'>
        {session?.user ? (
          <UserProfile session={session}>
            <Form action={handleSignOut}>
              <SignOutBtn />
            </Form>
          </UserProfile>
        ) : (
          <Form action={handleSignIn}>
            <SignInBtn />
          </Form>
        )}
      </div>
    </div>
  )
}
