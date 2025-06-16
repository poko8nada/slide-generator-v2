export function CountIndicator({
  current,
  limit,
  size = 'md',
}: { current: number; limit: number; size?: 'xs' | 'sm' | 'md' }) {
  const isLimit = current >= limit
  const sizeClass =
    size === 'xs'
      ? 'px-2 py-0.5 text-xs'
      : size === 'sm'
        ? 'px-3 py-0.5 text-sm'
        : 'px-4 py-1 text-base'
  return (
    <div className='flex items-center gap-1'>
      <span
        className={`rounded-full font-medium transition-colors duration-200 border ${sizeClass} \
          ${
            isLimit
              ? 'bg-red-50 text-red-500 border-red-200'
              : 'bg-gray-50 text-gray-700 border-gray-200'
          }
        `}
        style={{ letterSpacing: '0.03em', minWidth: 40, textAlign: 'center' }}
        title={isLimit ? '上限に達しています' : undefined}
      >
        {current}
        <span className='opacity-40 mx-0.5'>/</span>
        {limit}
      </span>
    </div>
  )
}
