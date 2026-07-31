import { useMemo, useState } from 'react'
import { exName, useStore } from '@/lib/store'
import { Badge, Cta, ScreenHead, Sheet } from '@/components/bits'
import { Figure } from '@/components/Figure'
import { addDays, mmss, ymd } from '@/lib/time'
import { MONTHS_EN, WEEKDAYS } from '@/lib/i18n'
import type { SessionLog } from '@/lib/types'

/**
 * 기록. 농구 용어라 영어에서는 번역이 거의 필요 없다 (BOX SCORE, FG%).
 *
 * 기록을 주르륵 늘어놓지 않는다. 히트맵이 목차이고,
 * 날짜를 누르면 그날 것만 열린다. 아래에는 누적만 둔다.
 */
export function Record() {
  const { t, lang, data, deleteLog } = useStore()
  const { settings, logs } = data

  const today = new Date()
  /** 0이면 이번 달, -1이면 지난달 */
  const [offset, setOffset] = useState(0)
  const [pickedDate, setPickedDate] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<SessionLog | null>(null)

  const cursor = new Date(today.getFullYear(), today.getMonth() + offset, 1)
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`
  const monthLogs = logs.filter((l) => l.date.startsWith(monthPrefix))
  const home = monthLogs.filter((l) => l.side === 'home').length
  const away = monthLogs.filter((l) => l.side === 'away').length

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const goal = settings.weeklyGoal * Math.ceil(daysInMonth / 7)
  const pct = goal > 0 ? Math.round(((home + away) / goal) * 100) : 0

  const cells = useMemo(() => {
    const first = new Date(year, month, 1)
    const lead = (first.getDay() - settings.weekStart + 7) % 7
    const start = addDays(ymd(first), -lead)
    return Array.from({ length: 35 }, (_, i) => {
      const d = addDays(start, i)
      const day = logs.filter((l) => l.date === d)
      const h = day.find((l) => l.side === 'home')
      return {
        date: d,
        day: Number(d.slice(8)),
        inMonth: d.startsWith(monthPrefix),
        home: h ? (h.size ?? 'standard') : undefined,
        away: day.some((l) => l.side === 'away'),
        count: day.length,
      }
    })
  }, [logs, month, monthPrefix, settings.weekStart, year])

  /** 이 달에 무엇을 얼마나 했는지 */
  const summary = useMemo(() => {
    const seconds = monthLogs.reduce((a, l) => a + l.seconds, 0)
    const bySize: Record<string, number> = {}
    for (const l of monthLogs) {
      const k = l.side === 'away' ? 'away' : (l.size ?? 'custom')
      bySize[k] = (bySize[k] ?? 0) + 1
    }
    const byMove: Record<string, number> = {}
    for (const l of monthLogs) for (const id of l.moveIds ?? []) byMove[id] = (byMove[id] ?? 0) + 1
    const topMoves = Object.entries(byMove).sort((a, b) => b[1] - a[1]).slice(0, 5)
    return { seconds, bySize, topMoves }
  }, [monthLogs])

  const dow = WEEKDAYS[lang]
  const dowOrdered = settings.weekStart === 1 ? [...dow.slice(1), dow[0]] : dow
  const title = lang === 'ko' ? `${year} · ${month + 1}월` : `${MONTHS_EN[month]} ${year}`
  const shade = { timeout: 'rgba(255,163,26,.30)', standard: 'rgba(255,163,26,.55)', full: 'var(--buzzer-fill)' }
  const sizeLabel: Record<string, string> = {
    timeout: t('sizeTimeout'), standard: t('sizeStandard'), full: t('sizeFull'),
    away: t('away'), custom: lang === 'ko' ? '내 루틴' : 'My routine',
  }

  const dayLogs = pickedDate ? logs.filter((l) => l.date === pickedDate) : []

  return (
    <div className="fade-up flex h-full flex-col overflow-y-auto hide-scroll px-5"
         style={{ paddingTop: 'max(56px, calc(env(safe-area-inset-top) + 12px))' }}>
      <ScreenHead
        kicker={t('tabRecord')}
        title={title}
        right={
          <span className="flex shrink-0 gap-1">
            <button onClick={() => setOffset((n) => n - 1)} aria-label={t('prevMonth')}
                    className="press grid h-9 w-9 place-items-center rounded-[10px] border text-[13px]"
                    style={{ borderColor: 'var(--line)', color: 'var(--ink-3)' }}>‹</button>
            <button onClick={() => setOffset((n) => Math.min(0, n + 1))} aria-label={t('nextMonth')}
                    disabled={offset >= 0}
                    className="press grid h-9 w-9 place-items-center rounded-[10px] border text-[13px] disabled:opacity-30"
                    style={{ borderColor: 'var(--line)', color: 'var(--ink-3)' }}>›</button>
          </span>
        }
      />

      <div className="rounded-[20px] border px-5 pt-[18px] pb-5"
           style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[10.5px] font-bold tracking-[0.12em]" style={{ color: 'var(--ink-3)' }}>
            {t('boxScore')}
          </span>
          <Badge>{lang === 'ko' ? `${month + 1}월` : MONTHS_EN[month]}</Badge>
        </div>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <div className="text-[10px] font-bold tracking-[0.14em]" style={{ color: 'var(--ink-3)' }}>{t('home')}</div>
            <div className="tnum mt-[5px] text-[52px] leading-[0.94] font-extrabold tracking-[-0.05em]"
                 style={{ color: 'var(--buzzer)' }}>{home}</div>
            <div className="mt-[5px] text-[11px]" style={{ color: 'var(--ink-4)' }}>{t('indoor')}</div>
          </div>
          <div className="w-px self-stretch" style={{ background: 'var(--line)' }} />
          <div className="flex-1">
            <div className="text-[10px] font-bold tracking-[0.14em]" style={{ color: 'var(--ink-3)' }}>{t('away')}</div>
            <div className="tnum mt-[5px] text-[52px] leading-[0.94] font-extrabold tracking-[-0.05em]"
                 style={{ color: 'var(--ink-2)' }}>{away}</div>
            <div className="mt-[5px] text-[11px]" style={{ color: 'var(--ink-4)' }}>{t('running')}</div>
          </div>
        </div>
        <div className="mt-[17px] flex items-baseline justify-between border-t pt-[15px]" style={{ borderColor: 'var(--line)' }}>
          <span className="text-[11.5px]" style={{ color: 'var(--ink-3)' }}>{t('fgPct')}</span>
          <span className="tnum text-[17px] font-bold">
            {home + away} / {goal} <span style={{ color: 'var(--buzzer)' }}>{pct}%</span>
          </span>
        </div>
      </div>

      {/* 히트맵이 목차다. 날짜를 눌러 그날 것만 연다. */}
      <div className="mt-5">
        <div className="mb-[11px] flex items-baseline justify-between">
          <span className="text-[13px] font-semibold">{lang === 'ko' ? `${month + 1}월` : MONTHS_EN[month]}</span>
          <span className="flex items-center gap-[3px] text-[10px]" style={{ color: 'var(--ink-4)' }}>
            <i className="ml-[5px] inline-block h-[9px] w-[9px] rounded-[2.5px]" style={{ background: shade.timeout }} />
            {t('sizeTimeout')}
            <i className="ml-[5px] inline-block h-[9px] w-[9px] rounded-[2.5px]" style={{ background: shade.standard }} />
            {t('sizeStandard')}
            <i className="ml-[5px] inline-block h-[9px] w-[9px] rounded-[2.5px]" style={{ background: shade.full }} />
            {t('sizeFull')}
            <i className="ml-[5px] inline-block h-[9px] w-[9px] rounded-[2.5px]"
               style={{ boxShadow: 'inset 0 0 0 1.5px rgba(255,163,26,.75)' }} />
            {t('away')}
          </span>
        </div>
        <div className="mb-[6px] grid grid-cols-7 gap-[5px]">
          {dowOrdered.map((d, i) => (
            <span key={i} className="text-center text-[9.5px] font-semibold" style={{ color: 'var(--ink-4)' }}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-[5px]">
          {cells.map((c) => (
            <button
              key={c.date}
              onClick={() => c.count > 0 && setPickedDate(c.date)}
              disabled={c.count === 0}
              className="press grid h-[30px] place-items-center rounded-[6px] text-[10px] font-semibold"
              style={{
                background: c.home ? shade[c.home] : 'color-mix(in srgb, var(--ink) 4%, transparent)',
                boxShadow: c.away ? 'inset 0 0 0 1.5px rgba(255,163,26,.75)' : undefined,
                opacity: c.inMonth ? 1 : 0.3,
                color: c.home === 'full' ? 'var(--on-fill)' : 'var(--ink-4)',
              }}
            >
              {c.day}
            </button>
          ))}
        </div>
        <div className="mt-[9px] text-center text-[11px]" style={{ color: 'var(--ink-4)' }}>{t('pickDay')}</div>
      </div>

      {/* 히트맵 아래는 누적. 개별 기록은 날짜를 눌러야 나온다. */}
      <div className="mt-6 pb-10">
        {monthLogs.length === 0 ? (
          <div className="py-10 text-center">
            <div className="text-[14px] font-semibold" style={{ color: 'var(--ink-2)' }}>{t('noLogs')}</div>
            <div className="mt-2 text-[12px]" style={{ color: 'var(--ink-4)' }}>{t('noLogsSub')}</div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex gap-3">
              <Stat label={t('totalSessions')} value={`${monthLogs.length}`} unit={lang === 'ko' ? t('times') : ''} />
              <Stat label={t('totalTime')} value={`${Math.round(summary.seconds / 60)}`} unit={t('min')} />
            </div>

            <div className="mb-[9px] text-[10.5px] font-bold tracking-[0.12em]" style={{ color: 'var(--ink-4)' }}>
              {t('byRoutine')}
            </div>
            <div className="mb-6">
              {Object.entries(summary.bySize).sort((a, b) => b[1] - a[1]).map(([k, n]) => (
                <div key={k} className="flex items-center gap-3 border-b py-[10px]" style={{ borderColor: 'var(--line)' }}>
                  <span className="min-w-0 flex-1 text-[13.5px] font-medium">{sizeLabel[k] ?? k}</span>
                  <span className="tnum text-[13.5px] font-bold" style={{ color: 'var(--buzzer)' }}>
                    {n}
                    <span className="ml-[1px] text-[11px] font-semibold" style={{ color: 'var(--ink-4)' }}>
                      {lang === 'ko' ? t('times') : ''}
                    </span>
                  </span>
                </div>
              ))}
            </div>

            {summary.topMoves.length > 0 && (
              <>
                <div className="mb-[9px] text-[10.5px] font-bold tracking-[0.12em]" style={{ color: 'var(--ink-4)' }}>
                  {t('mostDone')}
                </div>
                {summary.topMoves.map(([id, n]) => (
                  <MoveRow key={id} id={id} n={n} />
                ))}
              </>
            )}
          </>
        )}
      </div>

      {/* 그날의 기록 */}
      <Sheet open={!!pickedDate} onClose={() => setPickedDate(null)}>
        <h3 className="text-[20px] font-bold tracking-[-0.02em]">
          {pickedDate && fmtDateLong(pickedDate, lang)}
        </h3>
        {dayLogs.length === 0 ? (
          <p className="mt-3 text-[13px]" style={{ color: 'var(--ink-3)' }}>{t('noThatDay')}</p>
        ) : (
          <div className="mt-3 max-h-[54vh] overflow-y-auto hide-scroll">
            {dayLogs.map((l) => (
              <DayRow key={l.id} log={l} onDelete={() => setConfirmDelete(l)} />
            ))}
          </div>
        )}
      </Sheet>

      <Sheet open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <h3 className="text-[20px] font-bold tracking-[-0.02em]" style={{ color: 'var(--buzzer-hot)' }}>
          {t('deleteLogAsk')}
        </h3>
        <p className="mt-2 text-[13px] leading-[1.65]" style={{ color: 'var(--ink-2)' }}>{t('deleteLogBody')}</p>
        <div className="mt-5 flex flex-col gap-2">
          <Cta ghost danger onClick={() => {
            if (confirmDelete) deleteLog(confirmDelete.id)
            setConfirmDelete(null)
          }}>
            {t('deleteLog')}
          </Cta>
          <Cta ghost onClick={() => setConfirmDelete(null)}>{t('cancel')}</Cta>
        </div>
      </Sheet>
    </div>
  )
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="flex-1 rounded-[16px] border px-4 py-3" style={{ borderColor: 'var(--line)' }}>
      <div className="text-[10.5px] font-bold tracking-[0.12em]" style={{ color: 'var(--ink-3)' }}>{label}</div>
      <div className="tnum mt-1 text-[24px] font-extrabold tracking-[-0.03em]">
        {value}
        <span className="ml-[2px] text-[12px] font-semibold" style={{ color: 'var(--ink-3)' }}>{unit}</span>
      </div>
    </div>
  )
}

function MoveRow({ id, n }: { id: string; n: number }) {
  const { t, lang, exerciseById } = useStore()
  const x = exerciseById(id)
  if (!x) return null
  return (
    <div className="flex items-center gap-3 border-b py-[9px]" style={{ borderColor: 'var(--line)' }}>
      <Figure id={id} size={28} />
      <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium">{exName(x, lang)}</span>
      <span className="tnum text-[13.5px] font-bold" style={{ color: 'var(--buzzer)' }}>
        {n}
        <span className="ml-[1px] text-[11px] font-semibold" style={{ color: 'var(--ink-4)' }}>
          {lang === 'ko' ? t('times') : ''}
        </span>
      </span>
    </div>
  )
}

function DayRow({ log, onDelete }: { log: SessionLog; onDelete: () => void }) {
  const { t, lang } = useStore()
  return (
    <div className="border-b py-3" style={{ borderColor: 'var(--line)' }}>
      <div className="flex items-center gap-3">
        <span className="h-2 w-2 shrink-0 rounded-full"
              style={log.side === 'home'
                ? { background: 'var(--buzzer-fill)' }
                : { boxShadow: 'inset 0 0 0 1.5px var(--buzzer-fill)' }} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-[14px] font-semibold">
            {lang === 'ko' ? log.titleKo : log.titleEn}
            {log.partial && (
              <span className="rounded-full px-[7px] py-[2px] text-[10px] font-semibold"
                    style={{ background: 'color-mix(in srgb, var(--ink) 6%, transparent)', color: 'var(--ink-3)' }}>
                {t('quitPartial')}
              </span>
            )}
          </span>
          <span className="tnum block text-[11.5px]" style={{ color: 'var(--ink-3)' }}>
            {log.time} · {mmss(log.seconds)}
            {log.meters !== undefined ? ` · ${(log.meters / 1000).toFixed(2)}km` : ''}
            {log.partial && log.doneMoves != null ? ` · ${log.doneMoves}/${log.totalMoves}${lang === 'ko' ? '동작' : ''}` : ''}
          </span>
        </span>
        <button onClick={onDelete} aria-label={t('deleteLog')}
                className="press grid h-9 w-9 shrink-0 place-items-center rounded-[10px]"
                style={{ color: 'var(--ink-4)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
               strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
          </svg>
        </button>
      </div>

      {log.track && log.track.length > 1 && <Track points={log.track} />}
      {log.gapSeconds != null && log.gapSeconds > 5 && (
        <div className="mt-1 text-[11px]" style={{ color: 'var(--ink-4)' }}>
          {mmss(log.gapSeconds)} {t('estimated')}
        </div>
      )}
    </div>
  )
}

/**
 * 지나온 궤적. 배경 지도는 없고 좌표를 정규화해 모양만 그린다.
 * 위도 1도와 경도 1도의 실제 거리가 달라 위도로 경도를 보정한다.
 */
function Track({ points }: { points: [number, number][] }) {
  const { t } = useStore()
  const d = useMemo(() => {
    const latMid = points.reduce((a, p) => a + p[0], 0) / points.length
    const k = Math.cos((latMid * Math.PI) / 180)
    const xs = points.map((p) => p[1] * k)
    const ys = points.map((p) => p[0])
    const minX = Math.min(...xs), maxX = Math.max(...xs)
    const minY = Math.min(...ys), maxY = Math.max(...ys)
    const span = Math.max(maxX - minX, maxY - minY) || 1e-6
    const pad = 6
    const scale = (100 - pad * 2) / span
    return points
      .map((p, i) => {
        const x = pad + (p[1] * k - minX) * scale
        // 위도는 위로 갈수록 커지므로 y를 뒤집는다
        const y = pad + (maxY - p[0]) * scale
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
      })
      .join(' ')
  }, [points])

  return (
    <div className="mt-2 flex items-center gap-3 rounded-[12px] border px-3 py-2"
         style={{ borderColor: 'var(--line)' }}>
      <svg width="66" height="66" viewBox="0 0 100 100" aria-hidden>
        <path d={d} fill="none" stroke="var(--buzzer)" strokeWidth="3"
              strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-[11.5px]" style={{ color: 'var(--ink-3)' }}>{t('routeShape')}</span>
    </div>
  )
}

function fmtDateLong(date: string, lang: 'ko' | 'en') {
  const [y, m, d] = date.split('-').map(Number)
  return lang === 'ko'
    ? `${y}년 ${m}월 ${d}일`
    : `${MONTHS_EN[m - 1]} ${d}, ${y}`
}
