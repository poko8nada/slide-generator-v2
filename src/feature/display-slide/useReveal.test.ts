import { renderHook } from '@testing-library/react'
import markdownToHtml from '@/lib/parse'
import { useReveal } from './useReveal'

jest.mock('@/lib/parse', () => jest.fn())
jest.mock('highlight.js', () => ({
  highlightElement: jest.fn(),
}))

describe('useReveal', () => {
  let containerRef: React.RefObject<HTMLDivElement>
  let slidesRef: React.RefObject<HTMLDivElement>
  interface MockReveal {
    initialize: jest.Mock
    sync: jest.Mock
    layout: jest.Mock
    slide: jest.Mock
    destroy: jest.Mock
  }
  let mockReveal: MockReveal

  beforeEach(() => {
    containerRef = { current: document.createElement('div') }
    slidesRef = { current: document.createElement('div') }
    mockReveal = {
      initialize: jest.fn(),
      sync: jest.fn(),
      layout: jest.fn(),
      slide: jest.fn(),
      destroy: jest.fn(),
    }
    jest.spyOn(global, 'requestAnimationFrame').mockImplementation(cb => {
      cb(0)
      return 0
    })
    jest.mock('reveal.js', () => ({
      __esModule: true,
      default: jest.fn(() => mockReveal),
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize Reveal.js and update slides', async () => {
    const mdData = '# Slide 1\n---\n# Slide 2'
    ;(markdownToHtml as jest.Mock).mockResolvedValueOnce('<h1>Slide 1</h1>')
    ;(markdownToHtml as jest.Mock).mockResolvedValueOnce('<h1>Slide 2</h1>')

    renderHook(() => useReveal(containerRef, mdData, slidesRef, 0))
    await new Promise(resolve => setTimeout(resolve, 0)) // 非同期処理を待機

    expect(mockReveal.initialize).toHaveBeenCalled()
    expect(mockReveal.sync).toHaveBeenCalled()
    expect(mockReveal.layout).toHaveBeenCalled()
    expect(mockReveal.slide).toHaveBeenCalledWith(0, 0)
  })

  it('should update slides when mdData changes', async () => {
    const mdData = '# Slide 1\n---\n# Slide 2'
    ;(markdownToHtml as jest.Mock).mockResolvedValueOnce('<h1>Slide 1</h1>')
    ;(markdownToHtml as jest.Mock).mockResolvedValueOnce('<h1>Slide 2</h1>')

    const { rerender } = renderHook(
      ({ data }) => useReveal(containerRef, data, slidesRef, 0),
      { initialProps: { data: mdData } },
    )

    const newMdData = '# Slide 3\n---\n# Slide 4'
    ;(markdownToHtml as jest.Mock).mockResolvedValueOnce('<h1>Slide 3</h1>')
    ;(markdownToHtml as jest.Mock).mockResolvedValueOnce('<h1>Slide 4</h1>')

    rerender({ data: newMdData })

    expect(mockReveal.sync).toHaveBeenCalled()
    expect(mockReveal.layout).toHaveBeenCalled()
  })
})
