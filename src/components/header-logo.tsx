import UserLevel from '@/components/userLevel'

export default function HeaderLogo({
  isPro,
  isLoggedIn,
}: { isPro: boolean; isLoggedIn: boolean }) {
  return (
    <div className='flex items-center gap-3'>
      <a className='relative' href='/'>
        <span className='sr-only'>Home</span>
        <img src='/logo.svg' className='h-11 w-auto' alt='' />
        <span className='text-xs tracking-tighter absolute -bottom-1 -right-3.5'>
          ver 0.9.0
        </span>
      </a>
      <UserLevel isPro={isPro} isLoggedIn={isLoggedIn} />
    </div>
  )
}
