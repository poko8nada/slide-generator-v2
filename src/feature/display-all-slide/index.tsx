'use client'
import Loader from '@/components/loader'
import { useMdData } from '@/providers/md-data-provider'
import { useSlide } from '@/providers/slide-container-provider'
import { useSlideSnap } from '@/providers/slide-snap-provider'
import parse from 'html-react-parser'
import { useState } from 'react'
import { useCustomSnap } from './useCustomSnap'

export default function DisplayAllSlide() {
  const { mdData } = useMdData()
  const { revealRef } = useSlide()
  const { slideSnap, setSlideSnap } = useSlideSnap()
  const [isLoading, setIsLoading] = useState(true)

  useCustomSnap(mdData.body, revealRef, setSlideSnap, setIsLoading)

  return (
    <div className='reveal-print'>
      <div className='reveal center'>
        <div className='slides !min-h-[200px]'>
          {isLoading && <Loader />}
          {slideSnap &&
            parse(slideSnap.map(item => item.outerHTML.toString()).join(''))}
        </div>
      </div>
    </div>
  )
}
