import { FIGURES } from '@/data/figures'

/**
 * 동작 그림. 규격은 src/data/figures.ts 머리말 참조.
 *
 * `animate`가 false면 시작 자세로 정지한다.
 * 목록에서 여러 개가 동시에 움직이면 산만해서, 교차는 운동 중 화면에서만 쓴다.
 */
export function Figure({
  id,
  size = 120,
  animate = false,
  className = '',
}: {
  id: string
  size?: number
  animate?: boolean
  className?: string
}) {
  const f = FIGURES[id]
  if (!f) return null

  return (
    <svg
      className={`fig ${animate ? 'fig-anim' : ''} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      aria-hidden
    >
      {f.ground && <path className="gr" d={f.ground} />}
      <g className="fA" dangerouslySetInnerHTML={{ __html: f.a }} />
      <g className="fB" dangerouslySetInnerHTML={{ __html: f.b }} />
    </svg>
  )
}

// 이 운동의 동작 그림이 있는지 확인한다
export function hasFigure(id: string) {
  return !!FIGURES[id]
}
