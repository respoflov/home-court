import { useEffect, useState } from 'react'
import { Logo, Stamp } from './bits'
import { useStore } from '@/lib/store'

/** 진입 화면. 로고 + 앱 이름 + 문구가 같은 타이밍으로 함께 나타났다 사라진다. */
export function Splash({ onDone }: { onDone: () => void }) {
  const { t } = useStore()
  const [phase, setPhase] = useState<'wait' | 'in' | 'out'>('wait')

  useEffect(() => {
    const a = setTimeout(() => setPhase('in'), 400)
    const b = setTimeout(() => setPhase('out'), 2400)
    const c = setTimeout(onDone, 3100)
    return () => { clearTimeout(a); clearTimeout(b); clearTimeout(c) }
  }, [onDone])

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center" style={{ background: 'var(--void)' }}>
      <div
        className="flex flex-col items-center gap-[18px] transition-opacity duration-[700ms]"
        style={{ opacity: phase === 'in' ? 1 : 0 }}
      >
        <Logo size={82} />
        <div className="text-[25px] font-bold tracking-[-0.02em]">{t('appName')}</div>
        <div className="text-[13px]" style={{ color: 'var(--ink-3)' }}>{t('tagline')}</div>
      </div>
      <div className="transition-opacity duration-[700ms]" style={{ opacity: phase === 'in' ? 1 : 0 }}>
        <Stamp />
      </div>
    </div>
  )
}
