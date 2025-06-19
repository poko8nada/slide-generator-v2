export default function Divider({
  title,
  className,
}: {
  title: string
  className?: string
}) {
  return (
    <div className={className}>
      <div className='flex items-center bg-background h-10'>
        <span className='h-px flex-1 bg-gray-200' />
        <span className='shrink-0 px-4 text-foreground'>{title}</span>
        <span className='h-px flex-1 bg-gray-200' />
      </div>
    </div>
  )
}
