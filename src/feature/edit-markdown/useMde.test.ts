import { renderHook } from '@testing-library/react'
import type EasyMDE from 'easymde'
import React from 'react'
import useMde from './useMde'
import '@testing-library/jest-dom'

let mockMdeRef: React.RefObject<{ getMdeInstance: () => EasyMDE } | null>
let mockSetActiveSlideIndex: jest.Mock
let mockCodemirror: {
  on: jest.Mock
  off: jest.Mock
  getCursor: jest.Mock
  indexFromPos: jest.Mock
  setSize: jest.Mock
}
let consoleErrorSpy: jest.SpyInstance
describe('useMde', () => {
  beforeEach(() => {
    mockMdeRef = React.createRef<{ getMdeInstance: () => EasyMDE }>()
    mockMdeRef.current = {
      getMdeInstance: jest.fn(),
    }
    mockCodemirror = {
      on: jest.fn(),
      off: jest.fn(),
      getCursor: jest.fn(() => ({ line: 0, ch: 0 })),
      indexFromPos: jest.fn(() => 0),
      setSize: jest.fn(),
    }

    const mockMdeInstance = {
      codemirror: mockCodemirror,
    }

    if (mockMdeRef.current) {
      mockMdeRef.current.getMdeInstance = jest
        .fn()
        .mockReturnValue(mockMdeInstance)
    }

    mockSetActiveSlideIndex = jest.fn()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('should handle error when mdeInstance throws in updateActiveSlide', () => {
    if (mockMdeRef.current) {
      mockMdeRef.current.getMdeInstance = jest.fn(() => {
        throw new Error('Mocked getMdeInstance error')
      })
    }

    const { result } = renderHook(() =>
      useMde('mockMdData', mockMdeRef, mockSetActiveSlideIndex),
    )

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error in updateActiveSlide:',
      expect.any(Error),
    )
  })

  it('should handle error during codemirror operations in updateActiveSlide', () => {
    const mockCodemirror = {
      on: jest.fn(),
      off: jest.fn(),
      getCursor: jest.fn(() => ({ line: 0, ch: 0 })),
      indexFromPos: jest.fn(() => 0),
      setSize: jest.fn(),
    }

    const mockMdeInstance = {
      codemirror: mockCodemirror,
    }
    if (mockMdeRef.current) {
      mockMdeRef.current.getMdeInstance = jest
        .fn()
        .mockReturnValue(mockMdeInstance)
    }

    const { result } = renderHook(() =>
      useMde('mockMdData', mockMdeRef, mockSetActiveSlideIndex),
    )

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error in updateActiveSlide:',
      expect.any(Error),
    )
  })

  it('should handle error during MDE initialization in useEffect', () => {
    if (mockMdeRef.current) {
      mockMdeRef.current.getMdeInstance = jest.fn().mockImplementation(() => {
        throw new Error('Initialization error')
      })
    }

    expect(() => {
      renderHook(() =>
        useMde('mockMdData', mockMdeRef, mockSetActiveSlideIndex),
      )
    }).toThrow('Failed to initialize MDE')

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error during MDE initialization:',
      expect.any(Error),
    )
  })
})

it('should handle error during cleanup in useEffect', () => {
  const mockMdeInstance = {
    codemirror: mockCodemirror,
  }
  if (mockMdeRef.current) {
    mockMdeRef.current.getMdeInstance = jest
      .fn()
      .mockReturnValue(mockMdeInstance)
  }

  const { unmount } = renderHook(() =>
    useMde('mockMdData', mockMdeRef, mockSetActiveSlideIndex),
  )

  expect(() => unmount()).not.toThrow()
  expect(consoleErrorSpy).toHaveBeenCalledWith(
    'Error during MDE cleanup:',
    expect.any(Error),
  )
})
