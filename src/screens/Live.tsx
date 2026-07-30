import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { exCue, exName, useStore } from '@/lib/store'
import type { Step } from '@/lib/session'
import { totalSeconds } from '@/lib/session'
import type { Exercise, Feel, SessionLog } from '@/lib/types'
import { mmss, hm, ymd } from '@/lib/time'
import { weightFor } from '@/lib/weights'
import * as sound from '@/lib/sound'
import * as wake from '@/lib/wakelock'
import { Cta, Sheet } from '@/components/bits'

/**
 * 이 앱의 승부처. 폰은 바닥에 있고 사용자는 1.5m 밖에서 곁눈질한다.
 * 그래서 타이머를 중앙 링이 아니라 화면 테두리 전체에 두고,
 * 전환 3초 전에는 테두리가 굵어지며 뜨거워진다 ("조용한 버저").
 * 소리를 꺼도 이 신호만으로 앱이 온전히 동작해야 한다.
 */
export function Live({
  steps,
  title,
  titleEn,
  routineId,
  size,
  onExit,
}: {
  steps: Step[]
  title: string
  titleEn: string
  routineId?: string
  size?: 'timeout' | 'standard' | 'full'
  onExit: (completed: boolean) => void
}) {
  const { t, lang, data, addLog, recordFeel, raiseWeight } = useStore()
  const { settings, weights } = data

  const [i, setI] = useState(0)
  const [remain, setRemain] = useState(steps[0]?.seconds ?? 0)
  const [paused, setPaused] = useState(false)
  const [feelFor, setFeelFor] = useState<Exercise | null>(null)
  const [raiseFor, setRaiseFor] = useState<Exercise | null>(null)
  const [finished, setFinished] = useState(false)

  const startedAt = useRef(new Date())
  const lastTick = useRef(-1)
  /** setI 배칭 때문에 클로저의 i가 낡을 수 있어 실제 위치는 ref로 따로 든다 */
  const iRef = useRef(0)
  const step = steps[i]
  const done = i >= steps.length

  /* ── Wake Lock ───────────────────────────────── */
  useEffect(() => {
    if (!settings.keepAwake) return
    void wake.acquire()
    const off = wake.reacquireOnVisible(() => settings.keepAwake)
    return () => {
      off()
      void wake.release()
    }
  }, [settings.keepAwake])

  /* ── 타이머 ──────────────────────────────────
     setInterval 누적 오차를 피하려고 벽시계 기준으로 남은 시간을 계산한다.
     백그라운드에 다녀와도 복귀 시 실제 경과가 반영된다. */
  const deadline = useRef<number>(Date.now() + (steps[0]?.seconds ?? 0) * 1000)
  const pausedAt = useRef<number | null>(null)

  useEffect(() => {
    iRef.current = i
    if (done) return
    deadline.current = Date.now() + step.seconds * 1000
    setRemain(step.seconds)
    lastTick.current = -1
  }, [i, done, step?.seconds])

  useEffect(() => {
    // 피드백 시트가 떠 있어도 휴식 시계는 계속 간다 (안내 문구가 그렇게 약속한다).
    // 무게 올리기 제안만은 결정이 필요하므로 잠시 멈춘다.
    if (done || paused || raiseFor) return
    const id = setInterval(() => {
      const left = Math.max(0, (deadline.current - Date.now()) / 1000)
      setRemain(left)
      const whole = Math.ceil(left)
      if (whole !== lastTick.current) {
        lastTick.current = whole
        if (settings.sound && settings.countdown && whole > 0 && whole <= 3) sound.tick()
      }
      if (left <= 0) next()
    }, 100)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, paused, done, raiseFor, settings.sound, settings.countdown])

  const finishSession = useCallback(() => {
    const secs = Math.round((Date.now() - startedAt.current.getTime()) / 1000)
    const log: SessionLog = {
      id: `s${Date.now()}`,
      side: 'home',
      routineId,
      titleKo: title,
      titleEn,
      date: ymd(startedAt.current),
      time: hm(startedAt.current),
      seconds: secs,
      quarters: new Set(steps.map((s) => s.quarterIndex)).size,
      size,
    }
    addLog(log)
    if (settings.sound) sound.finish()
    setFinished(true)
  }, [addLog, routineId, settings.sound, size, steps, title, titleEn])

  const next = useCallback(() => {
    const at = iRef.current
    const cur = steps[at]
    if (!cur) return

    // 휴식이 끝나면 아직 열려 있는 피드백 시트를 닫는다
    if (cur.kind === 'rest') setFeelFor(null)

    // 세트를 마쳤고 무게가 붙는 동작이면 휴식 중에 한 번 묻는다
    if (cur.kind === 'work' && cur.askFeel && steps[at + 1]?.kind === 'rest') {
      setFeelFor(cur.exercise)
    }

    if (settings.sound) {
      const lastOfQuarter = steps[at + 1] && steps[at + 1].quarterIndex !== cur.quarterIndex
      if (lastOfQuarter && settings.quarterBuzzer) sound.buzzer()
      else sound.advance()
    }

    iRef.current = at + 1
    if (at + 1 >= steps.length) {
      setI(steps.length)
      finishSession()
    } else {
      setI(at + 1)
    }
  }, [steps, settings.sound, settings.quarterBuzzer, finishSession])

  const onFeel = (feel: Feel) => {
    const ex = feelFor
    setFeelFor(null)
    if (!ex) return
    const verdict = recordFeel(ex, feel)
    if (verdict === 'raise') setRaiseFor(ex)
  }

  const togglePause = () => {
    if (paused) {
      if (pausedAt.current) deadline.current += Date.now() - pausedAt.current
      pausedAt.current = null
      setPaused(false)
    } else {
      pausedAt.current = Date.now()
      setPaused(true)
    }
  }

  /* ── 테두리 타이머 ───────────────────────────── */
  const frac = step ? Math.max(0, Math.min(1, remain / step.seconds)) : 0
  const hot = !done && remain <= 3.2 && step?.kind === 'work'
  const dash = `${(frac * 100).toFixed(2)} ${(100 - frac * 100).toFixed(2)}`

  const weight = useMemo(
    () => (step?.kind === 'work' ? weightFor(weights, step.exercise.load) : null),
    [step, weights],
  )

  const totalMin = useMemo(() => Math.round(totalSeconds(steps) / 60), [steps])

  if (finished) {
    return (
      <div className="fade-up flex h-full flex-col items-center justify-center gap-6 px-8 text-center">
        <div className="text-[13px] font-bold tracking-[0.12em]" style={{ color: 'var(--buzzer)' }}>
          {t('finished')}
        </div>
        <div className="text-[34px] font-bold tracking-[-0.03em]">{t('wellDone')}</div>
        <div className="text-[14px]" style={{ color: 'var(--ink-2)' }}>
          {lang === 'ko' ? title : titleEn} · {totalMin}
          {t('min')}
        </div>
        <div className="mt-4 w-full max-w-[280px]">
          <Cta onClick={() => onExit(true)}>{t('backToToday')}</Cta>
        </div>
      </div>
    )
  }

  if (done || !step) return null

  const label = lang === 'ko' ? step.quarterLabelKo : step.quarterLabelEn
  const isRest = step.kind === 'rest'
  const name = exName(step.exercise, lang)
  const sideLabel = step.side ? (step.side === 'left' ? t('left') : t('right')) : null

  // 휴식은 건너뛰고 실제 다음 동작을 보여준다 — 쉬는 동안 뭘 준비할지 알아야 한다
  const upNext = steps.slice(i + 1).find((s) => s.kind === 'work')
  const upNextName = upNext
    ? exName(upNext.exercise, lang) +
      (upNext.side ? ` (${upNext.side === 'left' ? t('left') : t('right')})` : '')
    : ''

  return (
    <div className="relative h-full" style={{ background: 'var(--void)' }}>
      {/* 조용한 버저 — 화면 테두리 전체가 남은 시간이자 전환 신호 */}
      <svg className="pointer-events-none absolute inset-0 z-[5] h-full w-full" preserveAspectRatio="none"
           viewBox="0 0 375 812" aria-hidden>
        <rect x="5" y="5" width="365" height="802" rx="35" fill="none"
              stroke={hot ? 'rgba(255,77,46,.16)' : 'var(--line)'} strokeWidth={hot ? 9 : 5} />
        <rect x="5" y="5" width="365" height="802" rx="35" fill="none"
              stroke={hot ? 'var(--buzzer-hot)' : 'var(--buzzer)'} strokeWidth={hot ? 9 : 5}
              strokeLinecap="round" pathLength={100} strokeDasharray={dash} strokeDashoffset={-6} />
      </svg>
      {hot && (
        <div
          className="pointer-events-none absolute inset-0 z-[4]"
          style={{
            background:
              'radial-gradient(120% 60% at 50% 0%, rgba(255,77,46,.16), transparent 62%), radial-gradient(120% 60% at 50% 100%, rgba(255,77,46,.16), transparent 62%)',
          }}
        />
      )}

      <div className="relative z-10 flex h-full flex-col px-7"
           style={{ paddingTop: 'max(58px, env(safe-area-inset-top))', paddingBottom: 'max(30px, env(safe-area-inset-bottom))' }}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-[0.12em]" style={{ color: 'var(--ink-3)' }}>
            {label}
          </span>
          <span className="tnum flex items-center gap-[7px] text-[11px] font-semibold" style={{ color: 'var(--ink-4)' }}>
            {settings.sound && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M11 5 6 9H3v6h3l5 4V5z" />
                <path d="M16 9.5a4 4 0 0 1 0 5" />
              </svg>
            )}
            {step.quarterIndex + 1} / {step.quarterTotal}
          </span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center">
          <div
            className="text-center font-semibold tracking-[-0.02em]"
            style={{ fontSize: 'calc(26px * var(--live-scale))' }}
          >
            {isRest ? t('rest') : name}
            {sideLabel && !isRest && (
              <span className="ml-2 text-[15px] font-medium" style={{ color: 'var(--buzzer)' }}>
                {sideLabel}
              </span>
            )}
          </div>

          <div
            className="tnum my-[26px] leading-none font-extrabold tracking-[-0.055em]"
            style={{ fontSize: 'calc(104px * var(--live-scale))', color: hot ? 'var(--buzzer-hot)' : 'var(--ink)' }}
          >
            {mmss(remain)}
          </div>

          {hot ? (
            <div className="text-[15px] font-semibold" style={{ color: 'var(--buzzer-hot)' }}>
              {t('switchingSoon')}
            </div>
          ) : (
            <div className="tnum text-[15px] font-medium" style={{ color: 'var(--ink-2)' }}>
              {isRest
                ? `${t('upNext')} · ${upNextName || exName(step.exercise, lang)}`
                : [
                    step.reps ? `${step.reps}${lang === 'ko' ? t('reps') : ' ' + t('reps')}` : null,
                    step.setTotal > 1
                      ? lang === 'ko'
                        ? `${step.setTotal}${t('set')} 중 ${step.setIndex + 1}${t('set')}`
                        : `${t('set')} ${step.setIndex + 1} ${t('of')} ${step.setTotal}`
                      : null,
                    weight ? `${weight}kg` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
            </div>
          )}

          {!isRest && (
            <div
              className="mt-[9px] max-w-[280px] text-center text-[13px] leading-[1.55]"
              style={{ color: 'var(--ink-3)' }}
            >
              {exCue(step.exercise, lang)}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-5">
          {upNext && (
            <button onClick={next} className="press text-[12.5px]" style={{ color: 'var(--ink-3)' }}>
              {t('upNext')}{' '}
              <b className="font-semibold" style={{ color: 'var(--ink-2)' }}>
                {upNextName}
              </b>
            </button>
          )}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onExit(false)}
              className="press rounded-full border px-4 py-[10px] text-[12px] font-semibold"
              style={{ borderColor: 'var(--line)', color: 'var(--ink-4)' }}
            >
              {t('quit')}
            </button>
            <button
              onClick={togglePause}
              aria-label={paused ? t('resume') : t('pause')}
              className="press grid h-[60px] w-[60px] place-items-center rounded-full border"
              style={{ borderColor: 'var(--line-2)', background: 'var(--surface)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink-2)"
                   strokeWidth="2" strokeLinecap="round" aria-hidden>
                {paused ? <path d="M8 5v14l11-7z" fill="var(--ink-2)" /> : <path d="M9 5v14M15 5v14" />}
              </svg>
            </button>
            <button
              onClick={next}
              className="press rounded-full border px-4 py-[10px] text-[12px] font-semibold"
              style={{ borderColor: 'var(--line)', color: 'var(--ink-4)' }}
            >
              {t('skip')}
            </button>
          </div>
        </div>
      </div>

      {/* 세트 피드백 — 휴식은 어차피 비어 있는 시간이라 여기서 묻는다 */}
      <Sheet open={!!feelFor} onClose={() => setFeelFor(null)}>
        {feelFor && (
          <>
            <h3 className="text-[20px] font-bold tracking-[-0.02em]">{t('howWasIt')}</h3>
            <p className="mt-2 text-[13px] leading-[1.65]" style={{ color: 'var(--ink-2)' }}>
              {exName(feelFor, lang)}
              {weightFor(weights, feelFor.load) ? ` · ${weightFor(weights, feelFor.load)}kg` : ''}
            </p>
            <div className="mt-[18px] flex gap-2">
              {(['easy', 'good', 'hard'] as Feel[]).map((f) => (
                <button
                  key={f}
                  onClick={() => onFeel(f)}
                  className="press flex-1 rounded-[12px] border py-[15px] text-[13px] font-semibold"
                  style={{ borderColor: 'var(--line-2)', color: 'var(--ink-2)' }}
                >
                  {f === 'easy' ? t('feelEasy') : f === 'good' ? t('feelGood') : t('feelHard')}
                </button>
              ))}
            </div>
            <div
              className="mt-4 rounded-[12px] px-[14px] py-3 text-[12px] leading-[1.6]"
              style={{ background: 'var(--buzzer-soft)', color: 'var(--buzzer)' }}
            >
              {t('feelNote')}
            </div>
          </>
        )}
      </Sheet>

      {/* 무게 올리기 제안 — "쉬웠다"가 두 번 연속일 때만 */}
      <Sheet open={!!raiseFor} onClose={() => setRaiseFor(null)}>
        {raiseFor && (
          <RaiseSheet
            exercise={raiseFor}
            onYes={() => {
              raiseWeight(raiseFor)
              setRaiseFor(null)
            }}
            onNo={() => setRaiseFor(null)}
          />
        )}
      </Sheet>
    </div>
  )
}

function RaiseSheet({
  exercise,
  onYes,
  onNo,
}: {
  exercise: Exercise
  onYes: () => void
  onNo: () => void
}) {
  const { t, lang, data } = useStore()
  const cur = weightFor(data.weights, exercise.load) ?? 0
  const step = exercise.load === 'arm' ? 1 : 2
  const cap = data.profile.dumbbellMax ?? Infinity
  const nextW = Math.min(cap, cur + step)

  return (
    <>
      <h3 className="text-[20px] font-bold tracking-[-0.02em]">{t('raiseTitle')}</h3>
      <p className="mt-2 text-[13px] leading-[1.65]" style={{ color: 'var(--ink-2)' }}>
        <b style={{ color: 'var(--ink)' }}>{exName(exercise, lang)}</b>
        {t('raiseBody')}
      </p>
      <div className="my-[22px] flex items-center justify-center gap-[18px]">
        <div className="text-center">
          <div className="text-[12px]" style={{ color: 'var(--ink-3)' }}>{t('raiseNow')}</div>
          <div className="tnum text-[32px] font-extrabold tracking-[-0.04em]">
            {cur}
            <span className="text-[15px]">kg</span>
          </div>
        </div>
        <div className="text-[20px]" style={{ color: 'var(--ink-4)' }}>→</div>
        <div className="text-center">
          <div className="text-[12px]" style={{ color: 'var(--buzzer)' }}>{t('raiseNext')}</div>
          <div className="tnum text-[32px] font-extrabold tracking-[-0.04em]" style={{ color: 'var(--buzzer)' }}>
            {nextW}
            <span className="text-[15px]">kg</span>
          </div>
        </div>
      </div>
      <div
        className="rounded-[12px] px-[14px] py-3 text-[12px] leading-[1.6]"
        style={{ background: 'var(--buzzer-soft)', color: 'var(--buzzer)' }}
      >
        {t('raiseNote')}
      </div>
      <div className="mt-[18px] flex flex-col gap-2">
        <Cta onClick={onYes}>{t('raiseYes')}</Cta>
        <Cta ghost onClick={onNo}>{t('raiseNo')}</Cta>
      </div>
    </>
  )
}
