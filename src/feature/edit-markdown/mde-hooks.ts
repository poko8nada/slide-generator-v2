// 'use client'

import { useEffect, useState } from 'react'
import { useMdData } from '@/providers/md-data-provider'
import type { MdData } from '@/lib/mdData-crud'
import { initialMarketingBody } from '@/lib/relative-md-data-pvd'

/**
 * 画像URLかどうか判定
 */
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

/**
 * 画像URLをMarkdown記法でペースト
 */
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

/**
 * カーソル位置からアクティブスライドを更新
 */
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

/**
 * MDEエディタの各種イベントハンドラ
 */
export function useMde(
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

/**
 * 初期化・スライド切替時の状態同期
 */
export function useInitialDataSync(allMdDatas: MdData[]) {
  const { updateMdBody, updateMdData, mdData, isNew } = useMdData()

  const initialMdData =
    (isNew && allMdDatas[0]) ||
    allMdDatas.find(s => s.id === mdData.id) ||
    allMdDatas[0] ||
    null

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!initialMdData) {
      updateMdBody(initialMarketingBody)
    }
    if (initialMdData) {
      updateMdData(initialMdData)
    }
  }, [initialMdData])

  return initialMdData
}

/**
 * 未保存の変更があるかどうかを管理、保存完了時の関数を提供
 */
export function useUnsavedChanges() {
  const { mdData, setIsDiff } = useMdData()
  const [prevData, setPrevData] = useState({
    id: '',
    body: '',
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // 初期化時
    if (prevData.id === '') {
      setPrevData({
        id: mdData.id,
        body: initialMarketingBody,
      })
      return
    }
    // スライドが切り替わった場合、diffをfalseにする
    if (mdData.id !== prevData.id) {
      setIsDiff(false)
      // 切り替わったスライドのbodyを保存
      setPrevData({
        id: mdData.id,
        body: mdData.body,
      })
      return
    }
    const timer = setTimeout(() => {
      if (mdData.body !== prevData.body) {
        setIsDiff(true)
        return
      }
      setIsDiff(false)
    }, 700)

    return () => {
      clearTimeout(timer)
    }
  }, [mdData, prevData])

  // 保存完了時に呼び出すメソッド
  const markAsSaved = () => {
    console.log('[useUnsavedChanges] 保存完了: markAsSaved呼び出し')
    setPrevData({
      id: mdData.id,
      body: mdData.body,
    })
    setIsDiff(false)
  }

  return { markAsSaved }
}
