import { auth } from '@/auth'
import GeneralHeader from '@/components/general-header'
import HeaderLogo from '@/components/header-logo'
import ControlUserAction from '@/feature/control-user-action'
import DisplaySheet from '@/feature/display-sheet'
import DisplayMdDataItemOnSheet from '@/feature/display-mdDataItem-onSheet'
import { type MdData, getMdDatas } from '@/lib/mdData-crud'
import { getCountInfo } from './getCountAction'
import DisplayImageOnSheet from '@/feature/display-image-onSheet'
import { getCloudFlareImageIds } from '@/lib/image-crud'

export default async function Page() {
  const session = await auth()
  const mdDatas: MdData[] = await getMdDatas(session)
  const cloudFlareImageIds = await getCloudFlareImageIds(session)

  const mdDataCount = getCountInfo({
    session,
    items: mdDatas,
    type: 'mdData',
  })

  const imageCount = getCountInfo({
    session,
    items: cloudFlareImageIds,
    type: 'image',
  })

  return (
    <>
      <GeneralHeader>
        <div className='flex items-center gap-2'>
          {session && (
            <DisplaySheet session={session} mdDataCount={mdDataCount}>
              <div className='overflow-y-scroll'>
                <DisplayMdDataItemOnSheet
                  mdDatas={mdDatas}
                  session={session}
                  current={mdDataCount.current}
                  limit={mdDataCount.limit}
                />
                <DisplayImageOnSheet
                  cloudFlareImageIds={cloudFlareImageIds}
                  session={session}
                  current={imageCount.current}
                  limit={imageCount.limit}
                />
              </div>
            </DisplaySheet>
          )}
          <HeaderLogo isPro={mdDataCount.isPro} />
        </div>
        <ControlUserAction session={session} />
      </GeneralHeader>
    </>
  )
}
