import type { MdData } from '@/lib/mdData-crud'
import { useEffect, useState } from 'react'
import { useMdData } from '@/providers/md-data-provider'
import { initialMarketingBody } from '@/lib/relative-md-data-pvd'

// 初期化・スライド切替時の状態同期
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

// 未保存の変更があるかどうかを管理、保存完了時の関数を提供
export function useUnsavedChanges() {
  const { mdData, setIsDiff } = useMdData()
  const [prevData, setPrevData] = useState({
    id: '',
    body: '',
  })

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
  }, [mdData, prevData, setIsDiff])

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
