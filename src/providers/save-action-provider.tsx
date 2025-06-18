'use client'
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'

interface SaveActionContextType {
  // 保存関数を登録
  registerSaveAction: (saveAction: () => Promise<void>) => void
  // 保存を実行
  executeSave: () => Promise<void>
  // 保存中かどうか
  isSaving: boolean
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>
}

const SaveActionContext = createContext<SaveActionContextType | null>(null)

export function SaveActionProvider({ children }: { children: ReactNode }) {
  const [saveAction, setSaveAction] = useState<(() => Promise<void>) | null>(
    null,
  )
  const [isSaving, setIsSaving] = useState(false)

  const registerSaveAction = useCallback((action: () => Promise<void>) => {
    setSaveAction(() => action)
  }, [])

  const executeSave = useCallback(async () => {
    if (!saveAction || isSaving) return

    setIsSaving(true)
    try {
      await saveAction()
    } finally {
      setIsSaving(false)
    }
  }, [saveAction, isSaving])

  return (
    <SaveActionContext.Provider
      value={{
        registerSaveAction,
        executeSave,
        isSaving,
        setIsSaving,
      }}
    >
      {children}
    </SaveActionContext.Provider>
  )
}

export function useSaveAction() {
  const context = useContext(SaveActionContext)
  if (!context) {
    throw new Error('useSaveAction must be used within SaveActionProvider')
  }
  return context
}
