'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const PREVIEW_SCALE = 1.22

interface PannablePreviewImageProps {
  src: string
  alt?: string
  className?: string
  /** Hint shown on first hover */
  hint?: string
}

export function PannablePreviewImage({
  src,
  alt = 'Post media preview',
  className = '',
  hint = 'Hold & drag to peek',
}: PannablePreviewImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const dragRef = useRef({ startX: 0, startY: 0, baseX: 0, baseY: 0 })
  const maxOffsetRef = useRef(48)

  const updateMaxOffset = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    maxOffsetRef.current = Math.max(24, Math.min(width, height) * 0.12)
  }, [])

  useEffect(() => {
    updateMaxOffset()
    window.addEventListener('resize', updateMaxOffset)
    return () => window.removeEventListener('resize', updateMaxOffset)
  }, [updateMaxOffset, src])

  const clamp = useCallback((x: number, y: number) => {
    const max = maxOffsetRef.current
    return {
      x: Math.max(-max, Math.min(max, x)),
      y: Math.max(-max, Math.min(max, y)),
    }
  }, [])

  const endDrag = useCallback(() => {
    setIsDragging(false)
    setOffset({ x: 0, y: 0 })
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      setOffset(
        clamp(dragRef.current.baseX + dx, dragRef.current.baseY + dy)
      )
    }

    const onUp = () => endDrag()

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isDragging, clamp, endDrag])

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    setShowHint(false)
    setIsDragging(true)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseX: offset.x,
      baseY: offset.y,
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden select-none ${className}`}
      onMouseDown={onMouseDown}
      role="img"
      aria-label={alt}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="w-full h-full object-cover pointer-events-none will-change-transform"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${PREVIEW_SCALE})`,
          transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      />
      {showHint && !isDragging && (
        <div className="absolute inset-x-0 bottom-0 py-1.5 px-2 bg-linear-to-t from-black/35 to-transparent pointer-events-none">
          <p className="text-[10px] text-white/80 text-center font-medium">{hint}</p>
        </div>
      )}
      {isDragging && (
        <div className="absolute inset-0 cursor-grabbing" aria-hidden="true" />
      )}
    </div>
  )
}
