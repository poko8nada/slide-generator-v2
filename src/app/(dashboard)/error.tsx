'use client' // Error boundaries must be Client Components

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('error.tsx', error)
  }, [error])

  return (
    <div className='flex flex-col items-center justify-center bg-gray-100 p-4'>
      <h3 className='text-lg text-gray-800 mb-4'>Something went wrong!</h3>
      <pre className='bg-gray-200 text-gray-700 p-3 rounded-md mb-4 text-sm whitespace-break-spaces'>
        {error.message}
        {error.digest && `\nDigest: ${error.digest}`}
      </pre>
      <Button variant='default' size='default' onClick={() => reset()}>
        Try again
      </Button>
    </div>
  )
}
