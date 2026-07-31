import { useMemo } from 'react'
import { useStore } from '@/lib/store'
import { ScreenHead, Badge } from '@/components/bits'
import { addDays, mmss, ymd } from '@/lib/time'
import { MONTHS_EN, WEEKDAYS } from '@/lib/i18n'

/** 기록. 농구 용어라 영어에서는 번역이 거의 필요 없다 (BOX SCORE, FG%). */
export function Record() {
  const { t, lang, data } = useStore()
  const { settings, logs } = data

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`
  const monthLogs = logs.filter((l) => l.date.startsWith(monthPrefix))
  const home = monthLogs.filter((l) => l.side === 'home').length
  const away = monthLogs.filter((l) => l.side === 'away').length

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const goal = settings.weeklyGoal * Math.ceil(daysInMonth / 7)
  const pct = goal > 0 ? Math.round(((home + away) / goal) * 100) : 0

  // 달력 히트맵 — 주 시작 요일 설정을 따른다
  const cells = useMemo(() => {
    const first = new Date(year, month, 1)
    const lead = (first.getDay() - settings.weekStart + 7) % 7
    const start = addDays(ymd(first), -lead)
    const out: { date: string; inMonth: boolean; home?: 'timeout' | 'standard' | 'full'; away: boolean }[] = []
    for (let i = 0; i < 35; i++) {
      const d = addDays(start, i)
      const day = logs.filter((l) => l.date === d)
      const h = day.find((l) => l.side === 'home')
      out.push({
        date: d,
        inMonth: d.startsWith(monthPrefix),
        home: h?.size ?? (h ? 'standard' : undefined),
        away: day.some((l) => l.side === 'away'),
      })
    }
    return out
  }, [logs, month, monthPrefix, settings.weekStart, year])

  const dow = WEEKDAYS[lang]
  const dowOrdered = settings.weekStart === 1 ? [...dow.slice(1), dow[0]] : dow
  const title = lang === 'ko' ? `${year} · ${month + 1}월` : `${MONTHS_EN[month]} ${year}`
  const shade = { timeout: 'rgba(255,163,26,.30)', standard: 'rgba(255,163,26,.55)', full: 'var(--buzzer-fill)' }

  return (
    <div className="fade-up flex h-full flex-col overflow-y-auto hide-scroll px-5"
         style={{ paddingTop: 'max(56px, calc(env(safe-area-inset-top) + 12px))' }}>
      <ScreenHead kicker={t('tabRecord')} title={title} />

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
            <i
              key={c.date}
              className="h-[26px] rounded-[6px]"
              style={{
                background: c.home ? shade[c.home] : 'color-mix(in srgb, var(--ink) 4%, transparent)',
                boxShadow: c.away ? 'inset 0 0 0 1.5px rgba(255,163,26,.75)' : undefined,
                opacity: c.inMonth ? 1 : 0.35,
              }}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 pb-8">
        {logs.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-[14px] font-semibold" style={{ color: 'var(--ink-2)' }}>{t('noLogs')}</div>
            <div className="mt-2 text-[12px]" style={{ color: 'var(--ink-4)' }}>{t('noLogsSub')}</div>
          </div>
        ) : (
          logs.slice(0, 30).map((l) => (
            <div key={l.id} className="flex items-center gap-3 border-b py-3" style={{ borderColor: 'var(--line)' }}>
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={
                  l.side === 'home'
                    ? { background: 'var(--buzzer-fill)' }
                    : { boxShadow: 'inset 0 0 0 1.5px var(--buzzer-fill)' }
                }
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-[14px] font-semibold">
                  {lang === 'ko' ? l.titleKo : l.titleEn}
                  {l.partial && (
                    <span className="rounded-full px-[7px] py-[2px] text-[10px] font-semibold"
                          style={{ background: 'color-mix(in srgb, var(--ink) 6%, transparent)', color: 'var(--ink-3)' }}>
                      {t('quitPartial')}
                    </span>
                  )}
                </span>
                <span className="tnum block text-[11.5px]" style={{ color: 'var(--ink-3)' }}>
                  {fmtDate(l.date, lang)} · {l.time}
                  {l.meters !== undefined ? ` · ${(l.meters / 1000).toFixed(2)}km` : ''}
                  {l.gapSeconds && l.gapSeconds > 5 ? ` · ${t('estimated')}` : ''}
                  {l.partial && l.doneMoves != null ? ` · ${l.doneMoves}/${l.totalMoves}${lang === 'ko' ? '동작' : ''}` : ''}
                </span>
              </span>
              <span className="tnum shrink-0 text-[12px]" style={{ color: 'var(--ink-4)' }}>{mmss(l.seconds)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function fmtDate(date: string, lang: 'ko' | 'en') {
  const [, m, d] = date.split('-')
  return lang === 'ko' ? `${Number(m)}월 ${Number(d)}일` : `${MONTHS_EN[Number(m) - 1].slice(0, 3)} ${Number(d)}`
}
