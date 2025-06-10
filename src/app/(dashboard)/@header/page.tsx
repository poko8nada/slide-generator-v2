import { auth } from '@/auth'
import GeneralHeader from '@/components/general-header'
import HeaderLogo from '@/components/header-logo'
import ControlUserAction from '@/feature/control-user-action'
import DisplaySheet from '@/feature/display-sheet'
import DisplaySlideItemOnSheet from '@/feature/display-slideItem-onSheet'
import { type Slide, getSlides } from '@/lib/slide-crud'
import {} from '@/components/ui/sheet'

export default async function Page() {
  const session = await auth()
  const slides: Slide[] = await getSlides(session)

  return (
    <>
      <GeneralHeader>
        <div className='flex items-center gap-2'>
          {session && (
            <DisplaySheet session={session}>
              <DisplaySlideItemOnSheet slides={slides} session={session} />
            </DisplaySheet>
          )}
          <HeaderLogo />
        </div>
        <ControlUserAction session={session} />
      </GeneralHeader>
    </>
  )
}
