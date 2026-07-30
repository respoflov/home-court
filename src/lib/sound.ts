/**
 * 자체 생성음만 쓴다. 오디오 파일을 담지 않아 오프라인에서도 그대로 동작한다.
 * 소리를 꺼도 화면 테두리 신호만으로 앱이 온전히 동작하는 것이 전제다.
 */
let ctx: AudioContext | null = null

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!C) return null
    ctx = new C()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** 사용자 제스처 안에서 한 번 불러 오디오를 깨워둔다 (iOS 요구사항) */
export function primeAudio() {
  const c = ac()
  if (!c) return
  const o = c.createOscillator()
  const g = c.createGain()
  g.gain.value = 0.0001
  o.connect(g).connect(c.destination)
  o.start()
  o.stop(c.currentTime + 0.01)
}

function beep(freq: number, dur: number, when = 0, vol = 0.18) {
  const c = ac()
  if (!c) return
  const t = c.currentTime + when
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(freq, t)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(vol, t + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(c.destination)
  o.start(t)
  o.stop(t + dur + 0.02)
}

/** 전환 3초 전 카운트다운 한 틱 */
export const tick = () => beep(880, 0.09)
/** 다음 동작으로 넘어감 */
export const advance = () => { beep(1046, 0.14); beep(1568, 0.18, 0.1) }
/** 쿼터 종료 버저 */
export const buzzer = () => { beep(220, 0.5, 0, 0.22); beep(165, 0.55, 0.04, 0.16) }
/** 경기 종료 */
export const finish = () => { beep(660, 0.14); beep(880, 0.14, 0.13); beep(1320, 0.34, 0.26) }
