'use client'

import { useCallback, useRef, useState } from 'react'
import type { CanvasData } from '@/types/canvas'

function cloneCanvas(data: CanvasData): CanvasData {
  return JSON.parse(JSON.stringify(data)) as CanvasData
}

export function useCanvasHistory(initial: CanvasData, maxEntries = 50) {
  const [history, setHistory] = useState<CanvasData[]>(() => [cloneCanvas(initial)])
  const [index, setIndex] = useState(0)
  const skipPush = useRef(false)

  const current = history[index] ?? history[0]

  const push = useCallback(
    (data: CanvasData) => {
      if (skipPush.current) {
        skipPush.current = false
        return
      }
      setHistory((prev) => {
        const trimmed = prev.slice(0, index + 1)
        let next = [...trimmed, cloneCanvas(data)]
        if (next.length > maxEntries) next = next.slice(-maxEntries)
        setIndex(next.length - 1)
        return next
      })
    },
    [index, maxEntries]
  )

  const undo = useCallback(() => {
    setIndex((i) => {
      if (i <= 0) return i
      skipPush.current = true
      return i - 1
    })
  }, [])

  const redo = useCallback(() => {
    setIndex((i) => {
      if (i >= history.length - 1) return i
      skipPush.current = true
      return i + 1
    })
  }, [history.length])

  const reset = useCallback((data: CanvasData) => {
    const cloned = cloneCanvas(data)
    setHistory([cloned])
    setIndex(0)
    skipPush.current = true
  }, [])

  return {
    canvasData: current,
    push,
    undo,
    redo,
    reset,
    canUndo: index > 0,
    canRedo: index < history.length - 1,
  }
}
