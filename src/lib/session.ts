import type { Exercise, Quarter, Routine } from './types'

export interface Step {
  kind: 'work' | 'rest'
  exercise: Exercise
  quarterIndex: number
  quarterLabelKo: string
  quarterLabelEn: string
  quarterTotal: number
  setIndex: number
  setTotal: number
  /** 좌우를 나눠 하는 동작일 때 */
  side?: 'left' | 'right'
  seconds: number
  /** 횟수형 동작이면 목표 횟수 */
  reps?: number
  /** 이 스텝이 끝나면 세트 피드백을 물을지 */
  askFeel?: boolean
}

/**
 * 횟수형 동작도 시간으로 굴린다. 폰이 바닥에 있고 사용자는 1.5m 밖에 있으므로,
 * 매 세트 화면을 두드리게 만들면 흐름이 끊긴다. 미리 넘기고 싶으면 탭하면 된다.
 */
export function secondsFor(x: Exercise, amount: number): number {
  return x.mode === 'time' ? amount : Math.max(25, Math.round(amount * 4))
}

function needsRestAfter(x: Exercise): boolean {
  return x.part !== 'warmup' && x.part !== 'cooldown'
}

export function buildSteps(
  routine: Routine,
  lookup: (id: string) => Exercise | undefined,
  restSeconds: number,
  /** 조용 모드일 때 발소리 나는 동작을 뺀다 */
  dropNoisy: boolean,
): Step[] {
  const steps: Step[] = []
  const quarters = routine.quarters
  const usable: { q: Quarter; qi: number }[] = quarters.map((q, qi) => ({ q, qi }))

  for (const { q, qi } of usable) {
    for (const slot of q.slots) {
      const x = lookup(slot.exerciseId)
      if (!x || x.hidden) continue
      if (dropNoisy && x.noise === 3) continue

      const amount = slot.amount ?? x.amount
      const setTotal = slot.sets ?? 1
      const sides: (Step['side'] | undefined)[] = x.bilateral ? ['left', 'right'] : [undefined]

      for (let s = 0; s < setTotal; s++) {
        for (const side of sides) {
          steps.push({
            kind: 'work',
            exercise: x,
            quarterIndex: qi,
            quarterLabelKo: q.labelKo,
            quarterLabelEn: q.labelEn,
            quarterTotal: quarters.length,
            setIndex: s,
            setTotal,
            side,
            seconds: secondsFor(x, amount),
            reps: x.mode === 'reps' ? amount : undefined,
            // 무게가 붙는 동작은 세트를 마칠 때마다 한 번 묻는다
            askFeel: !!x.load && side !== 'left',
          })
        }
        // 좌우 사이에는 쉬지 않는다 — 다리를 바꾸는 것 자체가 쉬는 시간이다.
        // 마지막 세트 뒤에도 넣지 않는다 — 다음 동작으로 넘어가는 것이 곧 휴식이다.
        if (needsRestAfter(x) && s < setTotal - 1) {
          steps.push({
            kind: 'rest',
            exercise: x,
            quarterIndex: qi,
            quarterLabelKo: q.labelKo,
            quarterLabelEn: q.labelEn,
            quarterTotal: quarters.length,
            setIndex: s,
            setTotal,
            seconds: restSeconds,
          })
        }
      }
    }
  }

  // 마지막이 휴식이면 뺀다
  while (steps.length && steps[steps.length - 1].kind === 'rest') steps.pop()
  return steps
}

export function totalSeconds(steps: Step[]): number {
  return steps.reduce((a, s) => a + s.seconds, 0)
}

/** 오늘의 순서 — 쿼터별 한 줄 요약 */
export interface LineupRow {
  index: number
  labelKo: string
  labelEn: string
  names: Exercise[]
  seconds: number
}

export function lineup(
  routine: Routine,
  lookup: (id: string) => Exercise | undefined,
  restSeconds: number,
  dropNoisy: boolean,
): LineupRow[] {
  const steps = buildSteps(routine, lookup, restSeconds, dropNoisy)
  return routine.quarters
    .map((q, i) => {
      const mine = steps.filter((s) => s.quarterIndex === i)
      const names: Exercise[] = []
      for (const s of mine) if (s.kind === 'work' && !names.some((n) => n.id === s.exercise.id)) names.push(s.exercise)
      return {
        index: i,
        labelKo: q.labelKo,
        labelEn: q.labelEn,
        names,
        seconds: mine.reduce((a, s) => a + s.seconds, 0),
      }
    })
    .filter((r) => r.names.length > 0)
}

/** 루틴에 필요한 기구 (준비물 칩) */
export function gearOf(
  routine: Routine,
  lookup: (id: string) => Exercise | undefined,
  dropNoisy: boolean,
): string[] {
  const set = new Set<string>()
  for (const q of routine.quarters) {
    for (const s of q.slots) {
      const x = lookup(s.exerciseId)
      if (!x || x.hidden) continue
      if (dropNoisy && x.noise === 3) continue
      for (const g of x.gear) if (g !== 'none' && g !== 'wall') set.add(g)
    }
  }
  return [...set]
}
