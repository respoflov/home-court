import { useState } from 'react'
import { exName, rtName, useStore } from '@/lib/store'
import type { Exercise, Routine, SlotRef } from '@/lib/types'
import { Cta, Field, NoiseMark, ScreenHead, Sheet, TextInput } from '@/components/bits'
import { moved, useReorder } from '@/lib/reorder'
import { Figure } from '@/components/Figure'
import { secondsFor } from '@/lib/session'
import { mmss } from '@/lib/time'

export function RoutineEdit({ routine, onBack }: { routine: Routine; onBack: () => void }) {
  const { t, lang, data, set, allExercises, exerciseById } = useStore()
  const [draft, setDraft] = useState<Routine>(() => structuredClone(routine))
  const [picking, setPicking] = useState<number | null>(null)
  const [renaming, setRenaming] = useState(false)

  const save = () => {
    set({ customRoutines: data.customRoutines.map((r) => (r.id === draft.id ? draft : r)) })
    onBack()
  }

  const patchQuarter = (qi: number, slots: SlotRef[]) =>
    setDraft((d) => ({ ...d, quarters: d.quarters.map((q, i) => (i === qi ? { ...q, slots } : q)) }))

  const addQuarter = () =>
    setDraft((d) => ({
      ...d,
      quarters: [
        ...d.quarters,
        { id: `q${Date.now()}`, labelKo: `${d.quarters.length + 1}Q`, labelEn: `${d.quarters.length + 1}Q`, slots: [] },
      ],
    }))

  const addSlot = (qi: number, x: Exercise) => {
    patchQuarter(qi, [...draft.quarters[qi].slots, { exerciseId: x.id }])
    setPicking(null)
  }

  return (
    <div className="fade-up flex h-full flex-col">
      <div className="flex-1 overflow-y-auto hide-scroll px-5"
           style={{ paddingTop: 'max(56px, calc(env(safe-area-inset-top) + 12px))' }}>
        <ScreenHead
          kicker={t('editRoutine')}
          title={rtName(draft, lang)}
          onBack={onBack}
          right={
            <button onClick={() => setRenaming(true)} className="press text-[12px] font-semibold"
                    style={{ color: 'var(--buzzer)' }}>
              {t('routineName')}
            </button>
          }
        />

        <p className="mb-3 text-[11.5px]" style={{ color: 'var(--ink-4)' }}>
          {t('dragHint')}
        </p>

        {draft.quarters.map((q, qi) => (
          <QuarterBlock
            key={q.id}
            label={lang === 'ko' ? q.labelKo : q.labelEn}
            slots={q.slots}
            onReorder={(from, to) => patchQuarter(qi, moved(q.slots, from, to))}
            onRemove={(i) => patchQuarter(qi, q.slots.filter((_, k) => k !== i))}
            onAdd={() => setPicking(qi)}
            lookup={exerciseById}
          />
        ))}

        <button onClick={addQuarter} className="press mt-4 mb-8 text-[11.5px]" style={{ color: 'var(--ink-4)' }}>
          ＋ {t('addQuarter')}
        </button>
      </div>

      <div className="shrink-0 border-t px-5 pt-3"
           style={{ borderColor: 'var(--line)', paddingBottom: 'max(26px, env(safe-area-inset-bottom))' }}>
        <Cta onClick={save}>{t('save')}</Cta>
      </div>

      <Sheet open={picking !== null} onClose={() => setPicking(null)}>
        <h3 className="mb-3 text-[20px] font-bold tracking-[-0.02em]">{t('pickExercise')}</h3>
        <div className="max-h-[52vh] overflow-y-auto hide-scroll">
          {allExercises
            .filter((x) => !x.hidden)
            .map((x) => (
              <button
                key={x.id}
                onClick={() => picking !== null && addSlot(picking, x)}
                className="flex w-full items-center gap-3 border-b py-3 text-left"
                style={{ borderColor: 'var(--line)' }}
              >
                <Figure id={x.id} size={30} />
                <NoiseMark level={x.noise} />
                <span className="min-w-0 flex-1 text-[14px] font-medium">{exName(x, lang)}</span>
                <span className="tnum shrink-0 text-[12px]" style={{ color: 'var(--ink-3)' }}>
                  {x.mode === 'time' ? `${x.amount}${t('sec')}` : `${x.amount}${lang === 'ko' ? t('reps') : ''}`}
                </span>
              </button>
            ))}
        </div>
      </Sheet>

      <Sheet open={renaming} onClose={() => setRenaming(false)}>
        <h3 className="mb-4 text-[20px] font-bold tracking-[-0.02em]">{t('routineName')}</h3>
        <Field label="한국어">
          <TextInput value={draft.nameKo} onChange={(v) => setDraft((d) => ({ ...d, nameKo: v }))} />
        </Field>
        <Field label="English">
          <TextInput value={draft.nameEn} onChange={(v) => setDraft((d) => ({ ...d, nameEn: v }))} />
        </Field>
        <Cta onClick={() => setRenaming(false)}>{t('save')}</Cta>
      </Sheet>
    </div>
  )
}

function QuarterBlock({
  label,
  slots,
  onReorder,
  onRemove,
  onAdd,
  lookup,
}: {
  label: string
  slots: SlotRef[]
  onReorder: (from: number, to: number) => void
  onRemove: (i: number) => void
  onAdd: () => void
  lookup: (id: string) => Exercise | undefined
}) {
  const { t, lang } = useStore()
  const { dragging, over, rowProps, handleProps } = useReorder(slots.length, onReorder)

  return (
    <div className="mb-1">
      <div className="mt-[18px] mb-1 flex items-center gap-[9px]">
        <b className="text-[11px] font-bold tracking-[0.12em]" style={{ color: 'var(--buzzer)' }}>{label}</b>
        <span className="tnum text-[11px]" style={{ color: 'var(--ink-4)' }}>
          {slots.length}{lang === 'ko' ? '동작' : ' moves'}
        </span>
        <i className="h-px flex-1" style={{ background: 'var(--line)' }} />
      </div>

      {slots.length === 0 && (
        <div className="py-4 text-center text-[12px]" style={{ color: 'var(--ink-4)' }}>{t('emptyQuarter')}</div>
      )}

      {slots.map((s, i) => {
        const x = lookup(s.exerciseId)
        if (!x) return null
        const grabbed = dragging === i
        const isSlot = dragging !== null && over === i && dragging !== i
        const amount = s.amount ?? x.amount
        return (
          <div key={`${s.exerciseId}-${i}`}>
            {isSlot && dragging! > i && (
              <div className="mb-1 h-[44px] rounded-[12px] border border-dashed" style={{ borderColor: 'var(--line-2)' }} />
            )}
            <div
              {...rowProps(i)}
              className="flex items-center gap-[10px] py-[11px] select-none"
              style={
                grabbed
                  ? {
                      background: 'var(--raised)',
                      border: '1px solid var(--buzzer)',
                      borderRadius: 12,
                      padding: '11px 10px',
                      boxShadow: 'var(--lift)',
                      transform: 'scale(1.015)',
                      position: 'relative',
                      zIndex: 2,
                    }
                  : { borderBottom: '1px solid var(--line)' }
              }
            >
              <span {...handleProps(i)} className="shrink-0 cursor-grab px-1 text-[14px]"
                    style={{ color: grabbed ? 'var(--buzzer)' : 'var(--ink-4)' }} aria-hidden>
                ⋮⋮
              </span>
              <Figure id={x.id} size={26} className="shrink-0" />
              <span className="min-w-0 flex-1 truncate text-[14px] font-medium">{exName(x, lang)}</span>
              <span className="tnum shrink-0 text-[12px]" style={{ color: 'var(--ink-3)' }}>
                {x.mode === 'time' ? mmss(secondsFor(x, amount)) : `${amount}${lang === 'ko' ? t('reps') : ''}`}
                {s.sets && s.sets > 1 ? ` ×${s.sets}` : ''}
              </span>
              <button onClick={() => onRemove(i)} className="press shrink-0 px-1 text-[15px]"
                      style={{ color: 'var(--ink-4)' }} aria-label={t('del')}>
                ×
              </button>
            </div>
            {isSlot && dragging! < i && (
              <div className="mt-1 h-[44px] rounded-[12px] border border-dashed" style={{ borderColor: 'var(--line-2)' }} />
            )}
          </div>
        )
      })}

      <button onClick={onAdd}
              className="press mt-[14px] flex w-full items-center justify-center rounded-[15px] border border-dashed py-[14px] text-[14px] font-semibold"
              style={{ borderColor: 'var(--line-2)', color: 'var(--buzzer)' }}>
        ＋ {t('addToQuarter')}
      </button>
    </div>
  )
}
