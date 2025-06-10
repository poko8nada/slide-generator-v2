import { auth } from '@/auth'
import EditMarkdown from '@/feature/edit-markdown'
import { type MdData, getMdDatas } from '@/lib/mdData-crud'

export default async function MarkdownPage() {
  const session = await auth()

  let allMdDatas: MdData[]

  if (session) {
    const slides: MdData[] = await getMdDatas(session)
    allMdDatas = slides
  } else {
    allMdDatas = []
  }

  return <EditMarkdown allMdDatas={allMdDatas} session={session} />
}
