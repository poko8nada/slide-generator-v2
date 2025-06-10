import { renderHook } from '@testing-library/react'
import { createRef } from 'react'
import { useCustomSnap } from './useCustomSnap'

describe('useCustomSnap', () => {
  it('should return null when containerRef is null', () => {
    const { result } = renderHook(() =>
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      useCustomSnap(false, { current: null } as any),
    )
    expect(result.current).toBe(null)
  })

  it('should log a warning when containerRef is null', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    renderHook(() => useCustomSnap(false, { current: null } as any))
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Container reference is null in useCustomSnap.',
    )
    consoleWarnSpy.mockRestore()
  })

  it('should return a formatted snap when isOpen is true', () => {
    const container = document.createElement('div')
    container.innerHTML = '<div class="slides"><section>Slide 1</section></div>'
    const ref = createRef<HTMLDivElement>()
    ref.current = container

    const { result } = renderHook(() =>
      useCustomSnap(true, ref as React.RefObject<HTMLDivElement>),
    )
    expect(result.current).not.toBeNull()
    expect(result.current?.querySelector('.slides')).not.toBe(null)
  })
})
