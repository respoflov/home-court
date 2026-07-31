import { useMemo, useState } from 'react'
import { Store, useStore } from '@/lib/store'
import { Splash } from '@/components/Splash'
import { Onboarding, WelcomeSheetBody } from '@/components/Onboarding'
import { Cta, Sheet } from '@/components/bits'
import { TabBar } from '@/components/TabBar'
import type { Tab } from '@/components/TabBar'
import { Today } from '@/screens/Today'
import { Live } from '@/screens/Live'
import { Playbook } from '@/screens/Playbook'
import { RoutineEdit } from '@/screens/RoutineEdit'
import { ExerciseForm } from '@/screens/ExerciseForm'
import { Away } from '@/screens/Away'
import { Record } from '@/screens/Record'
import { Settings } from '@/screens/Settings'
import { buildSteps } from '@/lib/session'
import type { Exercise, Routine } from '@/lib/types'
import * as sound from '@/lib/sound'

type Modal =
  | { kind: 'none' }
  | { kind: 'live'; routine: Routine }
  | { kind: 'routine'; routine: Routine }
  | { kind: 'exercise'; editing: Exercise | null }

function Shell() {
  const { t, data, set, allRoutines, exerciseById, quietNow } = useStore()
  const [splash, setSplash] = useState(true)
  const [tab, setTab] = useState<Tab>('today')
  const [modal, setModal] = useState<Modal>({ kind: 'none' })
  const [size, setSize] = useState(data.settings.defaultSize)
  /** 사용자가 만든 루틴을 오늘의 경기로 골랐을 때만 채워진다 */
  const [pickedId, setPickedId] = useState<string | null>(null)
  /** 이미 열린 탭을 다시 누르면 그 탭을 처음 상태로 되돌린다 */
  const [tabReset, setTabReset] = useState(0)
  const [askCopy, setAskCopy] = useState(false)

  const standalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true)

  const current = useMemo(
    () =>
      allRoutines.find((r) => r.id === pickedId) ??
      allRoutines.find((r) => r.size === size) ??
      allRoutines[0],
    [allRoutines, pickedId, size],
  )

  if (splash) return <Splash onDone={() => setSplash(false)} />
  if (!data.onboarded) return <Onboarding onDone={() => undefined} />

  if (modal.kind === 'live') {
    const steps = buildSteps(modal.routine, exerciseById, data.settings.restSeconds, quietNow)
    return (
      <Live
        steps={steps}
        title={modal.routine.nameKo}
        titleEn={modal.routine.nameEn}
        routineId={modal.routine.id}
        size={modal.routine.size}
        onExit={() => setModal({ kind: 'none' })}
      />
    )
  }
  if (modal.kind === 'routine')
    return <RoutineEdit routine={modal.routine} onBack={() => setModal({ kind: 'none' })} />
  if (modal.kind === 'exercise')
    return <ExerciseForm editing={modal.editing} onBack={() => setModal({ kind: 'none' })} />

  /**
   * 기본 루틴은 고칠 수 없으므로 복제해야 한다.
   * 예전에는 탭하는 즉시 복사본을 만들어서, 오늘의 순서를 눌러볼 때마다
   * "(복사본)"이 쌓였다. 이제는 물어보고 만든다.
   */
  const openRoutine = () => {
    if (!current.builtin) {
      setModal({ kind: 'routine', routine: current })
      return
    }
    setAskCopy(true)
  }

  const makeCopy = () => {
    setAskCopy(false)
    const stamp = Date.now()
    const copy: Routine = {
      ...current,
      id: `r${stamp}`,
      builtin: false,
      size: undefined,
      nameKo: current.nameKo + t('copySuffix'),
      nameEn: current.nameEn + t('copySuffix'),
      quarters: current.quarters.map((q, i) => ({
        ...q,
        id: `q${stamp}-${i}`,
        slots: q.slots.map((s) => ({ ...s })),
      })),
    }
    set({ customRoutines: [...data.customRoutines, copy] })
    setPickedId(copy.id)
    setModal({ kind: 'routine', routine: copy })
  }

  return (
    <div className="flex h-full flex-col" style={{ background: 'var(--void)' }}>
      <main className="min-h-0 flex-1">
        {tab === 'today' && (
          <Today
            routine={current}
            onPickSize={(s) => {
              setSize(s)
              setPickedId(null)
            }}
            onStart={() => {
              sound.primeAudio()
              setModal({ kind: 'live', routine: current })
            }}
            onOpenRoutine={openRoutine}
          />
        )}
        {tab === 'away' && <Away />}
        {tab === 'playbook' && (
          <Playbook
            onEditRoutine={(r) => setModal({ kind: 'routine', routine: r })}
            onAddExercise={() => setModal({ kind: 'exercise', editing: null })}
            onEditExercise={(x) => setModal({ kind: 'exercise', editing: x })}
          />
        )}
        {tab === 'record' && <Record />}
        {tab === 'settings' && <Settings resetSignal={tabReset} />}
      </main>
      <TabBar
        tab={tab}
        onTab={(next) => {
          if (next === tab) setTabReset((n) => n + 1)
          setTab(next)
        }}
      />

      <Sheet open={askCopy} onClose={() => setAskCopy(false)}>
        <h3 className="text-[20px] font-bold tracking-[-0.02em]">{t('copyAskTitle')}</h3>
        <p className="mt-2 text-[13px] leading-[1.65]" style={{ color: 'var(--ink-2)' }}>{t('copyAskBody')}</p>
        <div className="mt-5 flex flex-col gap-2">
          <Cta onClick={makeCopy}>{t('duplicate')}</Cta>
          <Cta ghost onClick={() => setAskCopy(false)}>{t('cancel')}</Cta>
        </div>
      </Sheet>

      {/* 최초 1회 안내. 홈 화면에서 열었더라도 한 번은 띄운다. */}
      <Sheet open={!data.welcomeSeen} onClose={() => set({ welcomeSeen: true })}>
        <WelcomeSheetBody standalone={standalone} onClose={() => set({ welcomeSeen: true })} />
      </Sheet>
    </div>
  )
}

export default function App() {
  return (
    <Store>
      <Shell />
    </Store>
  )
}
