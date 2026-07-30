import { useCallback, useEffect, useRef, useState } from 'react'

const HOLD_MS = 220
const CANCEL_PX = 8

/**
 * 길게 눌러 순서 바꾸기.
 *
 * 220ms로 잡은 이유: iOS 기본 컨텍스트 메뉴가 약 500ms인데 그건 확실히 길고,
 * 200ms 아래로 내리면 스크롤하려다 잡히는 오작동이 늘어난다.
 *
 * 손잡이(handleProps)는 touch-action:none이 늘 걸려 있어 기다릴 필요 없이 바로 끌린다.
 * 모바일 브라우저에서 스크롤과 경합하는 구간이 있어 두 경로를 다 열어둔다.
 */
export function useReorder(count: number, onMove: (from: number, to: number) => void) {
  const [dragging, setDragging] = useState<number | null>(null)
  const [over, setOver] = useState<number | null>(null)
  const rows = useRef<(HTMLElement | null)[]>([])
  const timer = useRef<number | null>(null)
  const startY = useRef(0)
  const armed = useRef<number | null>(null)

  const setRow = useCallback((i: number, el: HTMLElement | null) => {
    rows.current[i] = el
  }, [])

  const clearTimer = () => {
    if (timer.current !== null) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }

  const begin = useCallback((index: number) => {
    setDragging(index)
    setOver(index)
  }, [])

  const targetFor = useCallback((clientY: number) => {
    let best = 0
    for (let i = 0; i < count; i++) {
      const el = rows.current[i]
      if (!el) continue
      const r = el.getBoundingClientRect()
      if (clientY > r.top + r.height / 2) best = i + 1
    }
    return Math.max(0, Math.min(count - 1, best > 0 ? best - 1 : 0))
  }, [count])

  const finish = useCallback(() => {
    clearTimer()
    armed.current = null
    setDragging((d) => {
      setOver((o) => {
        if (d !== null && o !== null && d !== o) onMove(d, o)
        return null
      })
      return null
    })
  }, [onMove])

  // 드래그 중에는 스크롤을 막는다 (non-passive 여야 preventDefault가 먹는다)
  useEffect(() => {
    if (dragging === null) return
    const onTouchMove = (e: TouchEvent) => e.preventDefault()
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => document.removeEventListener('touchmove', onTouchMove)
  }, [dragging])

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (dragging === null) {
        if (armed.current !== null && Math.abs(e.clientY - startY.current) > CANCEL_PX) {
          // 손가락이 먼저 움직였다면 스크롤 의도로 본다
          clearTimer()
          armed.current = null
        }
        return
      }
      setOver(targetFor(e.clientY))
    }
    const up = () => {
      if (dragging === null) {
        clearTimer()
        armed.current = null
        return
      }
      finish()
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [dragging, finish, targetFor])

  useEffect(() => () => clearTimer(), [])

  /** 행 전체 — 길게 누르면 잡힌다 */
  const rowProps = (index: number) => ({
    ref: (el: HTMLElement | null) => setRow(index, el),
    onPointerDown: (e: React.PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return
      startY.current = e.clientY
      armed.current = index
      clearTimer()
      timer.current = window.setTimeout(() => {
        if (armed.current === index) begin(index)
      }, HOLD_MS)
    },
  })

  /** 손잡이 — 기다릴 필요 없이 즉시 */
  const handleProps = (index: number) => ({
    style: { touchAction: 'none' as const },
    onPointerDown: (e: React.PointerEvent) => {
      e.stopPropagation()
      startY.current = e.clientY
      begin(index)
    },
  })

  return { dragging, over, rowProps, handleProps }
}

/** 배열에서 from을 to 자리로 옮긴 새 배열 */
export function moved<T>(arr: T[], from: number, to: number): T[] {
  const next = arr.slice()
  const [x] = next.splice(from, 1)
  next.splice(to, 0, x)
  return next
}
