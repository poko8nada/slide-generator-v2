import { auth } from '@/auth'
import EditMarkdown from '@/feature/edit-markdown'
import { type Slide, getSlides } from '@/lib/slide-crud'

export default async function MarkdownPage() {
  const session = await auth()

  let allSlide: Slide[]

  if (session) {
    const slides: Slide[] = await getSlides(session)
    allSlide = slides
  } else {
    allSlide = []
  }

  return <EditMarkdown allSlide={allSlide} session={session} />
}
