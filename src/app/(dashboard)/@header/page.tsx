import { auth } from '@/auth'
import GeneralHeader from '@/components/general-header'
import HeaderLogo from '@/components/header-logo'
import ControlUserAction from '@/feature/control-user-action'
import DisplaySheet from '@/feature/display-sheet'
import DisplaySlideItemOnSheet from '@/feature/display-mdDataItem-onSheet'
import { type MdData, getMdDatas } from '@/lib/mdData-crud'
import {} from '@/components/ui/sheet'

export default async function Page() {
  const session = await auth()
  const mdDatas: MdData[] = await getMdDatas(session)

  return (
    <>
      <GeneralHeader>
        <div className='flex items-center gap-2'>
          {session && (
            <DisplaySheet session={session}>
              <DisplaySlideItemOnSheet mdDatas={mdDatas} session={session} />
            </DisplaySheet>
          )}
          <HeaderLogo />
        </div>
        <ControlUserAction session={session} />
      </GeneralHeader>
    </>
  )
}
