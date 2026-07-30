import { useMemo, useState } from 'react'
import { exName, rtName, useStore } from '@/lib/store'
import type { Exercise, Part, Routine } from '@/lib/types'
import { Badge, Cta, GroupLabel, NoiseMark, ScreenHead, Sheet } from '@/components/bits'
import { buildSteps, totalSeconds } from '@/lib/session'

const PARTS: Part[] = ['warmup', 'core', 'lower', 'upper', 'cardio', 'cooldown']

export function Playbook({
  onEditRoutine,
  onAddExercise,
  onEditExercise,
}: {
  onEditRoutine: (r: Routine) => void
  onAddExercise: () => void
  onEditExercise: (x: Exercise) => void
}) {
  const { t, lang, data, set, allExercises, allRoutines, quietNow } = useStore()
  const [seg, setSeg] = useState<'routines' | 'exercises'>('routines')
  const [part, setPart] = useState<Part | 'all'>('all')
  const [menu, setMenu] = useState<Exercise | null>(null)
  const [rmenu, setRmenu] = useState<Routine | null>(null)

  const partLabel: Record<Part, string> = {
    warmup: t('partWarmup'), core: t('partCore'), lower: t('partLower'),
    upper: t('partUpper'), cardio: t('partCardio'), cooldown: t('partCooldown'),
  }

  const visible = useMemo(
    () => (part === 'all' ? allExercises : allExercises.filter((x) => x.part === part)),
    [allExercises, part],
  )

  const duplicate = (r: Routine) => {
    const copy: Routine = {
      ...r,
      id: `r${Date.now()}`,
      builtin: false,
      size: undefined,
      nameKo: r.nameKo + t('copySuffix'),
      nameEn: r.nameEn + t('copySuffix'),
      quarters: r.quarters.map((q) => ({ ...q, id: `${q.id}-${Date.now()}`, slots: q.slots.map((s) => ({ ...s })) })),
    }
    set({ customRoutines: [...data.customRoutines, copy] })
    setRmenu(null)
    onEditRoutine(copy)
  }

  const newRoutine = () => {
    const r: Routine = {
      id: `r${Date.now()}`,
      builtin: false,
      nameKo: '새 루틴',
      nameEn: 'New routine',
      quarters: [{ id: `q${Date.now()}`, labelKo: '1Q', labelEn: '1Q', slots: [] }],
    }
    set({ customRoutines: [...data.customRoutines, r] })
    onEditRoutine(r)
  }

  const toggleHide = (x: Exercise) => {
    const has = data.hiddenIds.includes(x.id)
    set({ hiddenIds: has ? data.hiddenIds.filter((i) => i !== x.id) : [...data.hiddenIds, x.id] })
    setMenu(null)
  }

  const removeExercise = (x: Exercise) => {
    set({
      customExercises: data.customExercises.filter((e) => e.id !== x.id),
      customRoutines: data.customRoutines.map((r) => ({
        ...r,
        quarters: r.quarters.map((q) => ({ ...q, slots: q.slots.filter((s) => s.exerciseId !== x.id) })),
      })),
    })
    setMenu(null)
  }

  const removeRoutine = (r: Routine) => {
    set({ customRoutines: data.customRoutines.filter((x) => x.id !== r.id) })
    setRmenu(null)
  }

  const builtinRoutines = allRoutines.filter((r) => r.builtin)
  const myRoutines = allRoutines.filter((r) => !r.builtin)

  return (
    <div className="fade-up flex h-full flex-col overflow-y-auto hide-scroll px-5"
         style={{ paddingTop: 'max(56px, calc(env(safe-area-inset-top) + 12px))' }}>
      <ScreenHead kicker={t('tabPlaybook')} title={t('routinesAndMoves')} />

      <div className="flex gap-[6px]">
        {(['routines', 'exercises'] as const).map((s) => {
          const on = seg === s
          return (
            <button
              key={s}
              onClick={() => setSeg(s)}
              className="press flex-1 rounded-[11px] border py-[10px] text-[13px] font-semibold"
              style={{
                borderColor: on ? 'var(--buzzer)' : 'var(--line)',
                background: on ? 'var(--buzzer-soft)' : 'transparent',
                color: on ? 'var(--buzzer)' : 'var(--ink-3)',
              }}
            >
              {s === 'routines' ? t('routines') : t('exercises')}{' '}
              <span className="tnum" style={{ color: 'var(--ink-4)' }}>
                {s === 'routines' ? allRoutines.length : allExercises.filter((x) => !x.hidden).length}
              </span>
            </button>
          )
        })}
      </div>

      {seg === 'routines' ? (
        <div className="pb-8">
          <div className="mt-5"><GroupLabel>{t('builtinGroup')}</GroupLabel></div>
          {builtinRoutines.map((r) => (
            <RoutineCard key={r.id} routine={r} onOpen={() => setRmenu(r)} />
          ))}
          <div className="mt-5"><GroupLabel>{t('mineGroup')}</GroupLabel></div>
          {myRoutines.map((r) => (
            <RoutineCard key={r.id} routine={r} onOpen={() => onEditRoutine(r)} onMenu={() => setRmenu(r)} />
          ))}
          <button
            onClick={newRoutine}
            className="press mb-2 flex w-full items-center justify-center rounded-[15px] border border-dashed px-4 py-[14px] text-[14px] font-semibold"
            style={{ borderColor: 'var(--line-2)', color: 'var(--buzzer)' }}
          >
            ＋ {t('newRoutine')}
          </button>
        </div>
      ) : (
        <div className="pb-8">
          <div className="my-[14px] flex flex-wrap gap-[6px]">
            {(['all', ...PARTS] as const).map((p) => {
              const on = part === p
              return (
                <button
                  key={p}
                  onClick={() => setPart(p)}
                  className="press rounded-full border px-[11px] py-[6px] text-[11.5px] font-semibold"
                  style={{
                    borderColor: on ? 'var(--buzzer)' : 'var(--line)',
                    background: on ? 'var(--buzzer-soft)' : 'transparent',
                    color: on ? 'var(--buzzer)' : 'var(--ink-3)',
                  }}
                >
                  {p === 'all' ? t('all') : partLabel[p]}
                </button>
              )
            })}
          </div>

          {visible.map((x) => (
            <button
              key={x.id}
              onClick={() => setMenu(x)}
              className="flex w-full items-center gap-3 border-b py-[13px] text-left"
              style={{ borderColor: 'var(--line)', opacity: x.hidden ? 0.4 : 1 }}
            >
              <span className="w-[22px] shrink-0 text-center"><NoiseMark level={x.noise} /></span>
              <span className="min-w-0 flex-1">
                <span className="text-[14.5px] font-semibold">
                  {exName(x, lang)}
                  {x.hidden && <Badge muted className="ml-2">{t('hidden')}</Badge>}
                  {!x.builtin && <Badge className="ml-2">{t('mine')}</Badge>}
                </span>
                <span className="mt-[3px] block text-[11px]" style={{ color: 'var(--ink-3)' }}>
                  {partLabel[x.part]} · {x.mode === 'time' ? `${x.amount}${t('sec')}` : `${x.amount}${lang === 'ko' ? t('reps') : ' ' + t('reps')}`}
                </span>
              </span>
              <span className="shrink-0 text-[15px]" style={{ color: 'var(--ink-4)' }}>⋯</span>
            </button>
          ))}

          <button
            onClick={onAddExercise}
            className="press mt-[14px] flex w-full items-center justify-center rounded-[15px] border border-dashed px-4 py-[14px] text-[14px] font-semibold"
            style={{ borderColor: 'var(--line-2)', color: 'var(--buzzer)' }}
          >
            ＋ {t('addExercise')}
          </button>
        </div>
      )}

      {/* 운동 메뉴 */}
      <Sheet open={!!menu} onClose={() => setMenu(null)}>
        {menu && (
          <>
            <h3 className="text-[20px] font-bold tracking-[-0.02em]">{exName(menu, lang)}</h3>
            <p className="mt-2 text-[13px] leading-[1.65]" style={{ color: 'var(--ink-2)' }}>
              {lang === 'ko' ? menu.cueKo : menu.cueEn}
            </p>
            <div className="mt-5 flex flex-col gap-2">
              {!menu.builtin && <Cta ghost onClick={() => { setMenu(null); onEditExercise(menu) }}>{t('edit')}</Cta>}
              {menu.builtin ? (
                <Cta ghost onClick={() => toggleHide(menu)}>{menu.hidden ? t('unhide') : t('hide')}</Cta>
              ) : (
                <Cta ghost danger onClick={() => removeExercise(menu)}>{t('del')}</Cta>
              )}
              <Cta ghost onClick={() => setMenu(null)}>{t('cancel')}</Cta>
            </div>
          </>
        )}
      </Sheet>

      {/* 루틴 메뉴 — 기본 루틴은 지우는 대신 복제해서 고친다 */}
      <Sheet open={!!rmenu} onClose={() => setRmenu(null)}>
        {rmenu && (
          <>
            <h3 className="text-[20px] font-bold tracking-[-0.02em]">{rtName(rmenu, lang)}</h3>
            <p className="mt-2 text-[13px]" style={{ color: 'var(--ink-2)' }}>
              <Summary routine={rmenu} />
            </p>
            <div className="mt-5 flex flex-col gap-2">
              {!rmenu.builtin && <Cta ghost onClick={() => { setRmenu(null); onEditRoutine(rmenu) }}>{t('edit')}</Cta>}
              <Cta ghost onClick={() => duplicate(rmenu)}>{t('duplicate')}</Cta>
              {!rmenu.builtin && <Cta ghost danger onClick={() => removeRoutine(rmenu)}>{t('del')}</Cta>}
              <Cta ghost onClick={() => setRmenu(null)}>{t('cancel')}</Cta>
            </div>
          </>
        )}
      </Sheet>

      {/* 조용 모드일 때 빠진 동작이 있다는 안내 */}
      {quietNow && seg === 'exercises' && (
        <div className="mb-6 rounded-[12px] px-[14px] py-3 text-[12px] leading-[1.6]"
             style={{ background: 'var(--buzzer-soft)', color: 'var(--buzzer)' }}>
          {t('noiseQuietNote')}
        </div>
      )}
    </div>
  )
}

function Summary({ routine }: { routine: Routine }) {
  const { t, lang, data, exerciseById } = useStore()
  const steps = buildSteps(routine, exerciseById, data.settings.restSeconds, false)
  const min = Math.max(1, Math.round(totalSeconds(steps) / 60))
  const moves = new Set(steps.filter((s) => s.kind === 'work').map((s) => s.exercise.id)).size
  return (
    <span className="tnum">
      {min}
      {lang === 'ko' ? t('min') : ' ' + t('min')} · {moves}
      {lang === 'ko' ? t('moves') : ' ' + t('moves')} · {routine.quarters.length}
      {lang === 'ko' ? ' 구간' : ' blocks'}
    </span>
  )
}

function RoutineCard({
  routine,
  onOpen,
  onMenu,
}: {
  routine: Routine
  onOpen: () => void
  onMenu?: () => void
}) {
  const { t, lang } = useStore()
  return (
    <div className="mb-2 flex items-center gap-3 rounded-[15px] border px-4 py-[14px]"
         style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}>
      <button onClick={onOpen} className="min-w-0 flex-1 text-left">
        <span className="flex items-center gap-[7px] text-[15px] font-semibold">
          {rtName(routine, lang)}
          {routine.builtin && <Badge muted>{t('builtin')}</Badge>}
        </span>
        <span className="mt-1 block text-[11.5px]" style={{ color: 'var(--ink-3)' }}>
          <Summary routine={routine} />
        </span>
      </button>
      <button onClick={onMenu ?? onOpen} className="press shrink-0 text-[17px]" style={{ color: 'var(--ink-4)' }}>
        ›
      </button>
    </div>
  )
}
