import type { Routine } from '@/lib/types'

const q = (id: string, labelKo: string, labelEn: string, slots: [string, number?, number?][]) => ({
  id,
  labelKo,
  labelEn,
  slots: slots.map(([exerciseId, amount, sets]) => ({ exerciseId, amount, sets })),
})

/**
 * 기본 루틴 3종. 분량이 줄면 쿼터 수가 줄어드는 구조라
 * 어디까지 왔는지가 화면에 늘 보인다.
 */
export const BUILTIN_ROUTINES: Routine[] = [
  {
    id: 'timeout',
    builtin: true,
    size: 'timeout',
    nameKo: '타임아웃',
    nameEn: 'Timeout',
    quarters: [
      q('t1', '1Q 몸 펴기', '1Q Unwind', [
        ['cat-cow', 45],
        ['thread-needle', 40],
        ['hip-flexor', 40],
        ['glute-bridge-warm', 45],
        ['deep-squat-hold', 40],
      ]),
      q('t2', '쿨다운', 'Cool-down', [['child-pose', 40]]),
    ],
  },
  {
    id: 'standard',
    builtin: true,
    size: 'standard',
    nameKo: '기본 경기',
    nameEn: 'Standard Game',
    quarters: [
      q('s1', '1Q 웜업', '1Q Warm-up', [
        ['cat-cow', 45],
        ['hip-flexor', 40],
        ['deep-squat-hold', 40],
        ['ankle-calf', 40],
      ]),
      q('s2', '2Q 하체', '2Q Lower', [
        ['goblet-squat', 10, 2],
        ['dumbbell-rdl', 10, 2],
        ['hip-thrust', 12, 2],
      ]),
      q('s3', '3Q 상체·코어', '3Q Upper & Core', [
        ['one-arm-row', 10],
        ['dead-bug', 40, 2],
        ['plank', 30, 2],
      ]),
      q('s4', '쿨다운', 'Cool-down', [
        ['child-pose', 40],
        ['hip-flexor', 40],
      ]),
    ],
  },
  {
    id: 'full',
    builtin: true,
    size: 'full',
    nameKo: '풀 경기',
    nameEn: 'Full Game',
    quarters: [
      q('f1', '1Q 웜업', '1Q Warm-up', [
        ['cat-cow', 45],
        ['thread-needle', 35],
        ['hip-flexor', 40],
        ['wall-slide', 40],
        ['stepper-warm', 120],
      ]),
      q('f2', '2Q 하체', '2Q Lower', [
        ['goblet-squat', 10, 2],
        ['dumbbell-rdl', 10, 2],
        ['split-squat', 8],
        ['hip-thrust', 12, 2],
      ]),
      q('f3', '3Q 상체', '3Q Upper', [
        ['one-arm-row', 10, 2],
        ['floor-press', 10, 2],
        ['shoulder-press', 12, 2],
        ['prone-ytw', 40],
      ]),
      q('f4', '4Q 코어', '4Q Core', [
        ['dead-bug', 40, 2],
        ['bird-dog', 35, 2],
        ['plank', 30, 2],
        ['suitcase-hold', 30],
      ]),
      q('f5', '컨디셔닝', 'Conditioning', [['stepper-interval', 300]]),
      q('f6', '쿨다운', 'Cool-down', [
        ['child-pose', 40],
        ['figure-four', 30],
        ['hip-flexor', 40],
      ]),
    ],
  },
]

/** 원정(러닝) 4주 프로그램. 시간 기반이라 GPS 없이도 완전히 동작한다. */
export const AWAY_PROGRAM = [
  { week: 1, walk: 3, run: 1, sets: 5 },
  { week: 2, walk: 2, run: 2, sets: 5 },
  { week: 3, walk: 2, run: 3, sets: 5 },
  { week: 4, walk: 1, run: 4, sets: 5 },
]
