import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AppData, Exercise, Feel, Routine, SessionLog, Settings, Weights } from './types'
import { BUILTIN_EXERCISES } from '@/data/exercises'
import { BUILTIN_ROUTINES } from '@/data/routines'
import { DEFAULT_WEIGHTS, STEP } from './weights'
import { inWindow, minutesOfDay } from './time'
import { tr } from './i18n'
import type { Key, Lang } from './i18n'

const KEY = 'home-court.v1'

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  lang: 'ko',
  bigType: false,
  sound: true,
  countdown: true,
  quarterBuzzer: false,
  quietAuto: true,
  quietMorning: { from: 330, to: 480 },
  quietNight: { from: 1320, to: 360 },
  defaultSize: 'standard',
  restSeconds: 30,
  weeklyGoal: 4,
  weekStart: 1,
  keepAwake: true,
  gpsEnabled: false,
}

const EMPTY: AppData = {
  version: 1,
  settings: DEFAULT_SETTINGS,
  profile: { sex: null, experience: null, dumbbellMax: null },
  weights: DEFAULT_WEIGHTS,
  customExercises: [],
  hiddenIds: [],
  customRoutines: [],
  logs: [],
  feels: {},
  awayWeek: 1,
  onboarded: false,
  installSeen: false,
  figureOff: [],
}

function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<AppData>
    return {
      ...EMPTY,
      ...parsed,
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
      profile: { ...EMPTY.profile, ...(parsed.profile ?? {}) },
      weights: { ...DEFAULT_WEIGHTS, ...(parsed.weights ?? {}) },
    }
  } catch {
    return EMPTY
  }
}

interface Ctx {
  data: AppData
  set: (patch: Partial<AppData>) => void
  setSettings: (patch: Partial<Settings>) => void
  lang: Lang
  t: (k: Key) => string
  /** 기본 + 사용자 운동, 숨김 플래그가 반영된 목록 */
  allExercises: Exercise[]
  exerciseById: (id: string) => Exercise | undefined
  allRoutines: Routine[]
  routineById: (id: string) => Routine | undefined
  /** 지금이 조용 모드 시간대인가 */
  quietNow: boolean
  addLog: (log: SessionLog) => void
  deleteLog: (id: string) => void
  /** 세트 피드백 기록. 무게를 올릴 때가 되면 부위를 돌려준다. */
  recordFeel: (exercise: Exercise, feel: Feel) => 'raise' | null
  raiseWeight: (exercise: Exercise) => void
  resetFeel: (exerciseId: string) => void
  exportBackup: () => void
  importBackup: (file: File) => Promise<boolean>
  resetAll: () => void
  /** 이 동작을 운동 중에 그림으로 보여줄지 */
  figureShown: (id: string) => boolean
  toggleFigure: (id: string) => void
}

const C = createContext<Ctx | null>(null)

export function Store({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(load)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data))
    } catch {
      /* 용량 초과 등 — 저장 실패해도 화면은 계속 동작한다 */
    }
  }, [data])

  // 조용 모드 판정을 분 단위로 갱신
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const set = useCallback((patch: Partial<AppData>) => setData((d) => ({ ...d, ...patch })), [])
  const setSettings = useCallback(
    (patch: Partial<Settings>) => setData((d) => ({ ...d, settings: { ...d.settings, ...patch } })),
    [],
  )

  const { settings } = data
  const lang = settings.lang

  // 테마 · 큰 글씨를 문서 루트에 반영
  useEffect(() => {
    const root = document.documentElement
    const apply = () => {
      const dark =
        settings.theme === 'dark' ||
        (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      root.dataset.theme = dark ? 'dark' : 'light'
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) meta.setAttribute('content', dark ? '#0B0E15' : '#F7F5F1')
    }
    apply()
    if (settings.theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [settings.theme])

  useEffect(() => {
    document.documentElement.dataset.big = settings.bigType ? 'on' : 'off'
  }, [settings.bigType])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const allExercises = useMemo(() => {
    const hidden = new Set(data.hiddenIds)
    const builtin = BUILTIN_EXERCISES.map((x) => ({ ...x, hidden: hidden.has(x.id) }))
    return [...builtin, ...data.customExercises]
  }, [data.hiddenIds, data.customExercises])

  const exMap = useMemo(() => new Map(allExercises.map((x) => [x.id, x])), [allExercises])
  const exerciseById = useCallback((id: string) => exMap.get(id), [exMap])

  const allRoutines = useMemo(() => [...BUILTIN_ROUTINES, ...data.customRoutines], [data.customRoutines])
  const rtMap = useMemo(() => new Map(allRoutines.map((r) => [r.id, r])), [allRoutines])
  const routineById = useCallback((id: string) => rtMap.get(id), [rtMap])

  const quietNow = useMemo(() => {
    void tick
    if (!settings.quietAuto) return false
    const now = minutesOfDay()
    return (
      inWindow(now, settings.quietMorning.from, settings.quietMorning.to) ||
      inWindow(now, settings.quietNight.from, settings.quietNight.to)
    )
  }, [settings.quietAuto, settings.quietMorning, settings.quietNight, tick])

  const addLog = useCallback((log: SessionLog) => setData((d) => ({ ...d, logs: [log, ...d.logs] })), [])
  const deleteLog = useCallback(
    (id: string) => setData((d) => ({ ...d, logs: d.logs.filter((l) => l.id !== id) })),
    [],
  )

  const recordFeel = useCallback<Ctx['recordFeel']>((exercise, feel) => {
    let verdict: 'raise' | null = null
    setData((d) => {
      const prev = d.feels[exercise.id] ?? []
      const next = [...prev, feel].slice(-3)
      // "쉬웠다"가 두 번 연속이고, 무게가 붙는 동작일 때만 올리자고 한다
      if (exercise.load && next.length >= 2 && next.slice(-2).every((f) => f === 'easy')) verdict = 'raise'
      return { ...d, feels: { ...d.feels, [exercise.id]: next } }
    })
    return verdict
  }, [])

  const raiseWeight = useCallback<Ctx['raiseWeight']>((exercise) => {
    if (!exercise.load) return
    const g = exercise.load
    setData((d) => {
      const cap = d.profile.dumbbellMax ?? Infinity
      const next: Weights = { ...d.weights, [g]: Math.min(cap, d.weights[g] + STEP[g]) }
      return { ...d, weights: next, feels: { ...d.feels, [exercise.id]: [] } }
    })
  }, [])

  const resetFeel = useCallback((id: string) => {
    setData((d) => ({ ...d, feels: { ...d.feels, [id]: [] } }))
  }, [])

  const exportBackup = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `homecourt-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, [data])

  const importBackup = useCallback(async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as Partial<AppData>
      if (!parsed || typeof parsed !== 'object' || parsed.version !== 1) return false
      setData({
        ...EMPTY,
        ...parsed,
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
        profile: { ...EMPTY.profile, ...(parsed.profile ?? {}) },
        weights: { ...DEFAULT_WEIGHTS, ...(parsed.weights ?? {}) },
      })
      return true
    } catch {
      return false
    }
  }, [])

  const figureShown = useCallback((id: string) => !data.figureOff.includes(id), [data.figureOff])
  const toggleFigure = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      figureOff: d.figureOff.includes(id) ? d.figureOff.filter((x) => x !== id) : [...d.figureOff, id],
    }))
  }, [])

  const resetAll = useCallback(() => {
    localStorage.removeItem(KEY)
    setData(EMPTY)
  }, [])

  const t = useCallback((k: Key) => tr(lang, k), [lang])

  const value = useMemo<Ctx>(
    () => ({
      data, set, setSettings, lang, t,
      allExercises, exerciseById, allRoutines, routineById,
      quietNow, addLog, deleteLog, recordFeel, raiseWeight, resetFeel,
      exportBackup, importBackup, resetAll, figureShown, toggleFigure,
    }),
    [
      data, set, setSettings, lang, t, allExercises, exerciseById, allRoutines, routineById,
      quietNow, addLog, deleteLog, recordFeel, raiseWeight, resetFeel, exportBackup, importBackup, resetAll,
      figureShown, toggleFigure,
    ],
  )

  return <C.Provider value={value}>{children}</C.Provider>
}

export function useStore() {
  const v = useContext(C)
  if (!v) throw new Error('useStore must be used inside <Store>')
  return v
}

/** 운동 이름·큐를 현재 언어로 */
export function exName(x: Exercise, lang: Lang) {
  return lang === 'ko' ? x.nameKo : x.nameEn
}
export function exCue(x: Exercise, lang: Lang) {
  return lang === 'ko' ? x.cueKo : x.cueEn
}
export function exWarn(x: Exercise, lang: Lang) {
  return lang === 'ko' ? x.warnKo : x.warnEn
}
export function rtName(r: Routine, lang: Lang) {
  return lang === 'ko' ? r.nameKo : r.nameEn
}
