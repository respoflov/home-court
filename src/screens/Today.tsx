import { useMemo } from 'react'
import { rtName, useStore } from '@/lib/store'
import { gearOf, lineup, totalSeconds, buildSteps } from '@/lib/session'
import type { Routine } from '@/lib/types'
import { Badge, Cta } from '@/components/bits'
import { addDays, mmss, startOfWeek, ymd } from '@/lib/time'
import { MONTHS_EN, WEEKDAYS } from '@/lib/i18n'

const GEAR_LABEL: Record<string, [string, string]> = {
  mat: ['매트', 'Mat'],
  dumbbell: ['덤벨', 'Dumbbells'],
  stepper: ['스텝퍼', 'Stepper'],
  chair: ['의자', 'Chair'],
  towel: ['수건', 'Towel'],
}

export function Today({
  routine,
  onPickSize,
  onStart,
  onOpenRoutine,
}: {
  routine: Routine
  onPickSize: (s: 'timeout' | 'standard' | 'full') => void
  onStart: () => void
  onOpenRoutine: () => void
}) {
  const { t, lang, data, quietNow, exerciseById, allRoutines } = useStore()
  const { settings } = data

  const rows = useMemo(
    () => lineup(routine, exerciseById, settings.restSeconds, quietNow),
    [routine, exerciseById, settings.restSeconds, quietNow],
  )
  const gear = useMemo(() => gearOf(routine, exerciseById, quietNow), [routine, exerciseById, quietNow])
  const steps = useMemo(
    () => buildSteps(routine, exerciseById, settings.restSeconds, quietNow),
    [routine, exerciseById, settings.restSeconds, quietNow],
  )
  const minutes = Math.max(1, Math.round(totalSeconds(steps) / 60))
  const moves = new Set(steps.filter((s) => s.kind === 'work').map((s) => s.exercise.id)).size

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 11 ? t('goodMorning') : hour < 18 ? t('goodDay') : t('goodEvening')
  const dateLine =
    lang === 'ko'
      ? `${now.getMonth() + 1}월 ${now.getDate()}일 ${WEEKDAYS.ko[now.getDay()]}요일`
      : `${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][now.getDay()]}, ${MONTHS_EN[now.getMonth()]} ${now.getDate()}`

  // 이번 주 홈경기 수 · 연속일
  const weekStart = startOfWeek(ymd(now), settings.weekStart)
  const thisWeek = data.logs.filter((l) => l.side === 'home' && l.date >= weekStart).length
  const streak = useMemo(() => {
    const dates = new Set(data.logs.map((l) => l.date))
    let n = 0
    let cur = ymd(now)
    if (!dates.has(cur)) cur = addDays(cur, -1)
    while (dates.has(cur)) {
      n++
      cur = addDays(cur, -1)
    }
    return n
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.logs])

  const lastAway = data.logs.find((l) => l.side === 'away')
  const nextAway = !lastAway || lastAway.date < ymd(now) ? t('today') : t('tomorrow')

  const sizes: ('timeout' | 'standard' | 'full')[] = ['timeout', 'standard', 'full']
  const sizeLabel = { timeout: t('sizeTimeout'), standard: t('sizeStandard'), full: t('sizeFull') }
  // 표시 분량은 실제 루틴에서 계산한다. 하드코딩하면 루틴을 고쳤을 때 라벨이 거짓말을 한다.
  const sizeMin = useMemo(() => {
    const out = {} as Record<'timeout' | 'standard' | 'full', number>
    for (const s of sizes) {
      const r = allRoutines.find((x) => x.size === s)
      out[s] = r
        ? Math.max(1, Math.round(totalSeconds(buildSteps(r, exerciseById, settings.restSeconds, quietNow)) / 60))
        : 0
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRoutines, exerciseById, settings.restSeconds, quietNow])

  return (
    <div className="fade-up flex h-full flex-col overflow-y-auto hide-scroll px-5"
         style={{ paddingTop: 'max(56px, calc(env(safe-area-inset-top) + 12px))' }}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-[13px]" style={{ color: 'var(--ink-3)' }}>{dateLine}</div>
          <div className="mt-[3px] text-[20px] font-bold tracking-[-0.02em]">{greeting}</div>
        </div>
        {quietNow && <Badge muted>{t('quietMode')}</Badge>}
      </div>

      <div className="mb-[15px] flex gap-[15px] px-[2px] text-[12px]" style={{ color: 'var(--ink-3)' }}>
        <span>
          {t('thisWeek')} <b className="tnum" style={{ color: 'var(--ink)' }}>{thisWeek}</b>/{settings.weeklyGoal}
        </span>
        <span>
          {t('streak')} <b className="tnum" style={{ color: 'var(--ink)' }}>{streak}</b>
          {lang === 'ko' ? t('days') : t('days')}
        </span>
        <span>
          {t('nextAway')} <b style={{ color: 'var(--ink)' }}>{nextAway}</b>
        </span>
      </div>

      <div className="rounded-[20px] border px-5 pt-[22px] pb-5"
           style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}>
        <div className="text-[10.5px] font-bold tracking-[0.12em]" style={{ color: 'var(--ink-3)' }}>
          {t('todaysGame')}
        </div>
        <div className="mt-[10px] text-[30px] font-bold tracking-[-0.03em]">{rtName(routine, lang)}</div>
        <div className="tnum mt-[7px] text-[13px]" style={{ color: 'var(--ink-2)' }}>
          {minutes}{lang === 'ko' ? t('min') : ' ' + t('min')} · {rows.length}{lang === 'ko' ? ' 구간' : ' blocks'} · {moves}{lang === 'ko' ? t('moves') : ' ' + t('moves')}
        </div>
        <div className="mt-4 flex gap-[5px]">
          {rows.map((r) => (
            <span key={r.index} className="h-[3px] flex-1 rounded-sm" style={{ background: 'var(--buzzer-fill)' }} />
          ))}
        </div>

        {gear.length > 0 && (
          <div className="mt-[15px] flex flex-wrap items-center gap-[6px]">
            <span className="mr-[2px] text-[10px] font-bold tracking-[0.11em]" style={{ color: 'var(--ink-4)' }}>
              {t('youllNeed')}
            </span>
            {gear.map((g) => (
              <span key={g} className="rounded-full border px-[10px] py-[5px] text-[11.5px] font-semibold"
                    style={{ borderColor: 'var(--line-2)', color: 'var(--ink-2)' }}>
                {GEAR_LABEL[g] ? GEAR_LABEL[g][lang === 'ko' ? 0 : 1] : g}
              </span>
            ))}
          </div>
        )}

        <div className="mt-[18px]">
          <Cta onClick={onStart}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
            {t('start')}
          </Cta>
        </div>
      </div>

      <div className="mt-[14px] flex gap-[6px]">
        {sizes.map((s) => {
          const on = routine.size === s
          return (
            <button
              key={s}
              onClick={() => onPickSize(s)}
              className="press flex-1 rounded-[11px] border px-1 py-[11px] text-[12px] font-semibold"
              style={{
                borderColor: on ? 'var(--buzzer)' : 'var(--line)',
                background: on ? 'var(--buzzer-soft)' : 'transparent',
                color: on ? 'var(--buzzer)' : 'var(--ink-3)',
              }}
            >
              {sizeLabel[s]}
              <span className="mt-[3px] block text-[10.5px] font-medium" style={{ color: on ? 'var(--buzzer)' : 'var(--ink-4)' }}>
                {sizeMin[s]}{lang === 'ko' ? t('min') : ' ' + t('min')}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-[19px] pb-6">
        <div className="mb-[7px] flex items-baseline justify-between text-[10.5px] font-bold tracking-[0.12em]"
             style={{ color: 'var(--ink-4)' }}>
          {t('todaysLineup')}
          <button onClick={onOpenRoutine} className="press text-[11px] font-medium tracking-normal">
            {t('tapToChange')}
          </button>
        </div>
        {/* 열 너비를 내용에 맞춰 자동 정렬 — 한국어·영어 모두 안 깨진다 */}
        <div className="grid items-center" style={{ gridTemplateColumns: 'auto auto minmax(0,1fr) auto' }}>
          {rows.map((r) => (
            <Row key={r.index} row={r} lang={lang} onClick={onOpenRoutine} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Row({
  row,
  lang,
  onClick,
}: {
  row: ReturnType<typeof lineup>[number]
  lang: 'ko' | 'en'
  onClick: () => void
}) {
  const label = lang === 'ko' ? row.labelKo : row.labelEn
  const m = label.match(/^(\d+Q)\s*(.*)$/)
  const tag = m ? m[1] : ''
  const rest = m ? m[2] : label
  const cell = 'whitespace-nowrap border-b py-[10px] pr-[10px]'
  const st = { borderColor: 'var(--line)' }
  return (
    <>
      <button onClick={onClick} className={`${cell} text-left text-[11px] font-bold`} style={{ ...st, color: 'var(--buzzer)' }}>
        {tag}
      </button>
      <button onClick={onClick} className={`${cell} text-left text-[12.5px] font-semibold`} style={st}>
        {rest}
      </button>
      <button
        onClick={onClick}
        className={`${cell} overflow-hidden text-left text-[11.5px] text-ellipsis`}
        style={{ ...st, color: 'var(--ink-3)' }}
      >
        {row.names.map((n) => (lang === 'ko' ? n.nameKo : n.nameEn)).join(' · ')}
      </button>
      <button onClick={onClick} className={`${cell} tnum pr-0 text-right text-[11.5px]`} style={{ ...st, color: 'var(--ink-4)' }}>
        {mmss(row.seconds)}
      </button>
    </>
  )
}
