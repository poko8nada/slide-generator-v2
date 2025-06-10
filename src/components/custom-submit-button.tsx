'use client'
import { LoaderCircle } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { useFormStatus } from 'react-dom'

export default function CustomSubmitButton({
  children,
  variant = 'default',
  icon = null,
  disabled = false,
  className,
}: {
  onClick?: () => Promise<void>
  children: React.ReactNode
  isLoading?: boolean
  variant?:
    | 'default'
    | 'link'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | null
    | undefined
  icon?: React.ReactNode
  disabled?: boolean
  type?: 'submit' | 'reset' | 'button'
  className?: string
}) {
  const { pending } = useFormStatus()
  return (
    <Button
      disabled={pending || disabled}
      variant={variant}
      type={'submit'}
      className={cn(className, 'cursor-pointer select-none')}
    >
      {pending ? <LoaderCircle className='animate-spin' /> : icon}
      {children}
    </Button>
  )
}
