import { useMemo, useState } from 'react'
import { Store, useStore } from '@/lib/store'
import { Splash } from '@/components/Splash'
import { Onboarding, InstallSheetBody } from '@/components/Onboarding'
import { Sheet } from '@/components/bits'
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

  /** 기본 루틴은 지우지 않고 복제해서 고치도록 유도한다 */
  const openRoutine = () => {
    if (!current.builtin) {
      setModal({ kind: 'routine', routine: current })
      return
    }
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
        {tab === 'settings' && <Settings />}
      </main>
      <TabBar tab={tab} onTab={setTab} />

      {/* 최초 1회 설치 안내. 이미 홈 화면에서 열었다면 띄우지 않는다. */}
      <Sheet open={!data.installSeen && !standalone} onClose={() => set({ installSeen: true })}>
        <InstallSheetBody
          onClose={() => set({ installSeen: true })}
          onNever={() => set({ installSeen: true })}
        />
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
