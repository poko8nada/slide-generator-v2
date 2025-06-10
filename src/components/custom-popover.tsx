'use client'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { EllipsisVertical } from 'lucide-react'
import { useState } from 'react'

export function CustomPopover({
  contentClassName,
  triggerClassName,
  children,
}: {
  contentClassName?: string
  triggerClassName?: string
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        asChild
        className={cn(triggerClassName, {
          'opacity-100': isOpen,
        })}
      >
        <EllipsisVertical />
      </PopoverTrigger>
      <PopoverContent className={cn('w-fit', contentClassName)} side='right'>
        {children}
      </PopoverContent>
    </Popover>
  )
}
