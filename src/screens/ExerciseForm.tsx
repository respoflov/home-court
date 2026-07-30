import { useState } from 'react'
import { useStore } from '@/lib/store'
import type { Exercise, Gear, Noise, Part } from '@/lib/types'
import { Cta, Field, NoiseMark, Picker, ScreenHead, TextInput } from '@/components/bits'

const GEARS: Gear[] = ['mat', 'dumbbell', 'stepper', 'chair', 'wall', 'towel', 'none']
const GEAR_LABEL: Record<Gear, [string, string]> = {
  mat: ['매트', 'Mat'], dumbbell: ['덤벨', 'Dumbbell'], stepper: ['스텝퍼', 'Stepper'],
  chair: ['의자', 'Chair'], wall: ['벽', 'Wall'], towel: ['수건', 'Towel'], none: ['없음', 'None'],
}

export function ExerciseForm({ editing, onBack }: { editing: Exercise | null; onBack: () => void }) {
  const { t, lang, data, set } = useStore()
  const [name, setName] = useState(editing ? (lang === 'ko' ? editing.nameKo : editing.nameEn) : '')
  const [part, setPart] = useState<Part>(editing?.part ?? 'core')
  const [noise, setNoise] = useState<Noise>(editing?.noise ?? 1)
  const [gear, setGear] = useState<Gear[]>(editing?.gear ?? ['mat'])
  const [mode, setMode] = useState<'time' | 'reps'>(editing?.mode ?? 'time')
  const [amount, setAmount] = useState(String(editing?.amount ?? 30))
  const [cue, setCue] = useState(editing ? (lang === 'ko' ? editing.cueKo : editing.cueEn) : '')

  const valid = name.trim().length > 0 && Number(amount) > 0

  const submit = () => {
    if (!valid) return
    const n = name.trim()
    const c = cue.trim()
    const x: Exercise = {
      id: editing?.id ?? `x${Date.now()}`,
      builtin: false,
      nameKo: n, nameEn: n,
      cueKo: c, cueEn: c,
      part, noise, gear,
      // 사용자 추가 운동은 덤벨을 쓸 때만 무게 그룹을 붙인다
      load: gear.includes('dumbbell') ? (part === 'lower' ? 'leg' : part === 'upper' ? 'torso' : 'torso') : null,
      mode,
      amount: Number(amount),
    }
    set({
      customExercises: editing
        ? data.customExercises.map((e) => (e.id === editing.id ? x : e))
        : [...data.customExercises, x],
    })
    onBack()
  }

  const toggleGear = (g: Gear) =>
    setGear((cur) => (g === 'none' ? ['none'] : cur.includes(g) ? cur.filter((x) => x !== g) : [...cur.filter((x) => x !== 'none'), g]))

  return (
    <div className="fade-up flex h-full flex-col overflow-y-auto hide-scroll px-5"
         style={{ paddingTop: 'max(56px, calc(env(safe-area-inset-top) + 12px))' }}>
      <ScreenHead kicker={t('tabPlaybook')} title={editing ? t('edit') : t('addExercise')} onBack={onBack} />

      <Field label={t('exName')}>
        <TextInput value={name} onChange={setName} placeholder={lang === 'ko' ? '사이드 플랭크' : 'Side Plank'} />
      </Field>

      <Field label={t('exPart')}>
        <div className="grid grid-cols-3 gap-[6px]">
          {(['warmup', 'core', 'lower', 'upper', 'cardio', 'cooldown'] as Part[]).map((p) => {
            const on = part === p
            const label = { warmup: t('partWarmup'), core: t('partCore'), lower: t('partLower'), upper: t('partUpper'), cardio: t('partCardio'), cooldown: t('partCooldown') }[p]
            return (
              <button key={p} onClick={() => setPart(p)}
                      className="press rounded-[10px] border py-[10px] text-[12px] font-semibold"
                      style={{
                        borderColor: on ? 'var(--buzzer)' : 'var(--line)',
                        background: on ? 'var(--buzzer-soft)' : 'transparent',
                        color: on ? 'var(--buzzer)' : 'var(--ink-3)',
                      }}>
                {label}
              </button>
            )
          })}
        </div>
      </Field>

      <Field label={t('exNoiseRequired')}>
        <Picker<'1' | '2' | '3'>
          value={String(noise) as '1' | '2' | '3'}
          onChange={(v) => setNoise(Number(v) as Noise)}
          options={[
            { value: '1', label: <><NoiseMark level={1} /> {t('noiseQuiet')}</> },
            { value: '2', label: <><NoiseMark level={2} /> {t('noiseSoft')}</> },
            { value: '3', label: <><NoiseMark level={3} /> {t('noiseSteps')}</> },
          ]}
        />
      </Field>

      <Field label={t('exGear')}>
        <div className="flex flex-wrap gap-[6px]">
          {GEARS.map((g) => {
            const on = gear.includes(g)
            return (
              <button key={g} onClick={() => toggleGear(g)}
                      className="press rounded-full border px-[11px] py-[7px] text-[11.5px] font-semibold"
                      style={{
                        borderColor: on ? 'var(--buzzer)' : 'var(--line)',
                        background: on ? 'var(--buzzer-soft)' : 'transparent',
                        color: on ? 'var(--buzzer)' : 'var(--ink-3)',
                      }}>
                {GEAR_LABEL[g][lang === 'ko' ? 0 : 1]}
              </button>
            )
          })}
        </div>
      </Field>

      <Field label={t('exAmount')}>
        <div className="flex gap-2">
          <div className="flex-1">
            <Picker<'time' | 'reps'>
              value={mode}
              onChange={setMode}
              options={[{ value: 'time', label: t('byTime') }, { value: 'reps', label: t('byReps') }]}
            />
          </div>
          <div className="w-[110px]">
            <TextInput value={amount} onChange={setAmount} type="number" />
          </div>
        </div>
      </Field>

      <Field label={t('exCue')}>
        <TextInput multiline value={cue} onChange={setCue} placeholder={t('exCuePh')} />
      </Field>

      <div className="pb-8">
        <Cta onClick={submit} disabled={!valid}>{editing ? t('save') : t('addIt')}</Cta>
      </div>
    </div>
  )
}
