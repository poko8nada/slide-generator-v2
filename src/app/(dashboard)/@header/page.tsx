import { auth } from '@/auth'
import GeneralHeader from '@/components/general-header'
import HeaderLogo from '@/components/header-logo'
import ControlUserAction from '@/feature/control-user-action'
import DisplaySheet from '@/feature/display-sheet'
import DisplayMdDataItemOnSheet from '@/feature/display-mdDataItem-onSheet'
import { type MdData, getMdDatas } from '@/lib/mdData-crud'
import { getMdDataCountAction } from './getMdDataCountAction'
import DisplayImageOnSheet from '@/feature/display-image-onSheet'
import { getCloudFlareImageIds } from '@/lib/image-crud'

export default async function Page() {
  const session = await auth()
  const mdDatas: MdData[] = await getMdDatas(session)
  const mdDataCount = await getMdDataCountAction(session)
  const cloudFlareImageIds = await getCloudFlareImageIds(session)

  return (
    <>
      <GeneralHeader>
        <div className='flex items-center gap-2'>
          {session && (
            <DisplaySheet session={session} mdDataCount={mdDataCount}>
              <div className='overflow-y-scroll'>
                <DisplayMdDataItemOnSheet mdDatas={mdDatas} session={session} />
                <DisplayImageOnSheet cloudFlareImageIds={cloudFlareImageIds} />
              </div>
            </DisplaySheet>
          )}
          <HeaderLogo />
        </div>
        <ControlUserAction session={session} />
      </GeneralHeader>
    </>
  )
}
