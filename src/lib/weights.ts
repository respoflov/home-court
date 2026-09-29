import type { LoadGroup, Profile, Weights } from './types'

/**
 * 시작 무게 표. 이 숫자는 통용되는 초급 범위를 옮긴 것이지 개인 처방이 아니다.
 * 정확도는 이 표가 아니라 세트 피드백에 의한 자동 보정이 만든다.
 */
const TABLE: Record<string, Weights> = {
  'female:none': { arm: 2, torso: 4, leg: 6 },
  'female:some': { arm: 3, torso: 6, leg: 8 },
  'female:used': { arm: 4, torso: 8, leg: 12 },
  'male:none': { arm: 4, torso: 8, leg: 12 },
  'male:some': { arm: 6, torso: 10, leg: 16 },
  'male:used': { arm: 8, torso: 14, leg: 20 },
  'unset:none': { arm: 3, torso: 6, leg: 8 },
  'unset:some': { arm: 4, torso: 8, leg: 12 },
  'unset:used': { arm: 6, torso: 10, leg: 16 },
}

export const DEFAULT_WEIGHTS: Weights = { arm: 2, torso: 4, leg: 6 }

/** 한 번에 올리는 폭. 팔은 작은 근육이라 더 잘게 올린다. */
export const STEP: Record<Exclude<LoadGroup, null>, number> = { arm: 1, torso: 2, leg: 2 }

// 성별·경험·가진 덤벨 무게로 부위별 시작 무게를 제안한다
export function suggestWeights(p: Profile): Weights {
  const sex = p.sex && p.sex !== null ? p.sex : 'unset'
  const exp = p.experience ?? 'none'
  const base = TABLE[`${sex}:${exp}`] ?? DEFAULT_WEIGHTS
  const cap = p.dumbbellMax
  if (!cap) return { ...base }
  // 가진 덤벨보다 무거운 값을 제안하지 않는다
  return { arm: Math.min(base.arm, cap), torso: Math.min(base.torso, cap), leg: Math.min(base.leg, cap) }
}

// 부위에 맞는 무게 (무게를 쓰지 않는 동작이면 null)
export function weightFor(w: Weights, load: LoadGroup): number | null {
  return load ? w[load] : null
}
