import type { Session } from 'next-auth'
import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function UserProfile({
  children,
  session,
}: {
  children: React.ReactNode
  session: Session
}) {
  if (!session.user) return null
  return (
    <div className='flex items-center gap-2'>
      {session.user.image && (
        <DropdownMenu>
          <DropdownMenuTrigger className='cursor-pointer'>
            <div className='h-10 w-10 p-1 overflow-hidden rounded-full hover:ring-2 transition-shadow duration-300'>
              <img
                src={session.user.image}
                alt={session.user.name || 'User profile'}
                className='h-full w-full object-cover'
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {React.Children.map(children, child => {
              return <DropdownMenuItem>{child}</DropdownMenuItem>
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <span className='text-sm font-medium'>{session.user.name}</span>
    </div>
  )
}
