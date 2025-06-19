import hljs from 'highlight.js'
import { type RefObject, useEffect, useRef } from 'react'
import type Reveal from 'reveal.js'
import { NEW_MDDATA_TITLE } from '@/lib/constants'
import markdownToHtml from '@/lib/parse'

function getSlides(md: string): Promise<string[]> {
  // Markdownをスライドに分割 (3本のハイフンのみを対象)
  const slides = md
    .split(/(?<=\r?\n|^)---(?=\r?\n|$)/)
    .map(content => content.trim())

  // スライドをHTMLに変換
  const htmlSlides = Promise.all(
    slides.map(async slide => {
      return await markdownToHtml(slide)
    }),
  )
  return slides.length > 0 ? htmlSlides : Promise.resolve([''])
}

function setSlides(
  slides: string[],
  slidesRef: RefObject<HTMLDivElement | null>,
  revealRef: RefObject<Reveal.Api | null>,
  activeSlideIndex: number,
): void {
  if (!slidesRef.current || !revealRef.current) return

  const slidesContainer = slidesRef.current
  const currentSlides = Array.from(slidesContainer.children)

  // 新しいスライドを作成
  const newSlides = slides.map((html, index) => {
    const section = document.createElement('section')
    section.innerHTML = html // 安全なHTMLをセット
    // アクティブスライド以外にhidden属性をセット
    if (index !== activeSlideIndex) {
      section.setAttribute('hidden', '')
    }
    // biome-ignore lint/complexity/noForEach: <explanation>
    section.querySelectorAll('pre code').forEach(block => {
      hljs.highlightElement(block as HTMLElement) // コードブロックをハイライト
    })
    return section
  })

  // 古いスライドを削除
  for (const slide of currentSlides) {
    if (slide.parentNode) {
      slide.parentNode.removeChild(slide)
    }
  }

  // 新しいスライドを追加
  for (const slide of newSlides) {
    slidesContainer.appendChild(slide)
  }
}

function updateSlides(
  activeSlideIndex: number,
  revealRef: RefObject<Reveal.Api | null>,
): void {
  if (!revealRef.current) return

  // Reveal.jsに同期
  requestAnimationFrame(() => {
    if (!revealRef.current) return
    try {
      revealRef.current.sync()
      revealRef.current.layout()
      revealRef.current.slide(activeSlideIndex, 0)
    } catch (error) {
      console.error('Reveal.js update error:', error)
    }
  })
}

function fixImageHeight(
  slidesRef: RefObject<HTMLDivElement | null>,
  styleRef: RefObject<HTMLStyleElement | null>,
): void {
  const sections = slidesRef.current?.querySelectorAll('section')
  const heightStyles = sections
    ? Array.from(sections).map((section, index) => {
        section.removeAttribute('style')
        section.removeAttribute('class')
        section.removeAttribute('hidden')
        section.style.display = 'block'
        const images = section.querySelectorAll('img')

        if (images.length === 0) return

        section.classList.add(`section_${index}`)

        const usedHeight = Array.from(section.children)
          .filter(child => {
            return child.querySelectorAll('img').length === 0
          })
          .reduce((previousValue: number, currentValue: Element) => {
            const element = currentValue as HTMLElement
            return (
              previousValue + Math.ceil(element.getBoundingClientRect().height)
            )
          }, 0)

        const slideHeight =
          slidesRef.current?.getBoundingClientRect().height ?? 0

        const imgHeight = Math.floor((slideHeight - usedHeight) / images.length)

        const pdfImgHeight = Math.floor(
          // 70 はマジックナンバーで手動調整
          (imgHeight * (70 / slideHeight)) / images.length,
        )

        return `.section_${index} img{height: ${imgHeight}px;} .pdf-page .section_${index} img{height: ${pdfImgHeight}px;}`
      })
    : []
  styleRef.current = document.querySelector('main .original_reveal_slide style')

  if (styleRef.current) {
    styleRef.current.innerHTML = heightStyles.join('')
  }
}

export function useRevealInit(
  initMDTitle: string,
  initMdData: string,
  slidesRef: RefObject<HTMLDivElement | null>,
  activeSlideIndex: number,
  containerRef: RefObject<HTMLDivElement | null>,
  revealRef: RefObject<Reveal.Api | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  styleRef: RefObject<HTMLStyleElement | null>,
) {
  const isInitializing = useRef(false)

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (initMDTitle !== NEW_MDDATA_TITLE && !initMdData.trim()) {
      return // 初期化を待つ
    }
    if (revealRef.current || isInitializing.current) {
      return
    }
    const init = async () => {
      isInitializing.current = true
      try {
        // すでに初期化済みなら前のインスタンスを破棄
        if (revealRef.current) {
          revealRef.current.destroy()
          revealRef.current = null
        }
        if (!containerRef.current) return
        const Reveal = (await import('reveal.js')).default
        revealRef.current = new Reveal(containerRef.current, {
          embedded: true,
          autoSlide: false,
          transition: 'slide',
          autoAnimate: false,
          disableLayout: false,
          pdfMaxPagesPerSlide: 1,
          pdfSeparateFragments: true,
          keyboard: false,
          scrollActivationWidth: 0,
        })
        const slides = await getSlides(initMdData)
        setSlides(slides, slidesRef, revealRef, 0)
        await revealRef.current.initialize()
        fixImageHeight(slidesRef, styleRef)
        updateSlides(activeSlideIndex, revealRef)
        setLoading(false)
      } catch (error) {
        throw new Error(`Initialization error: ${error}`)
      } finally {
        isInitializing.current = false
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initMDTitle, initMdData])

  // refはuseEffectの依存配列に含めなくてよい
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    return () => {
      // クリーンアップ
      if (revealRef.current) {
        revealRef.current.destroy()
        revealRef.current = null
      }
    }
  }, [])
}

export function useRevealUpdate(
  mdData: string,
  slidesRef: RefObject<HTMLDivElement | null>,
  activeSlideIndex: number,
  revealRef: RefObject<Reveal.Api | null>,
  styleRef: RefObject<HTMLStyleElement | null>,
) {
  // refはuseEffectの依存配列に含めなくてよい
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!revealRef.current || !slidesRef.current) return

    const update = async () => {
      try {
        const slides = await getSlides(mdData)
        setSlides(slides, slidesRef, revealRef, 0)
        fixImageHeight(slidesRef, styleRef)
        updateSlides(activeSlideIndex, revealRef)
      } catch (error) {
        throw new Error(`Slide update error: ${error}`)
      }
    }
    update()
  }, [mdData, activeSlideIndex])
}
