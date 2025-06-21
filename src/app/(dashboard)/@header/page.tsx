import { auth } from '@/auth'
import GeneralHeader from '@/components/general-header'
import HeaderLogo from '@/components/header-logo'
import ControlUserAction from '@/feature/control-user-action'
import DisplayImageOnSheet from '@/feature/display-image-onSheet'
import DisplayMdDataItemOnSheet from '@/feature/display-mdDataItem-onSheet'
import DisplaySheet from '@/feature/display-sheet'
import { getCloudFlareImageIds } from '@/lib/imageId-crud'
import { getOrCreateMdDatas, type MdData } from '@/lib/mdData-crud'
import { getCountInfo } from './getCountAction'

export default async function Page() {
  const session = await auth()
  const isLoggedIn = !!session
  const mdDatas: MdData[] = await getOrCreateMdDatas(session)
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
          <HeaderLogo isPro={mdDataCount.isPro} isLoggedIn={isLoggedIn} />
        </div>
        <ControlUserAction session={session} />
      </GeneralHeader>
    </>
  )
}
