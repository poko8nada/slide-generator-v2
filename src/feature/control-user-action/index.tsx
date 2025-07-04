'use client'
import { Download, Save } from 'lucide-react'
import Form from 'next/form'
import type { Session } from 'next-auth'
import { useState } from 'react'
import CustomButton from '@/components/custom-button'
import { toastError, toastSuccess } from '@/components/custom-toast'
import { SignInBtn, SignOutBtn } from '@/components/ui/auth-btn'
import { IconButton } from '@/components/ui/icon-button'
import UserProfile from '@/components/user-profile'
import { handleSignIn, handleSignOut } from '@/lib/handle-auth'
import { useMdData } from '@/providers/md-data-provider'
import { useSaveAction } from '@/providers/save-action-provider'
import { useSlideSnap } from '@/providers/slide-snap-provider'
import { pdfDownload } from './pdfDownload'

export default function ControlUserAction({
  session,
}: {
  session: Session | null
}) {
  const { executeSave, isSaving } = useSaveAction()
  const { isDiff } = useMdData()
  const { slideSnap } = useSlideSnap()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (!slideSnap) return
    setIsLoading(true)
    const result = await pdfDownload(slideSnap)

    if (result.status === 'error') {
      toastError(result.message)
      setIsLoading(false)
      return
    }
    toastSuccess(result.message)
    setIsLoading(false)
  }
  return (
    <div className='flex items-center gap-4'>
      {session && (
        <IconButton
          onClick={executeSave}
          disabled={isSaving || !isDiff}
          isPending={isSaving}
          size='m'
          icon={<Save />}
          colorScheme='black'
        >
          save
        </IconButton>
      )}
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
