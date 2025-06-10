import { auth } from '@/auth'
import GeneralHeader from '@/components/general-header'
import HeaderLogo from '@/components/header-logo'
import ControlUserAction from '@/feature/control-user-action'
import DisplaySheet from '@/feature/display-sheet'
import DisplayMdDataItemOnSheet from '@/feature/display-mdDataItem-onSheet'
import { type MdData, getMdDatas } from '@/lib/mdData-crud'
import { getMdDataCountAction } from './getMdDataCountAction'

export default async function Page() {
  const session = await auth()
  const mdDatas: MdData[] = await getMdDatas(session)
  const mdDataCount = await getMdDataCountAction(session)

  return (
    <>
      <GeneralHeader>
        <div className='flex items-center gap-2'>
          {session && (
            <DisplaySheet session={session} mdDataCount={mdDataCount}>
              <DisplayMdDataItemOnSheet mdDatas={mdDatas} session={session} />
            </DisplaySheet>
          )}
          <HeaderLogo />
        </div>
        <ControlUserAction session={session} />
      </GeneralHeader>
    </>
  )
}
