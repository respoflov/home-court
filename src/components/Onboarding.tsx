import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Cta, Field, NoiseMark, Picker, TextInput } from './bits'
import { suggestWeights } from '@/lib/weights'
import type { Profile } from '@/lib/types'

/**
 * 첫 실행에서 시작점만 잡는다. 연령은 묻지 않는다 —
 * 운동 경험이 나이보다 예측력이 높고, 질문이 늘수록 건너뛸 확률만 커진다.
 * 정확도는 이 표가 아니라 세트 피드백에 의한 자동 보정이 만든다.
 */
export function Onboarding({ onDone }: { onDone: () => void }) {
  const { t, lang, set } = useStore()
  const [step, setStep] = useState<'ask' | 'result'>('ask')
  const [profile, setProfile] = useState<Profile>({ sex: 'female', experience: 'none', dumbbellMax: null })
  const [maxText, setMaxText] = useState('')

  const p: Profile = { ...profile, dumbbellMax: maxText ? Number(maxText) : null }
  const weights = suggestWeights(p)

  const finish = () => {
    set({ profile: p, weights, onboarded: true })
    onDone()
  }

  if (step === 'result') {
    const rows = [
      { label: t('groupArm'), kg: weights.arm, ex: lang === 'ko' ? '숄더 프레스 · 레이즈' : 'Shoulder press, raises' },
      { label: t('groupTorso'), kg: weights.torso, ex: lang === 'ko' ? '원암 로우 · 플로어 프레스' : 'One-arm row, floor press' },
      { label: t('groupLeg'), kg: weights.leg, ex: lang === 'ko' ? '고블릿 스쿼트 · RDL' : 'Goblet squat, RDL' },
    ]
    return (
      <Shell title={t('startWithThis')}>
        <div className="flex-1 overflow-y-auto hide-scroll">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-3 border-b py-[14px]" style={{ borderColor: 'var(--line)' }}>
              <span className="w-[68px] shrink-0 text-[13.5px] font-semibold">{r.label}</span>
              <span className="tnum w-[56px] shrink-0 text-[22px] font-extrabold tracking-[-0.03em]"
                    style={{ color: 'var(--buzzer)' }}>
                {r.kg}<i className="ml-[1px] text-[11.5px] font-semibold not-italic">kg</i>
              </span>
              <span className="min-w-0 flex-1 text-[11.5px]" style={{ color: 'var(--ink-3)' }}>{r.ex}</span>
            </div>
          ))}

          <div className="pt-5 text-[12.5px] leading-[1.72]" style={{ color: 'var(--ink-2)' }}>
            <b className="mb-[6px] block text-[14px] font-semibold" style={{ color: 'var(--ink)' }}>
              {t('howToKnow')}
            </b>
            {[t('know1'), t('know2'), t('know3')].map((s) => (
              <span key={s} className="mt-[7px] block border-l-2 pl-[11px] text-[12px]"
                    style={{ borderColor: 'var(--line-2)', color: 'var(--ink-3)' }}>
                {s}
              </span>
            ))}
          </div>
          <div className="mt-4 rounded-[12px] px-[14px] py-3 text-[12px] leading-[1.6]"
               style={{ background: 'var(--buzzer-soft)', color: 'var(--buzzer)' }}>
            {t('weightAutoNote')}
          </div>
        </div>
        <Cta onClick={finish}>{t('letsStart')}</Cta>
      </Shell>
    )
  }

  return (
    <Shell title={t('setWeights')}>
      <div className="flex-1 overflow-y-auto hide-scroll">
        <p className="mb-5 text-[12.5px] leading-[1.7]" style={{ color: 'var(--ink-3)' }}>
          {t('setWeightsIntro')}
        </p>

        <Field label={t('sex')}>
          <Picker<'female' | 'male' | 'unset'>
            value={(profile.sex ?? 'unset') as 'female' | 'male' | 'unset'}
            onChange={(v) => setProfile((s) => ({ ...s, sex: v }))}
            options={[
              { value: 'female', label: t('sexFemale') },
              { value: 'male', label: t('sexMale') },
              { value: 'unset', label: t('sexUnset') },
            ]}
          />
        </Field>

        <Field label={t('experience')}>
          <Picker<'none' | 'some' | 'used'>
            value={profile.experience ?? 'none'}
            onChange={(v) => setProfile((s) => ({ ...s, experience: v }))}
            options={[
              { value: 'none', label: t('expNone') },
              { value: 'some', label: t('expSome') },
              { value: 'used', label: t('expUsed') },
            ]}
          />
        </Field>

        <Field label={t('ownedDumbbell')}>
          <TextInput value={maxText} onChange={setMaxText} type="number" placeholder="12" suffix="kg" />
        </Field>

        <div className="rounded-[12px] px-[14px] py-3 text-[11.5px] leading-[1.6]"
             style={{ background: 'var(--buzzer-soft)', color: 'var(--buzzer)' }}>
          {t('privacyNote')}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={finish} className="press shrink-0 rounded-[14px] border px-5 text-[15px] font-bold"
                style={{ borderColor: 'var(--line-2)', color: 'var(--ink-2)' }}>
          {t('skip')}
        </button>
        <Cta onClick={() => setStep('result')}>{t('next')}</Cta>
      </div>
    </Shell>
  )
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  const { t } = useStore()
  return (
    <div className="fade-up flex h-full flex-col px-5"
         style={{
           paddingTop: 'max(56px, calc(env(safe-area-inset-top) + 12px))',
           paddingBottom: 'max(26px, env(safe-area-inset-bottom))',
         }}>
      <div className="mb-5">
        <div className="text-[13px]" style={{ color: 'var(--ink-3)' }}>{t('beforeStart')}</div>
        <div className="mt-[3px] text-[20px] font-bold tracking-[-0.02em]">{title}</div>
      </div>
      {children}
    </div>
  )
}

/**
 * 최초 1회 안내. 홈 화면에서 열었더라도 뜬다.
 *
 * 예전에는 홈 화면에 추가하는 법만 담고 있어서, 이미 추가한 사람에게는
 * 한 번도 뜨지 않았다. 그런데 처음 쓰는 사람에게 필요한 것은 설치법만이 아니라
 * 이 앱이 무엇이고 어디에 무엇이 있는지다. 그래서 공통 안내를 먼저 두고,
 * 홈 화면 추가 방법은 아직 브라우저에서 보고 있을 때만 덧붙인다.
 */
export function WelcomeSheetBody({ standalone, onClose }: { standalone: boolean; onClose: () => void }) {
  const { t } = useStore()
  const uses: [string, string][] = [
    [t('tabToday'), t('welcomeToday')],
    [t('tabPlaybook'), t('welcomePlaybook')],
    [t('tabRecord'), t('welcomeRecord')],
  ]
  const installs: [string, string][] = [
    [t('iphone'), t('installIos')],
    [t('android'), t('installAndroid')],
  ]
  return (
    <>
      <h3 className="text-[20px] font-bold tracking-[-0.02em]">{t('welcomeTitle')}</h3>
      <p className="mt-2 text-[13px] leading-[1.65]" style={{ color: 'var(--ink-2)' }}>{t('welcomeBody')}</p>

      <div className="mt-[18px] max-h-[46vh] overflow-y-auto hide-scroll">
        {uses.map(([tab, tx]) => (
          <div key={tab} className="flex items-start gap-[11px] border-b py-[11px] first:border-t"
               style={{ borderColor: 'var(--line)' }}>
            <span className="mt-[1px] w-[62px] shrink-0 text-[12px] font-bold" style={{ color: 'var(--buzzer)' }}>{tab}</span>
            <span className="text-[12.5px] leading-[1.55]" style={{ color: 'var(--ink-2)' }}>{tx}</span>
          </div>
        ))}

        {!standalone && (
          <div className="mt-[18px]">
            <div className="text-[13px] font-semibold">{t('installTitle')}</div>
            <p className="mt-[5px] text-[12.5px] leading-[1.6]" style={{ color: 'var(--ink-3)' }}>{t('installBody')}</p>
            <div className="mt-[11px] flex flex-col gap-[9px]">
              {installs.map(([pf, tx]) => (
                <div key={pf} className="flex items-start gap-[11px]">
                  <span className="mt-[2px] w-[62px] shrink-0 text-[11px] font-bold" style={{ color: 'var(--ink-3)' }}>{pf}</span>
                  <span className="text-[12.5px] leading-[1.55]" style={{ color: 'var(--ink-2)' }}>{tx}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-[12px] px-[14px] py-3 text-[12.5px] leading-[1.6]"
           style={{ background: 'var(--buzzer-soft)', color: 'var(--buzzer)' }}>
        {t('welcomeMore')}
      </div>
      <div className="mt-5">
        <Cta onClick={onClose}>{t('gotIt')}</Cta>
      </div>
    </>
  )
}

export { NoiseMark }
