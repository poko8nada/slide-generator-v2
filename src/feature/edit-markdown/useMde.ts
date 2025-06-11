import { useEffect } from 'react'
import { useMdData } from '@/providers/md-data-provider'

function isImageUrl(url: string): boolean {
  try {
    new URL(url)
  } catch {
    return false
  }

  // 画像ファイルの拡張子をチェック
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif)(\?.*)?$/i
  return imageExtensions.test(url)
}

function pasteAsImageUrl(cm: CodeMirror.Editor, event: ClipboardEvent): void {
  const clipboardData = event.clipboardData
  if (!clipboardData) return

  // text/html か text/plain のどちらかに値があれば使う
  let pasteData = clipboardData.getData('text/html').trim()
  if (!pasteData) {
    pasteData = clipboardData.getData('text/plain').trim()
  }
  if (!pasteData) return

  // 画像URLかチェック
  if (isImageUrl(pasteData)) {
    // デフォルトのペースト処理を防ぐ
    event.preventDefault()

    // カーソル位置を取得
    const cursor = cm.getCursor()

    // 画像のMarkdown記法を挿入
    const imageMarkdown = `![ImageAlt](${pasteData})`
    cm.replaceRange(imageMarkdown, cursor)

    // カーソルを画像テキストの後に移動
    const newCursor = {
      line: cursor.line,
      ch: cursor.ch + imageMarkdown.length,
    }
    cm.setCursor(newCursor)

    console.log('画像URL自動変換:', pasteData)
  }
}

function updateActiveSlide(
  mdDataBody: string | undefined,
  mdeRef: React.RefObject<{ getMdeInstance: () => EasyMDE } | null>,
  setActiveSlideIndex: (index: number) => void,
) {
  if (!mdDataBody) return
  if (!mdeRef.current) return

  const mdeInstance = mdeRef.current.getMdeInstance()
  if (!mdeInstance) return

  const cm = mdeInstance.codemirror
  const cursor = cm.getCursor()
  const textBeforeCursor = mdDataBody.slice(0, cm.indexFromPos(cursor))
  // スライドの区切り(3本のハイフンのみを対象)
  const slideBreaks =
    textBeforeCursor.split(/(?<=\r?\n|^)---(?=\r?\n|$)/).length - 1
  const slideIndex = Math.max(0, slideBreaks)
  setActiveSlideIndex(slideIndex)
}

export default function useMde(
  mdeRef: React.RefObject<{ getMdeInstance: () => EasyMDE } | null>,
) {
  const { mdData, setActiveSlideIndex } = useMdData()
  const mdDataBody = mdData?.body

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const handleUpdateActiveSlide = () => {
      updateActiveSlide(mdDataBody, mdeRef, setActiveSlideIndex)
    }

    // 画像URLペースト用のハンドラ
    const handlePaste = (cm: CodeMirror.Editor, event: ClipboardEvent) => {
      pasteAsImageUrl(cm, event)
    }

    try {
      const mdeInstance = mdeRef.current?.getMdeInstance()
      if (!mdeInstance) return

      const cm = mdeInstance.codemirror
      // カーソル移動や編集時にスライドインデックスを更新
      cm.on('cursorActivity', handleUpdateActiveSlide)
      cm.on('change', handleUpdateActiveSlide)
      // 画像URLペースト時の処理を追加
      cm.on('paste', handlePaste)

      // 初期スライドインデックスを設定
      handleUpdateActiveSlide()
    } catch (error) {
      console.error('Error during MDE initialization:', error)
    }

    return () => {
      try {
        const mdeInstance = mdeRef.current?.getMdeInstance()
        if (!mdeInstance) return

        const cm = mdeInstance.codemirror
        cm.off('cursorActivity', handleUpdateActiveSlide)
        cm.off('change', handleUpdateActiveSlide)
        // クリーンアップ: ペーストイベントも削除
        cm.off('paste', handlePaste)
      } catch (cleanupError) {
        console.error('Error during MDE cleanup:', cleanupError)
      }
    }
  }, [mdDataBody])
}
