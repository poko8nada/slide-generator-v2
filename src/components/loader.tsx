function CustomDot({ className }: { className?: string }) {
  return (
    <div className={className}>
      <img src='/dot.svg' alt='' />
    </div>
  )
}

export default function Loader() {
  return (
    <div className='absolute w-full h-full flex items-center justify-center z-10 bg-neutral-100'>
      <CustomDot className='m-[-10px] animate-bounce' />
      <CustomDot className='m-[-10px] animate-bounce delay-75' />
      <CustomDot className='m-[-10px] animate-bounce delay-150' />
    </div>
  )
}
