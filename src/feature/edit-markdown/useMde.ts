import { useEffect } from 'react'
import { useMdData } from '@/providers/md-data-provider'

export default function useMde(
  mdeRef: React.RefObject<{ getMdeInstance: () => EasyMDE } | null>,
) {
  const { mdData, setActiveSlideIndex } = useMdData()
  const mdDataBody = mdData?.body

  useEffect(() => {
    const updateActiveSlide = () => {
      try {
        if (!mdDataBody) return
        if (!mdeRef.current) return

        const mdeInstance = mdeRef.current?.getMdeInstance()
        if (!mdeInstance) return

        const cm = mdeInstance.codemirror
        const cursor = cm.getCursor()
        const textBeforeCursor = mdDataBody.slice(0, cm.indexFromPos(cursor))
        //  スライドの区切り(3本のハイフンのみを対象)
        const slideBreaks =
          textBeforeCursor.split(/(?<=\n|^)---(?=\n|$)/).length - 1
        const slideIndex = Math.max(0, slideBreaks)
        setActiveSlideIndex(slideIndex)
      } catch (error) {
        console.error('Error in updateActiveSlide:', error)
        throw new Error('Failed to update active slide.')
      }
    }

    try {
      const mdeInstance = mdeRef.current?.getMdeInstance()
      if (!mdeInstance) return

      const cm = mdeInstance.codemirror
      // カーソル移動や編集時にスライドインデックスを更新
      cm.on('cursorActivity', updateActiveSlide)
      cm.on('change', updateActiveSlide)

      // 初期スライドインデックスを設定
      updateActiveSlide()
    } catch (error) {
      console.error('Error during MDE initialization:', error)
      throw new Error('Failed to initialize MDE.')
    }

    return () => {
      try {
        const mdeInstance = mdeRef.current?.getMdeInstance()
        if (!mdeInstance) return

        const cm = mdeInstance.codemirror
        cm.off('cursorActivity', updateActiveSlide)
        cm.off('change', updateActiveSlide)
      } catch (cleanupError) {
        console.error('Error during MDE cleanup:', cleanupError)
      }
    }
  }, [mdDataBody, setActiveSlideIndex, mdeRef])
}
