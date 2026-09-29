// 여러 화면이 함께 쓰는 UI 조각 모음 (로고·시트·배지·설정 행·토글·입력칸 등)
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { Noise } from '@/lib/types'

/* ── 로고 A · 하프코트 ────────────────────────────────
   코트 경계 + 키 + 자유투 서클(앰버) + 센터 서클 반쪽 */
export function Logo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="5" y="9" width="38" height="30" rx="5" stroke="var(--ink-3)" strokeWidth="2.4" />
      <path d="M5 18h10v12H5" stroke="var(--ink-3)" strokeWidth="2.4" strokeLinejoin="round" />
      <circle cx="15" cy="24" r="5.5" stroke="var(--buzzer)" strokeWidth="2.8" />
      <path d="M43 17.5a6.5 6.5 0 0 0 0 13" stroke="var(--ink-3)" strokeWidth="2.4" />
    </svg>
  )
}

/* ── 소음 등급 마크 ───────────────────────────────────
   이모지(🔇🔈🔉)는 실제 화면에서 셋이 구별되지 않아 직접 그린다 */
export function NoiseMark({ level, className = '' }: { level: Noise; className?: string }) {
  const on = (n: number) => (level >= n ? (level === 3 ? 'var(--buzzer)' : 'var(--ink-2)') : 'var(--ink-4)')
  return (
    <span className={`inline-flex h-[11px] items-end gap-[2px] ${className}`} aria-hidden>
      <i className="w-[3px] rounded-[1px]" style={{ height: 4, background: on(1) }} />
      <i className="w-[3px] rounded-[1px]" style={{ height: 7.5, background: on(2) }} />
      <i className="w-[3px] rounded-[1px]" style={{ height: 11, background: on(3) }} />
    </span>
  )
}

/* ── 바텀시트 ─────────────────────────────────────────
   아래에서 올라온 것이니 아래로 밀면 닫혀야 한다.
   손잡이 영역만 드래그를 받는다 — 시트 안의 버튼·스크롤과 경합하지 않게. */
const CLOSE_PX = 90
const CLOSE_VELOCITY = 0.55

// 아래에서 올라오는 바텀시트. 손잡이를 아래로 밀면 닫힌다
export function Sheet({
  open,
  onClose,
  children,
  dismissable = true,
}: {
  open: boolean
  onClose?: () => void
  children: ReactNode
  dismissable?: boolean
}) {
  const [dy, setDy] = useState(0)
  const [closing, setClosing] = useState(false)
  /** 진입 애니메이션은 fill-mode:both라 끝난 뒤에도 transform을 붙잡는다.
      끝나면 클래스를 떼야 드래그의 인라인 transform이 먹는다. */
  const [entered, setEntered] = useState(false)
  const drag = useRef<{ y: number; t: number } | null>(null)

  useEffect(() => {
    if (!open) return
    setDy(0)
    setClosing(false)
    setEntered(false)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const onDown = (e: React.PointerEvent) => {
    if (!dismissable) return
    drag.current = { y: e.clientY, t: Date.now() }
    setClosing(false)
  }

  useEffect(() => {
    if (!open || !dismissable) return
    const move = (e: PointerEvent) => {
      if (!drag.current) return
      // 위로는 끌리지 않는다 — 시트는 아래로만 닫힌다
      setDy(Math.max(0, e.clientY - drag.current.y))
    }
    const up = (e: PointerEvent) => {
      const d = drag.current
      drag.current = null
      if (!d) return
      const dist = Math.max(0, e.clientY - d.y)
      const v = dist / Math.max(1, Date.now() - d.t)
      if (dist > CLOSE_PX || v > CLOSE_VELOCITY) {
        setClosing(true)
        setTimeout(() => onClose?.(), 180)
      } else {
        setDy(0)
      }
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [open, dismissable, onClose])

  if (!open) return null
  const dragging = drag.current !== null
  return createPortal(
    <div
      className="dim-in fixed inset-0 z-50 flex items-end"
      style={{ background: 'var(--sheet-dim)', opacity: closing ? 0 : 1, transition: closing ? 'opacity .18s' : undefined }}
      onClick={dismissable ? onClose : undefined}
    >
      <div
        className={`${entered ? '' : 'sheet-up'} w-full rounded-t-[24px] border-t px-[22px] pt-[4px]`}
        onAnimationEnd={() => setEntered(true)}
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--line)',
          paddingBottom: 'max(32px, env(safe-area-inset-bottom))',
          transform: closing ? 'translateY(100%)' : dy ? `translateY(${dy}px)` : undefined,
          transition: dragging ? 'none' : 'transform .22s cubic-bezier(.23,1,.32,1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mx-auto mb-[14px] flex h-[30px] w-full items-center justify-center"
          style={{ touchAction: 'none', cursor: dismissable ? 'grab' : 'default' }}
          onPointerDown={onDown}
          aria-hidden
        >
          <span className="h-1 w-9 rounded-full" style={{ background: 'var(--line-2)' }} />
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}

/* ── 버튼 ──────────────────────────────────────────── */
export function Cta({
  children,
  onClick,
  ghost,
  danger,
  disabled,
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  ghost?: boolean
  danger?: boolean
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`press flex w-full items-center justify-center gap-2 rounded-[14px] text-[17px] font-bold disabled:opacity-40 ${
        ghost ? 'border py-[14px] text-[15px]' : 'py-[17px]'
      } ${className}`}
      style={
        ghost
          ? { borderColor: 'var(--line-2)', color: danger ? 'var(--buzzer-hot)' : 'var(--ink-2)' }
          : { background: 'var(--buzzer-fill)', color: 'var(--on-fill)' }
      }
    >
      {children}
    </button>
  )
}

/* ── 화면 머리 ─────────────────────────────────────── */
export function ScreenHead({
  kicker,
  title,
  right,
  onBack,
}: {
  kicker?: string
  title: string
  right?: ReactNode
  onBack?: () => void
}) {
  return (
    <div className="mb-5 flex items-start justify-between">
      <div>
        {kicker && (
          <button
            onClick={onBack}
            className={`text-[13px] ${onBack ? 'press' : ''}`}
            style={{ color: 'var(--ink-3)' }}
            disabled={!onBack}
          >
            {onBack ? `‹ ${kicker}` : kicker}
          </button>
        )}
        <div className="mt-[3px] text-[20px] font-bold tracking-[-0.02em]">{title}</div>
      </div>
      {right}
    </div>
  )
}

// 작은 상태 배지
export function Badge({
  children,
  muted,
  className = '',
}: {
  children: ReactNode
  muted?: boolean
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-[5px] rounded-full px-[9px] py-[5px] text-[11px] font-semibold ${className}`}
      style={
        muted
          ? { background: 'color-mix(in srgb, var(--ink) 6%, transparent)', color: 'var(--ink-3)' }
          : { background: 'var(--buzzer-soft)', color: 'var(--buzzer)' }
      }
    >
      {children}
    </span>
  )
}

/** 접었다 펴는 설정 그룹. 설정이 길어져 한 화면에 다 두면 스크롤이 끝없다. */
export function Fold({
  label,
  open,
  onToggle,
  children,
}: {
  label: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className="mb-[10px]">
      <button
        onClick={onToggle}
        className="press flex w-full items-center gap-2 rounded-[15px] border px-[15px] py-[14px] text-left"
        style={{
          background: 'var(--surface)',
          borderColor: open ? 'var(--buzzer)' : 'var(--line)',
        }}
        aria-expanded={open}
      >
        <span className="flex-1 text-[14px] font-semibold" style={{ color: open ? 'var(--buzzer)' : 'var(--ink)' }}>
          {label}
        </span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round" aria-hidden
             style={{ color: 'var(--ink-4)', transform: open ? 'rotate(180deg)' : undefined, transition: 'transform .2s' }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && <div className="fade-up mt-[8px]">{children}</div>}
    </div>
  )
}

// 설정 목록 그룹 제목
export function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-[9px] text-[10.5px] font-bold tracking-[0.12em]" style={{ color: 'var(--ink-4)' }}>
      {children}
    </div>
  )
}

/* ── 설정 리스트 ───────────────────────────────────── */
export function SBox({ children }: { children: ReactNode }) {
  return (
    <div
      className="overflow-hidden rounded-[15px] border"
      style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}
    >
      {children}
    </div>
  )
}

// 설정 목록의 한 줄 (아이콘·제목·값·화살표)
export function SItem({
  label,
  sub,
  value,
  onClick,
  toggle,
  onToggle,
  danger,
  last,
}: {
  label: string
  sub?: string
  value?: string
  onClick?: () => void
  toggle?: boolean
  onToggle?: (v: boolean) => void
  danger?: boolean
  last?: boolean
}) {
  const Row = onClick || onToggle ? 'button' : 'div'
  return (
    <Row
      onClick={onToggle ? () => onToggle(!toggle) : onClick}
      className="flex w-full items-center gap-3 px-[15px] py-[13px] text-left"
      style={{ borderBottom: last ? 'none' : '1px solid var(--line)' }}
    >
      <span className="min-w-0 flex-1">
        <span
          className="block text-[14px] font-medium"
          style={{ color: danger ? 'var(--buzzer-hot)' : 'var(--ink)' }}
        >
          {label}
        </span>
        {sub && (
          <span className="mt-[3px] block text-[11px] leading-[1.5]" style={{ color: 'var(--ink-3)' }}>
            {sub}
          </span>
        )}
      </span>
      {value && (
        <span className="shrink-0 text-[12.5px]" style={{ color: 'var(--ink-3)' }}>
          {value}
        </span>
      )}
      {toggle !== undefined ? (
        <Toggle on={toggle} />
      ) : (
        (onClick || value) && (
          <span className="shrink-0 text-[15px]" style={{ color: 'var(--ink-4)' }}>
            ›
          </span>
        )
      )}
    </Row>
  )
}

// 켜짐·꺼짐 스위치 모양
export function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className="relative h-[26px] w-[44px] shrink-0 rounded-full transition-colors duration-200"
      style={{ background: on ? 'var(--buzzer-fill)' : 'color-mix(in srgb, var(--ink) 14%, transparent)' }}
    >
      <span
        className="absolute top-[3px] h-5 w-5 rounded-full bg-white transition-[left] duration-200"
        style={{ left: on ? 21 : 3, transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)' }}
      />
    </span>
  )
}

/* ── 선택 칩 ───────────────────────────────────────── */
export function Picker<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: ReactNode }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex gap-[6px]">
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className="press flex flex-1 items-center justify-center gap-[5px] rounded-[10px] border px-1 py-[10px] text-[12px] font-semibold"
            style={{
              borderColor: on ? 'var(--buzzer)' : 'var(--line)',
              background: on ? 'var(--buzzer-soft)' : 'transparent',
              color: on ? 'var(--buzzer)' : 'var(--ink-3)',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

// 제목이 붙은 입력 영역
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-[15px]">
      <div className="mb-[7px] text-[11px] font-bold tracking-[0.09em]" style={{ color: 'var(--ink-3)' }}>
        {label}
      </div>
      {children}
    </div>
  )
}

// 한 줄 글자 입력칸
export function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  multiline,
  suffix,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  multiline?: boolean
  /** kg처럼 무엇을 적는 칸인지 필드 안에서 바로 보여주는 단위 */
  suffix?: string
}) {
  const cls = 'w-full rounded-[11px] border px-[13px] py-[12px] text-[14px] outline-none'
  const st = { background: 'var(--raised)', borderColor: 'var(--line)', color: 'var(--ink)' }
  if (multiline)
    return (
      <textarea
        className={`${cls} min-h-[64px] resize-none`}
        style={st}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  const input = (
    <input
      className={suffix ? `${cls} pr-[42px]` : cls}
      style={st}
      type={type}
      inputMode={type === 'number' ? 'numeric' : undefined}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
  if (!suffix) return input
  return (
    <div className="relative">
      {input}
      <span className="pointer-events-none absolute top-1/2 right-[13px] -translate-y-1/2 text-[13px] font-semibold"
            style={{ color: 'var(--ink-3)' }}>
        {suffix}
      </span>
    </div>
  )
}

/* ── 제작 각인 ─────────────────────────────────────── */
export function Stamp({ absolute = true }: { absolute?: boolean }) {
  return (
    <div
      className={absolute ? 'absolute right-0 left-0 text-center' : 'text-center'}
      style={{
        bottom: absolute ? 'max(34px, calc(env(safe-area-inset-bottom) + 22px))' : undefined,
        fontSize: 9.5,
        fontWeight: 600,
        letterSpacing: '.32em',
        textIndent: '.32em',
        color: 'var(--ink-4)',
      }}
    >
      RESPOFLOV
    </div>
  )
}

/** 값이 바뀔 때 짧게 페이드업 */
export function useKeyed(dep: unknown) {
  const [k, setK] = useState(0)
  useEffect(() => setK((n) => n + 1), [dep])
  return k
}
