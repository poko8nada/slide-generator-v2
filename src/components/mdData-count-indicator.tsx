type MdDataCountIndicatorProps = {
  current: number
  limit: number
  isPro: boolean
}

export function MdDataCountIndicator({
  current,
  limit,
  isPro,
}: MdDataCountIndicatorProps) {
  const isLimit = current >= limit
  const color = isLimit ? 'text-red-600 font-bold' : 'text-gray-700'
  return (
    <div className='flex items-center gap-2'>
      <span className={color}>
        {current} / {limit}
      </span>
      {isPro && (
        <span className='ml-1 px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs'>
          PRO
        </span>
      )}
    </div>
  )
}
