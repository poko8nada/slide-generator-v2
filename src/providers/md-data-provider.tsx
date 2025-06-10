'use client'
import type { MdData } from '@/lib/mdData-crud'
import type React from 'react'
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react'
import {
  useUnsavedBeforeUnload,
  useUnsavedRouteChange,
} from '@/lib/unsaved-warning'

const today = new Date()
const initialMdData: MdData = {
  id: 'example_0001',
  userId: '',
  title: '📚マークダウンで簡単スライド作成',
  body: '',
  createdAt: today,
  updatedAt: today,
}

// コンテキスト定義
type MdDataContextType = {
  mdData: MdData
  updateMdData: (data: MdData) => void
  updateMdBody: (body: string) => void
  activeSlideIndex: number
  setActiveSlideIndex: React.Dispatch<React.SetStateAction<number>>
  isDiff: boolean
  setIsDiff: React.Dispatch<React.SetStateAction<boolean>>
  isNew: boolean
  setIsNew: React.Dispatch<React.SetStateAction<boolean>>
}

const MdDataContext = createContext<MdDataContextType | undefined>(undefined)

// Provider component
export const MdDataProvider = ({
  children,
  isLoggedIn,
}: {
  children: ReactNode
  isLoggedIn: boolean
}) => {
  const [mdData, setMdData] = useState<MdData>(initialMdData)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [isDiff, setIsDiff] = useState(false)
  const [isNew, setIsNew] = useState(false)

  useUnsavedBeforeUnload(isDiff, isLoggedIn)
  useUnsavedRouteChange(isDiff, isLoggedIn)

  const updateMdData = (data: MdData) => {
    setMdData(data)
  }
  const updateMdBody = useCallback((body: string) => {
    setMdData((prev: MdData) => ({ ...prev, body }))
  }, [])

  return (
    <MdDataContext.Provider
      value={{
        mdData,
        updateMdData,
        updateMdBody,
        activeSlideIndex,
        setActiveSlideIndex,
        isDiff,
        setIsDiff,
        isNew,
        setIsNew,
      }}
    >
      {children}
    </MdDataContext.Provider>
  )
}

// カスタムフック
export const useMdData = (): MdDataContextType => {
  const context = useContext(MdDataContext)
  if (!context) {
    throw new Error('useMdData must be used within an MdDataProvider')
  }
  return context
}
