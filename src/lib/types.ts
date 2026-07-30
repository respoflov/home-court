/** 소음 등급 — 1: 사실상 무소음 / 2: 서서 하되 발을 떼지 않음 / 3: 발을 떼고 내려놓음 */
export type Noise = 1 | 2 | 3

/** 운동 분류. 루틴의 쿼터를 채울 때 기본 후보를 고르는 기준이 된다. */
export type Part = 'warmup' | 'core' | 'lower' | 'upper' | 'cardio' | 'cooldown'

/** 무게를 붙일 수 있는 부위 묶음. 덤벨 무게는 이 단위로 관리한다. */
export type LoadGroup = 'arm' | 'torso' | 'leg' | null

export type Gear = 'mat' | 'dumbbell' | 'stepper' | 'chair' | 'wall' | 'towel' | 'none'

export interface Exercise {
  id: string
  /** 기본 제공 운동인지. true면 삭제 대신 숨김만 가능하다. */
  builtin: boolean
  nameKo: string
  nameEn: string
  cueKo: string
  cueEn: string
  part: Part
  noise: Noise
  gear: Gear[]
  /** 덤벨 무게가 붙는 부위. null이면 무게 개념이 없는 동작. */
  load: LoadGroup
  /** 기본 수행 방식 */
  mode: 'time' | 'reps'
  /** mode==='time'이면 초, 'reps'면 횟수 */
  amount: number
  /** 좌우를 나눠 하는 동작 */
  bilateral?: boolean
  hidden?: boolean
}

export interface SlotRef {
  exerciseId: string
  /** 루틴 안에서 덮어쓴 값. 없으면 운동의 기본값을 쓴다. */
  amount?: number
  sets?: number
}

export interface Quarter {
  id: string
  labelKo: string
  labelEn: string
  slots: SlotRef[]
}

export interface Routine {
  id: string
  builtin: boolean
  nameKo: string
  nameEn: string
  /** 오늘 탭 분량 세그먼트에 노출되는 기본 루틴의 크기 */
  size?: 'timeout' | 'standard' | 'full'
  quarters: Quarter[]
}

export interface SessionLog {
  id: string
  /** 'home' = 실내 홈트, 'away' = 러닝 */
  side: 'home' | 'away'
  routineId?: string
  titleKo: string
  titleEn: string
  /** ISO 날짜 (YYYY-MM-DD, 로컬 기준) */
  date: string
  /** 시작 시각 HH:MM */
  time: string
  /** 실제 수행 시간(초) */
  seconds: number
  quarters?: number
  size?: 'timeout' | 'standard' | 'full'
  /** 원정 전용 */
  awayWeek?: number
  /** GPS를 켰을 때만 */
  meters?: number
  /** 화면이 꺼져 위치를 못 받은 시간(초). 0보다 크면 거리는 추정치다. */
  gapSeconds?: number
}

export type Feel = 'easy' | 'good' | 'hard'

export interface Profile {
  sex: 'female' | 'male' | 'unset' | null
  experience: 'none' | 'some' | 'used' | null
  /** 보유 덤벨 개당 최대 무게(kg) */
  dumbbellMax: number | null
}

export interface Weights {
  arm: number
  torso: number
  leg: number
}

export interface QuietWindow {
  /** 분 단위 (0~1439) */
  from: number
  to: number
}

export interface Settings {
  theme: 'light' | 'system' | 'dark'
  lang: 'ko' | 'en'
  bigType: boolean
  sound: boolean
  countdown: boolean
  quarterBuzzer: boolean
  quietAuto: boolean
  quietMorning: QuietWindow
  quietNight: QuietWindow
  defaultSize: 'timeout' | 'standard' | 'full'
  restSeconds: number
  weeklyGoal: number
  weekStart: 0 | 1
  keepAwake: boolean
  gpsEnabled: boolean
}

export interface AppData {
  version: 1
  settings: Settings
  profile: Profile
  weights: Weights
  /** 사용자가 추가한 운동만 담긴다. 기본 운동은 코드에 있다. */
  customExercises: Exercise[]
  /** 숨긴 기본 운동 id */
  hiddenIds: string[]
  /** 사용자가 만든 루틴 */
  customRoutines: Routine[]
  logs: SessionLog[]
  /** 무게 자동 진급용 — 운동별 최근 피드백 */
  feels: Record<string, Feel[]>
  awayWeek: number
  onboarded: boolean
  installSeen: boolean
}
