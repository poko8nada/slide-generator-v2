import Divider from '@/components/divider'
import { MdDataProvider } from '@/providers/md-data-provider'
import { SlideContainerProvider } from '@/providers/slide-container-provider'
import { SlideSnapProvider } from '@/providers/slide-snap-provider'
import { auth } from '@/auth'
import { SaveActionProvider } from '@/providers/save-action-provider'

export default async function DashboardLayout({
  children,
  markdown,
  slide,
  header,
}: {
  children: React.ReactNode
  markdown: React.ReactNode
  slide: React.ReactNode
  header: React.ReactNode
  sheet: React.ReactNode
}) {
  const session = await auth()
  return (
    <SlideSnapProvider>
      <MdDataProvider isLoggedIn={!!session}>
        <SlideContainerProvider>
          <SaveActionProvider>
            <div className='sticky top-0 z-50'>{header}</div>
            <main>
              <div className='flex lg:flex-row flex-col justify-center items-center gap-1 p-2'>
                <div className='w-full max-w-[640px] m-2'>{markdown}</div>
                <div className='w-full max-w-[640px] m-2'>{slide}</div>
              </div>
              <Divider
                title='Preview'
                className='mt-10 mb-2 sticky top-18 z-50'
              />
              <div className='p-2 lg:p-4'>{children}</div>
            </main>
          </SaveActionProvider>
        </SlideContainerProvider>
      </MdDataProvider>
    </SlideSnapProvider>
  )
}
