export default function GeneralHeader({
  children,
}: { children?: React.ReactNode }) {
  return (
    <header className='bg-white border-b z-20'>
      <div className='mx-auto flex h-18 max-w-[1340px] items-center justify-between gap-8 px-3 sm:px-6 lg:px-6'>
        {/* <div className='flex flex-1 items-center justify-end md:justify-between'> */}
        {/* <nav aria-label='Global' className='hidden md:block'>
            <ul className='flex items-center gap-6 text-sm'>
              <li>
                <a
                  className='text-gray-500 transition hover:text-gray-500/75'
                  href='/'
                >
                  About
                </a>
              </li>

              <li>
                <a
                  className='text-gray-500 transition hover:text-gray-500/75'
                  href='/'
                >
                  Careers
                </a>
              </li>

              <li>
                <a
                  className='text-gray-500 transition hover:text-gray-500/75'
                  href='/'
                >
                  History
                </a>
              </li>

              <li>
                <a
                  className='text-gray-500 transition hover:text-gray-500/75'
                  href='/'
                >
                  Services
                </a>
              </li>

              <li>
                <a
                  className='text-gray-500 transition hover:text-gray-500/75'
                  href='/'
                >
                  Projects
                </a>
              </li>

              <li>
                <a
                  className='text-gray-500 transition hover:text-gray-500/75'
                  href='/'
                >
                  Blog
                </a>
              </li>
            </ul>
          </nav> */}

        {children}
      </div>
    </header>
  )
}
