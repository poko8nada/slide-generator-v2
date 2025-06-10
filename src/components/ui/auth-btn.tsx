'use client'
import { LogIn, LogOut } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import CustomButton from '../custom-button'

export function SignInBtn() {
  const { pending } = useFormStatus()
  return (
    <CustomButton type='submit' isLoading={pending} icon={<LogIn />}>
      Sign in
    </CustomButton>
  )
}

export function SignOutBtn() {
  const { pending } = useFormStatus()
  return (
    <CustomButton
      type='submit'
      isLoading={pending}
      icon={<LogOut />}
      variant='ghost'
    >
      Sign out
    </CustomButton>
  )
}
