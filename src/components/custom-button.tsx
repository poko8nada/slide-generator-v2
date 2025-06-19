import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'

export default function CustomButton({
  onClick,
  children,
  isLoading,
  variant = 'default',
  icon = null,
  disabled = false,
  type = 'button',
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
  return (
    <Button
      onClick={onClick}
      disabled={isLoading || disabled}
      variant={variant}
      type={type}
      className={cn(className, 'cursor-pointer select-none')}
    >
      {isLoading ? <LoaderCircle className='animate-spin' /> : icon}
      {children}
    </Button>
  )
}
