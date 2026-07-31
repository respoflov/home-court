import { useEffect, useRef, useState } from 'react'
import { useStore } from '@/lib/store'
import { AWAY_PROGRAM } from '@/data/routines'
import { Badge, Cta, GroupLabel, ScreenHead, SBox, SItem } from '@/components/bits'
import { hm, mmss, ymd } from '@/lib/time'
import * as sound from '@/lib/sound'
import * as wake from '@/lib/wakelock'
import type { SessionLog } from '@/lib/types'

/**
 * 원정(러닝). 시간 기반이라 GPS 없이도 완전히 동작한다.
 * GPS는 선택 기능이고, 화면이 꺼진 구간은 직선 추정임을 기록에 남긴다.
 */
export function Away() {
  const { t, lang, data, set, setSettings } = useStore()
  const [running, setRunning] = useState(false)
  const week = Math.min(4, Math.max(1, data.awayWeek))
  const plan = AWAY_PROGRAM[week - 1]

  if (running) return <AwayRun week={week} onExit={() => setRunning(false)} />

  return (
    <div className="fade-up flex h-full flex-col overflow-y-auto hide-scroll px-5"
         style={{ paddingTop: 'max(56px, calc(env(safe-area-inset-top) + 12px))' }}>
      <ScreenHead
        kicker={t('awayTitle')}
        title={lang === 'ko' ? `걷기·달리기 ${week}주차` : `Walk & Run, week ${week}`}
      />

      <div className="rounded-[20px] border px-5 pt-[22px] pb-5"
           style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}>
        <div className="text-[10.5px] font-bold tracking-[0.12em]" style={{ color: 'var(--ink-3)' }}>
          {t('todaysAway')}
        </div>
        <div className="mt-[10px] text-[30px] font-bold tracking-[-0.03em]">
          {t('walk')} {plan.walk} · {t('run')} {plan.run}
        </div>
        <div className="tnum mt-[7px] text-[13px]" style={{ color: 'var(--ink-2)' }}>
          {plan.sets}{lang === 'ko' ? '세트' : ' ' + t('sets')} · {(plan.walk + plan.run) * plan.sets}
          {lang === 'ko' ? t('min') : ' ' + t('min')}
        </div>
        <div className="mt-4 flex gap-[5px]">
          {Array.from({ length: plan.sets }).map((_, i) => (
            <span key={i} className="h-[3px] flex-1 rounded-sm" style={{ background: 'var(--buzzer-fill)' }} />
          ))}
        </div>
        <div className="mt-[18px]">
          <Cta onClick={() => { sound.primeAudio(); setRunning(true) }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
            {t('startAway')}
          </Cta>
        </div>
      </div>

      <div className="mt-4">
        <SBox>
          <SItem
            label={t('gpsLabel')}
            sub={t('gpsSub')}
            toggle={data.settings.gpsEnabled}
            onToggle={(v) => setSettings({ gpsEnabled: v })}
            last
          />
        </SBox>
      </div>
      <div className="mt-[10px] rounded-[12px] px-[14px] py-3 text-[11.5px] leading-[1.6]"
           style={{ background: 'var(--buzzer-soft)', color: 'var(--buzzer)' }}>
        {t('gpsNote')} {t('gpsMapNote')}
      </div>

      <div className="mt-5 pb-8">
        <GroupLabel>{t('program4')}</GroupLabel>
        {AWAY_PROGRAM.map((p) => {
          const state = p.week < week ? 'done' : p.week === week ? 'now' : 'later'
          return (
            <button
              key={p.week}
              onClick={() => set({ awayWeek: p.week })}
              className="flex w-full items-center gap-3 border-b py-[13px] text-left"
              style={{ borderColor: 'var(--line)', opacity: state === 'later' ? 0.4 : 1 }}
            >
              <span className="w-[22px] shrink-0 text-center text-[12px]"
                    style={{ color: state === 'later' ? 'var(--ink-4)' : 'var(--buzzer)' }}>
                {state === 'done' ? '✓' : state === 'now' ? '▸' : p.week}
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-[14.5px] font-semibold">
                  {lang === 'ko' ? `${p.week}주차` : `${t('awayWeek')} ${p.week}`}
                  {state === 'now' && <Badge className="ml-2">{t('inProgress')}</Badge>}
                </span>
                <span className="tnum mt-[3px] block text-[11px]" style={{ color: 'var(--ink-3)' }}>
                  {t('walk')} {p.walk} + {t('run')} {p.run} × {p.sets} · {(p.walk + p.run) * p.sets}
                  {lang === 'ko' ? t('min') : ' ' + t('min')}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** 원정 진행 — 홈트와 같은 테두리 타이머 엔진을 쓴다 */
function AwayRun({ week, onExit }: { week: number; onExit: () => void }) {
  const { t, data, addLog, set } = useStore()
  const plan = AWAY_PROGRAM[week - 1]
  const legs: { kind: 'walk' | 'run'; seconds: number }[] = []
  for (let i = 0; i < plan.sets; i++) {
    legs.push({ kind: 'walk', seconds: plan.walk * 60 })
    legs.push({ kind: 'run', seconds: plan.run * 60 })
  }

  const [i, setI] = useState(0)
  const [remain, setRemain] = useState(legs[0].seconds)
  const [paused, setPaused] = useState(false)
  const [finished, setFinished] = useState(false)
  const deadline = useRef(Date.now() + legs[0].seconds * 1000)
  const pausedAt = useRef<number | null>(null)
  const startedAt = useRef(new Date())
  const lastTick = useRef(-1)

  // GPS — 켰을 때만. 화면이 꺼진 구간은 공백으로 재고 기록에 남긴다.
  const meters = useRef(0)
  const gap = useRef(0)
  const lastFix = useRef<{ lat: number; lon: number; at: number } | null>(null)
  /** 지나온 좌표. 5m 넘게 움직였을 때만 담아 용량을 줄인다. */
  const track = useRef<[number, number][]>([])
  const hiddenAt = useRef<number | null>(null)

  useEffect(() => {
    if (!data.settings.keepAwake) return
    void wake.acquire()
    const off = wake.reacquireOnVisible(() => data.settings.keepAwake)
    return () => { off(); void wake.release() }
  }, [data.settings.keepAwake])

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'hidden') hiddenAt.current = Date.now()
      else if (hiddenAt.current) {
        gap.current += (Date.now() - hiddenAt.current) / 1000
        hiddenAt.current = null
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  useEffect(() => {
    if (!data.settings.gpsEnabled || !navigator.geolocation) return
    const id = navigator.geolocation.watchPosition(
      (p) => {
        const { latitude: lat, longitude: lon, accuracy } = p.coords
        if (accuracy > 30) return
        const prev = lastFix.current
        if (prev) {
          const d = haversine(prev.lat, prev.lon, lat, lon)
          if (d > 1.5) meters.current += d
          if (d > 5) track.current.push([lat, lon])
        } else {
          track.current.push([lat, lon])
        }
        lastFix.current = { lat, lon, at: Date.now() }
      },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 },
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [data.settings.gpsEnabled])

  useEffect(() => {
    deadline.current = Date.now() + legs[i].seconds * 1000
    setRemain(legs[i].seconds)
    lastTick.current = -1
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i])

  useEffect(() => {
    if (paused || finished) return
    const id = setInterval(() => {
      const left = Math.max(0, (deadline.current - Date.now()) / 1000)
      setRemain(left)
      const whole = Math.ceil(left)
      if (whole !== lastTick.current) {
        lastTick.current = whole
        if (data.settings.sound && data.settings.countdown && whole > 0 && whole <= 3) sound.tick()
      }
      if (left <= 0) {
        if (data.settings.sound) sound.advance()
        if (i + 1 >= legs.length) done()
        else setI((n) => n + 1)
      }
    }, 100)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, paused, finished, data.settings.sound, data.settings.countdown])

  const done = () => {
    const log: SessionLog = {
      id: `a${Date.now()}`,
      side: 'away',
      titleKo: `원정 · ${week}주차`,
      titleEn: `Away · Week ${week}`,
      date: ymd(startedAt.current),
      time: hm(startedAt.current),
      seconds: Math.round((Date.now() - startedAt.current.getTime()) / 1000),
      awayWeek: week,
      meters: data.settings.gpsEnabled ? Math.round(meters.current) : undefined,
      track: data.settings.gpsEnabled && track.current.length > 1 ? track.current : undefined,
      gapSeconds: data.settings.gpsEnabled ? Math.round(gap.current) : undefined,
    }
    addLog(log)
    if (week < 4) set({ awayWeek: week + 1 })
    if (data.settings.sound) sound.finish()
    setFinished(true)
  }

  const leg = legs[i]
  const frac = Math.max(0, Math.min(1, remain / leg.seconds))
  const hot = remain <= 3.2
  const dash = `${(frac * 100).toFixed(2)} ${(100 - frac * 100).toFixed(2)}`

  if (finished) {
    return (
      <div className="fade-up flex h-full flex-col items-center justify-center gap-6 px-8 text-center">
        <div className="text-[13px] font-bold tracking-[0.12em]" style={{ color: 'var(--buzzer)' }}>{t('finished')}</div>
        <div className="text-[34px] font-bold tracking-[-0.03em]">{t('wellDone')}</div>
        {data.settings.gpsEnabled && (
          <div className="tnum text-[14px]" style={{ color: 'var(--ink-2)' }}>
            {(meters.current / 1000).toFixed(2)} km
            {gap.current > 5 && (
              <span className="mt-1 block text-[12px]" style={{ color: 'var(--ink-4)' }}>
                {mmss(gap.current)} {t('estimated')}
              </span>
            )}
          </div>
        )}
        <div className="mt-4 w-full max-w-[280px]"><Cta onClick={onExit}>{t('backToToday')}</Cta></div>
      </div>
    )
  }

  return (
    <div className="relative h-full" style={{ background: 'var(--void)' }}>
      <svg className="pointer-events-none absolute inset-0 z-[5] h-full w-full" preserveAspectRatio="none"
           viewBox="0 0 375 812" aria-hidden>
        <rect x="5" y="5" width="365" height="802" rx="35" fill="none"
              stroke={hot ? 'rgba(255,77,46,.16)' : 'var(--line)'} strokeWidth={hot ? 9 : 5} />
        <rect x="5" y="5" width="365" height="802" rx="35" fill="none"
              stroke={hot ? 'var(--buzzer-hot)' : 'var(--buzzer)'} strokeWidth={hot ? 9 : 5}
              strokeLinecap="round" pathLength={100} strokeDasharray={dash} strokeDashoffset={-6} />
      </svg>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-7">
        <div className="text-[11px] font-bold tracking-[0.12em]" style={{ color: 'var(--ink-3)' }}>
          {i + 1} / {legs.length}
        </div>
        <div className="mt-3 text-[26px] font-semibold tracking-[-0.02em]">
          {leg.kind === 'walk' ? t('walk') : t('run')}
        </div>
        <div className="tnum my-[26px] leading-none font-extrabold tracking-[-0.055em]"
             style={{ fontSize: 'calc(104px * var(--live-scale))', color: hot ? 'var(--buzzer-hot)' : 'var(--ink)' }}>
          {mmss(remain)}
        </div>
        {data.settings.gpsEnabled && (
          <div className="tnum text-[14px]" style={{ color: 'var(--ink-3)' }}>
            {(meters.current / 1000).toFixed(2)} km
          </div>
        )}

        <div className="absolute right-0 bottom-0 left-0 flex items-center justify-center gap-4 px-7"
             style={{ paddingBottom: 'max(30px, env(safe-area-inset-bottom))' }}>
          <button onClick={onExit} className="press rounded-full border px-4 py-[10px] text-[12px] font-semibold"
                  style={{ borderColor: 'var(--line)', color: 'var(--ink-4)' }}>
            {t('quit')}
          </button>
          <button
            onClick={() => {
              if (paused) {
                if (pausedAt.current) deadline.current += Date.now() - pausedAt.current
                pausedAt.current = null
                setPaused(false)
              } else {
                pausedAt.current = Date.now()
                setPaused(true)
              }
            }}
            className="press grid h-[60px] w-[60px] place-items-center rounded-full border"
            style={{ borderColor: 'var(--line-2)', background: 'var(--surface)' }}
            aria-label={paused ? t('resume') : t('pause')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink-2)" strokeWidth="2" strokeLinecap="round" aria-hidden>
              {paused ? <path d="M8 5v14l11-7z" fill="var(--ink-2)" /> : <path d="M9 5v14M15 5v14" />}
            </svg>
          </button>
          <button onClick={() => (i + 1 >= legs.length ? done() : setI(i + 1))}
                  className="press rounded-full border px-4 py-[10px] text-[12px] font-semibold"
                  style={{ borderColor: 'var(--line)', color: 'var(--ink-4)' }}>
            {t('skip')}
          </button>
        </div>
      </div>
    </div>
  )
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000
  const p = Math.PI / 180
  const a =
    0.5 - Math.cos((lat2 - lat1) * p) / 2 +
    (Math.cos(lat1 * p) * Math.cos(lat2 * p) * (1 - Math.cos((lon2 - lon1) * p))) / 2
  return 2 * R * Math.asin(Math.sqrt(a))
}
