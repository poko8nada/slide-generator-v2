'use client'
import type React from 'react'
import { type ReactNode, createContext, useContext, useRef } from 'react'

interface SlideContainerContextProps {
  // containerRef: React.RefObject<HTMLDivElement | null>
  revealRef: React.RefObject<Reveal.Api | null>
}

const SlideContainerContext = createContext<
  SlideContainerContextProps | undefined
>(undefined)

export const SlideContainerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // const containerRef = useRef<HTMLDivElement>(null)
  const revealRef = useRef<Reveal.Api | null>(null)

  return (
    <SlideContainerContext.Provider value={{ revealRef }}>
      {children}
    </SlideContainerContext.Provider>
  )
}

export const useSlide = (): SlideContainerContextProps => {
  const context = useContext(SlideContainerContext)
  if (!context) {
    throw new Error(
      'useSlideContainer must be used within a SlideContainerProvider',
    )
  }
  return context
}
