'use client'
import { useRef, useState } from 'react'
import { useMdData } from '@/providers/md-data-provider'
import 'reveal.js/dist/reveal.css'
import 'reveal.js/dist/theme/black.css'
import { useRevealInit, useRevealUpdate } from './useReveal'
import 'highlight.js/styles/monokai.min.css'
import Loader from '@/components/loader'
import SlideViewer from '@/components/slide-viewer'
import { cn } from '@/lib/utils'
import { useSlide } from '@/providers/slide-container-provider'

export default function DisplaySlide() {
  const { mdData, activeSlideIndex } = useMdData()
  // const { containerRef } = useSlide()
  // const revealRef = useRef<Reveal.Api | null>(null)
  const { revealRef } = useSlide()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const slidesRef = useRef<HTMLDivElement | null>(null)
  const styleRef = useRef<HTMLStyleElement | null>(null)

  const [loading, setLoading] = useState(true)

  const initMdData = mdData.body
  const initMdTitle = mdData.title

  useRevealInit(
    initMdTitle,
    initMdData,
    slidesRef,
    activeSlideIndex,
    containerRef,
    revealRef,
    setLoading,
    styleRef,
  )
  useRevealUpdate(mdData.body, slidesRef, activeSlideIndex, revealRef, styleRef)
  return (
    <>
      {/* <style>{layoutStyleString}</style> */}

      <div
        className={cn(
          'original_reveal_slide',
          'relative',
          'min-w-[420px] max-w-[640px] w-full',
          'h-[360px]',
          'sm:h-[400px]',
          'lg:h-[425px]',
          'xl:h-[450px]',
        )}
      >
        <style />
        {loading && <Loader />}
        <SlideViewer containerRef={containerRef} slidesRef={slidesRef} />
      </div>
    </>
  )
}
