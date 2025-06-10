export default function HeaderLogo() {
  return (
    <a className='flex items-center' href='/'>
      <span className='sr-only'>Home</span>
      <img src='/logo.svg' className='h-11 w-auto' alt='' />
      <span className='text-xs tracking-tighter'>ver 0.5.0</span>
    </a>
  )
}
