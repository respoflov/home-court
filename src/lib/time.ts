/** 로컬 기준 YYYY-MM-DD */
export function ymd(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

// 현재 시각 "HH:MM"
export function hm(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}`
}

// 초를 "MM:SS"로 바꾼다
export function mmss(total: number): string {
  const s = Math.max(0, Math.round(total))
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(Math.floor(s / 60))}:${p(s % 60)}`
}

// 자정부터 지난 분 수
export function minutesOfDay(d = new Date()): number {
  return d.getHours() * 60 + d.getMinutes()
}

// 자정부터의 분 두 개를 "22:00 ~ 07:00" 형식의 시간대로 바꾼다
export function fmtWindow(from: number, to: number): string {
  const f = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
  return `${f(from)} ~ ${f(to)}`
}

/** from~to가 자정을 넘어가는 구간도 처리 */
export function inWindow(now: number, from: number, to: number): boolean {
  return from <= to ? now >= from && now < to : now >= from || now < to
}

// "YYYY-MM-DD"에 n일을 더한다
export function addDays(date: string, n: number): string {
  const d = new Date(date + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return ymd(d)
}

/** weekStart(0=일, 1=월) 기준 주의 첫날 */
export function startOfWeek(date: string, weekStart: 0 | 1): string {
  const d = new Date(date + 'T00:00:00')
  const diff = (d.getDay() - weekStart + 7) % 7
  d.setDate(d.getDate() - diff)
  return ymd(d)
}
