// 루틴을 실제 진행 순서(운동·휴식 스텝 목록)로 펼치는 계산 모듈
import type { Exercise, Quarter, Routine } from './types'

// 진행 화면이 한 칸씩 넘기는 스텝 하나 (운동 또는 휴식)
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

/**
 * 운동 종류마다 필요한 휴식이 다르다. 헬스장이 아니므로 근력도 30초까지 갈 이유가 없다.
 * 설정의 '휴식 시간'을 기준으로 비율을 곱해 쓴다.
 */
const REST_RATIO: Record<Exercise['part'], number> = {
  warmup: 0.4,   // 자세 바꾸는 시간이면 충분하다
  cooldown: 0.4,
  core: 0.75,
  lower: 1,
  upper: 1,
  cardio: 1,
}

// 운동 종류에 맞는 휴식 시간 (설정의 휴식 시간 × 비율, 최소 5초)
export function restFor(x: Exercise, base: number): number {
  return Math.max(5, Math.round(base * REST_RATIO[x.part]))
}

// 루틴을 운동·휴식 스텝 목록으로 펼친다. dropNoisy면 발소리 나는 동작을 뺀다
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
        // 좌우 사이에는 쉬지 않는다. 다리를 바꾸는 것 자체가 쉬는 시간이다.
        // 세트 사이는 물론이고 동작이 끝난 뒤에도 넣는다. 손으로 멈춰 쉬게 두지 않는다.
        {
          steps.push({
            kind: 'rest',
            exercise: x,
            quarterIndex: qi,
            quarterLabelKo: q.labelKo,
            quarterLabelEn: q.labelEn,
            quarterTotal: quarters.length,
            setIndex: s,
            setTotal,
            seconds: restFor(x, restSeconds),
          })
        }
      }
    }
  }

  // 마지막이 휴식이면 뺀다
  while (steps.length && steps[steps.length - 1].kind === 'rest') steps.pop()
  return steps
}

// 스텝 전체의 총 시간(초)
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

// 「오늘의 순서」 화면에 쓰는 쿼터별 한 줄 요약
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
