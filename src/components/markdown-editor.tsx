import dynamic from 'next/dynamic'
import 'easymde/dist/easymde.min.css'
import type EasyMDE from 'easymde'
import type { SimpleMDEReactProps } from 'react-simplemde-editor'
import Loader from './loader'

// Dynamic import for SimpleMDE to disable SSR
const SimpleMDE = dynamic(() => import('react-simplemde-editor'), {
  ssr: false,
  loading: () => <Loader />,
})

export default function MarkdownEditor({
  mdDataBody,
  updateMdBody,
  options,
  mdeRef,
}: {
  mdDataBody: string
  updateMdBody: (body: string) => void
  options?: SimpleMDEReactProps['options']
  mdeRef: React.RefObject<{ getMdeInstance: () => EasyMDE } | null>
}) {
  return (
    <SimpleMDE
      value={mdDataBody}
      onChange={updateMdBody}
      options={options}
      getMdeInstance={instance => {
        mdeRef.current = { getMdeInstance: () => instance }
      }}
    />
  )
}
