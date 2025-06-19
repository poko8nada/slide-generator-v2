import { CountIndicator } from './count-indicator'

export function SheetContentHeader({
  title,
  current,
  limit,
}: {
  title: string
  current: number
  limit: number
}) {
  return (
    <>
      <div className='flex items-center gap-2 px-4 pb-3 sticky top-0 bg-white z-10'>
        <h2 className='text-xl font-medium tracking-wide text-gray-800 select-none'>
          {title}
        </h2>
        <CountIndicator current={current} limit={limit} size='xs' />
      </div>
      <div className='h-3 w-full bg-gradient-to-b from-black/10 to-transparent pointer-events-none z-[9] sticky top-[38px]' />
    </>
  )
}
