'use client'
import { Label } from '@/components/ui/label'
import type { MdData } from '@/lib/mdData-crud'
import { confirmUnsaved } from '@/lib/unsaved-warning'
import { useMdData } from '@/providers/md-data-provider'

export default function CustomMdDataItem({ mdData }: { mdData: MdData }) {
  const { updateMdData, isDiff, mdData: selectedMdData, setIsNew } = useMdData()
  const { id, title, updatedAt } = mdData

  if (!mdData) return null

  const handleMdDataSelect = () => {
    if (!confirmUnsaved(isDiff)) return
    updateMdData(mdData)
    setIsNew(false)
  }

  return (
    <div
      className='flex items-center w-full'
      // biome-ignore lint/a11y/useSemanticElements: <explanation>
      role='button'
      tabIndex={0}
      onClick={handleMdDataSelect}
      onKeyDown={e => {
        if ((e.key === 'Enter' || e.key === ' ') && confirmUnsaved(isDiff)) {
          updateMdData(mdData)
          setIsNew(false)
        }
      }}
    >
      <Label htmlFor={id} className='block w-full cursor-pointer'>
        <input
          type='radio'
          value={id}
          id={id}
          name='allMdData'
          className='sr-only'
          defaultChecked={selectedMdData.id === id}
        />
        <p className='text-left text-sm'>{title ?? '無題'}</p>
        <p className='text-right text-sm text-muted-foreground'>
          {updatedAt ? new Date(updatedAt).toLocaleString() : '-'}
        </p>
      </Label>
    </div>
  )
}
