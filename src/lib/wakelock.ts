/**
 * Screen Wake Lock. iOS는 16.4+, 홈 화면 PWA는 18.4+에서 동작한다.
 * 지원하지 않아도 앱은 그대로 굴러가야 하므로 실패를 삼킨다.
 */
type Sentinel = { release: () => Promise<void>; released: boolean }

let held: Sentinel | null = null

// 화면 꺼짐 방지를 요청한다. 성공 여부를 돌려준다
export async function acquire(): Promise<boolean> {
  const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<Sentinel> } }
  if (!nav.wakeLock) return false
  try {
    held = await nav.wakeLock.request('screen')
    return true
  } catch {
    return false
  }
}

// 화면 꺼짐 방지를 해제한다
export async function release() {
  try {
    await held?.release()
  } catch {
    /* 이미 해제된 경우 */
  }
  held = null
}

// 지금 화면 꺼짐 방지가 걸려 있는지
export function isHeld() {
  return !!held && !held.released
}

/** 백그라운드에 다녀오면 잠금이 풀리므로 복귀 때 다시 잡아준다 */
export function reacquireOnVisible(enabled: () => boolean) {
  const onVis = () => {
    if (document.visibilityState === 'visible' && enabled() && !isHeld()) void acquire()
  }
  document.addEventListener('visibilitychange', onVis)
  return () => document.removeEventListener('visibilitychange', onVis)
}
