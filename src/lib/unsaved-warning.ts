'use client'
// 保存警告アラート共通ロジック
import { useEffect } from 'react'

// beforeunloadイベント登録
export function useUnsavedBeforeUnload(isDiff: boolean, isLoggedIn: boolean) {
  useEffect(() => {
    if (!isDiff || !isLoggedIn) return

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      // ブラウザに「ページを離れる前の確認ダイアログ」を表示するよう指示
      // returnValueに空文字列を設定することで、ブラウザの標準確認ダイアログが表示される
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => {
      window.removeEventListener('beforeunload', handler)
    }
  }, [isDiff, isLoggedIn])
}

// Next.js内部遷移時の警告
export function useUnsavedRouteChange(isDiff: boolean, isLoggedIn: boolean) {
  useEffect(() => {
    if (!isDiff || !isLoggedIn) return

    // Next.jsのApp Routerでは公式なルート遷移イベントが使えないため、
    // ブラウザのhistory.pushStateを一時的に上書きしてページ遷移を監視する
    // pushStateの元の関数を退避し、下で上書きする
    const pushState = history.pushState
    history.pushState = function (...args) {
      // isDiffがtrueかつユーザーがキャンセルした場合は遷移を止める
      if (
        isDiff &&
        !window.confirm('保存されていない変更があります。移動しますか？')
      ) {
        return
      }
      // @ts-ignore
      return pushState.apply(this, args)
    }

    // クリーンアップ時に元のpushStateに戻す
    return () => {
      history.pushState = pushState
    }
  }, [isDiff, isLoggedIn])
}

// confirm用関数
export function confirmUnsaved(isDiff: boolean): boolean {
  if (!isDiff) return true
  return window.confirm('保存されていない変更があります。続行しますか？')
}
