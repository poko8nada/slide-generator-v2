'use client'
import { useState } from 'react'
import { Check, Copy as CopyIcon } from 'lucide-react'

export default function DisplayImageOnSheet({
  cloudFlareImageIds,
}: {
  cloudFlareImageIds: {
    cloudflareImageId: string
  }[]
}) {
  const imageIds = cloudFlareImageIds.map(imageId => imageId.cloudflareImageId)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (src: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(src)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1200)
    }
  }

  return (
    <div className='grid grid-cols-3 gap-4 p-4 h-6/12 mt-4'>
      {imageIds.map(imageId => {
        const src = `/api/images/${imageId}`
        return (
          <div
            key={imageId}
            className='group flex items-center justify-center p-2 rounded-md aspect-square bg-gray-100 relative overflow-hidden'
          >
            <img
              src={src}
              alt={`${imageId}`}
              className='w-full h-full object-contain transition duration-200 group-hover:blur-sm'
            />
            <div className='absolute inset-0 flex flex-col justify-center items-center gap-2 p-2 group-hover:opacity-100 opacity-0 transition-opacity ease-in duration-200 bg-gray-100/80'>
              <button
                type='button'
                className='flex items-center gap-1 text-gray-700 text-xs font-medium px-2 py-1 rounded-md cursor-pointer border border-gray-300 shadow-sm bg-white/80 backdrop-blur-sm transition
                  hover:bg-gray-700 hover:text-white hover:shadow-md hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400'
                onClick={() => handleCopy(src, imageId)}
              >
                {copiedId === imageId ? (
                  <>
                    <Check size={14} aria-label='copied' />
                    Copied
                  </>
                ) : (
                  <>
                    <CopyIcon size={14} aria-label='copy' />
                    Copy
                  </>
                )}
              </button>
              <button
                type='button'
                className='flex items-center gap-1 text-red-500 text-xs font-medium px-2 py-1 rounded-md cursor-pointer border border-red-200 shadow-sm bg-white/80 backdrop-blur-sm transition
                  hover:bg-red-500 hover:text-white hover:shadow-md hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-300'
                // onClick={handleDelete} // デリート関数は未実装
              >
                Delete
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
