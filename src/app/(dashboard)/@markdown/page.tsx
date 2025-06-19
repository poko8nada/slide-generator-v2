import { auth } from '@/auth'
import EditMarkdown from '@/feature/edit-markdown'
import { getOrCreateMdDatas, type MdData } from '@/lib/mdData-crud'

export default async function MarkdownPage() {
  const session = await auth()

  let allMdDatas: MdData[]

  if (session) {
    const slides: MdData[] = await getOrCreateMdDatas(session)
    allMdDatas = slides
  } else {
    allMdDatas = []
  }

  return <EditMarkdown allMdDatas={allMdDatas} session={session} />
}
