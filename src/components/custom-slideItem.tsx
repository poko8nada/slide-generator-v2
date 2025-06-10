'use client'
import { Label } from '@/components/ui/label'
import type { Slide } from '@/lib/slide-crud'
import { useMdData } from '@/providers/md-data-provider'
import { confirmUnsaved } from '@/lib/unsaved-warning'

export default function CustomSlideItem({
  slide,
}: {
  slide: Slide
}) {
  if (!slide) return null

  const { updateMdData, isDiff, mdData, setIsNew } = useMdData()
  const { id, title, updatedAt } = slide

  const handleSlideSelect = () => {
    if (!confirmUnsaved(isDiff)) return
    updateMdData(slide)
    setIsNew(false)
  }

  return (
    <div
      className='flex items-center w-full'
      onClick={handleSlideSelect}
      onKeyDown={e => {
        if ((e.key === 'Enter' || e.key === ' ') && confirmUnsaved(isDiff)) {
          updateMdData(slide)
          setIsNew(false)
        }
      }}
    >
      <Label htmlFor={id} className='block w-full'>
        <input
          type='radio'
          value={id}
          id={id}
          name='allSlide'
          className='sr-only'
          defaultChecked={mdData.id === id}
        />
        <p className='text-left text-sm'>{title ?? '無題'}</p>
        <p className='text-right text-sm text-muted-foreground'>
          {updatedAt ? new Date(updatedAt).toLocaleString() : '-'}
        </p>
      </Label>
    </div>
  )
}
