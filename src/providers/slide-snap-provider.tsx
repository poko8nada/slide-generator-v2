'use client'
import type React from 'react'
import { type ReactNode, createContext, useContext, useState } from 'react'
// Create the context
const SlideSnapContext = createContext<
  | {
      slideSnap: HTMLElement[] | null
      setSlideSnap: React.Dispatch<React.SetStateAction<HTMLElement[] | null>>
    }
  | undefined
>(undefined)

// Provider component
export const SlideSnapProvider = ({ children }: { children: ReactNode }) => {
  const [slideSnap, setSlideSnap] = useState<HTMLElement[] | null>(null)

  return (
    <SlideSnapContext.Provider value={{ slideSnap, setSlideSnap }}>
      {children}
    </SlideSnapContext.Provider>
  )
}

// Custom hook to use the context
export const useSlideSnap = () => {
  const context = useContext(SlideSnapContext)
  if (!context) {
    throw new Error('useSlideSnap must be used within an slideSnapProvider')
  }
  return context
}
