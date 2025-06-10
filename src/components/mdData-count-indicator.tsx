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
  return (
    <div className='flex items-center gap-1'>
      <span
        className={`px-2.5 py-0.5 rounded-md text-sm font-semibold shadow-sm transition-colors duration-200 ${
          isLimit
            ? 'bg-red-100 text-red-700 border border-red-300'
            : 'bg-gray-100 text-gray-800 border border-gray-200'
        }`}
        title={isLimit ? '上限に達しています' : undefined}
      >
        {current} <span className='opacity-60'>/</span> {limit}
      </span>
      {isPro ? (
        <span className='ml-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold border border-yellow-300'>
          PRO
        </span>
      ) : (
        <span className='ml-1 px-2 py-0.5 rounded-full bg-gray-200 text-gray-500 text-xs font-semibold border border-gray-300'>
          free
        </span>
      )}
    </div>
  )
}
