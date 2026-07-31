import { useEffect, useRef, useState } from 'react'
import { useStore } from '@/lib/store'
import { Badge, Cta, Fold, NoiseMark, ScreenHead, SBox, SItem, Sheet, Stamp } from '@/components/bits'
import { fmtWindow } from '@/lib/time'
import { STEP } from '@/lib/weights'
import type { LoadGroup } from '@/lib/types'

type Page = 'root' | 'about' | 'howto' | 'remind' | 'install' | 'safety' | 'weights' | 'licenses'

export function Settings({ resetSignal = 0 }: { resetSignal?: number }) {
  const [page, setPage] = useState<Page>('root')
  // 탭바의 '설정'을 다시 누르면 하위 화면에서 빠져나온다
  useEffect(() => {
    setPage('root')
  }, [resetSignal])
  if (page === 'root') return <Root onGo={setPage} />
  return <Sub page={page} onBack={() => setPage('root')} />
}

function Root({ onGo }: { onGo: (p: Page) => void }) {
  const { t, data, setSettings, set, exportBackup, importBackup, resetAll } = useStore()
  const { settings } = data
  const [confirmReset, setConfirmReset] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [editWindow, setEditWindow] = useState<'morning' | 'night' | null>(null)
  /**
   * 한 번에 하나만 펼친다. 다 펼쳐두면 접은 의미가 없다.
   * 처음에는 전부 접힌 채로 연다. 어느 하나를 열어두면 그 그룹만 특별해 보이고,
   * 목록 전체를 훑기도 어려워진다.
   */
  const [open, setOpen] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const wakeSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator
  const cycle = <T,>(cur: T, list: T[]) => list[(list.indexOf(cur) + 1) % list.length]
  const themeLabel = { light: t('themeLight'), system: t('themeSystem'), dark: t('themeDark') }[settings.theme]

  return (
    <div className="fade-up flex h-full flex-col overflow-y-auto hide-scroll px-5"
         style={{ paddingTop: 'max(56px, calc(env(safe-area-inset-top) + 12px))' }}>
      <ScreenHead kicker={t('settings')} title={t('appName')} />

      <Fold label={t('grpScreen')} open={open === 'grpScreen'} onToggle={() => setOpen(open === 'grpScreen' ? null : 'grpScreen')}>
        <SBox>
          <SItem label={t('theme')} value={themeLabel}
                 onClick={() => setSettings({ theme: cycle(settings.theme, ['dark', 'light', 'system'] as const) })} />
          {/* 영어에서는 부제가 제목과 같은 말이라 빼둔다 */}
          <SItem label={t('language')} sub={settings.lang === 'ko' ? 'Language' : undefined}
                 value={settings.lang === 'ko' ? '한국어' : 'English'}
                 onClick={() => setSettings({ lang: settings.lang === 'ko' ? 'en' : 'ko' })} />
          <SItem label={t('bigType')} sub={t('bigTypeSub')} toggle={settings.bigType}
                 onToggle={(v) => setSettings({ bigType: v })} last />
        </SBox>
      </Fold>

      <Fold label={t('grpSound')} open={open === 'grpSound'} onToggle={() => setOpen(open === 'grpSound' ? null : 'grpSound')}>
        <SBox>
          <SItem label={t('soundOn')} sub={t('soundSub')} toggle={settings.sound}
                 onToggle={(v) => setSettings({ sound: v })} />
          <SItem label={t('countdown')} toggle={settings.countdown} onToggle={(v) => setSettings({ countdown: v })} />
          <SItem label={t('quarterBuzzer')} toggle={settings.quarterBuzzer}
                 onToggle={(v) => setSettings({ quarterBuzzer: v })} last />
        </SBox>
      </Fold>

      <Fold label={t('grpQuiet')} open={open === 'grpQuiet'} onToggle={() => setOpen(open === 'grpQuiet' ? null : 'grpQuiet')}>
        <SBox>
          <SItem label={t('quietAuto')} sub={t('quietSub')} toggle={settings.quietAuto}
                 onToggle={(v) => setSettings({ quietAuto: v })} />
          <SItem label={t('morning')} value={fmtWindow(settings.quietMorning.from, settings.quietMorning.to)}
                 onClick={() => setEditWindow('morning')} />
          <SItem label={t('night')} value={fmtWindow(settings.quietNight.from, settings.quietNight.to)}
                 onClick={() => setEditWindow('night')} last />
        </SBox>
      </Fold>

      <Fold label={t('grpWorkout')} open={open === 'grpWorkout'} onToggle={() => setOpen(open === 'grpWorkout' ? null : 'grpWorkout')}>
        <SBox>
          <SItem
            label={t('defaultSize')}
            value={{ timeout: t('sizeTimeout'), standard: t('sizeStandard'), full: t('sizeFull') }[settings.defaultSize]}
            onClick={() => setSettings({ defaultSize: cycle(settings.defaultSize, ['timeout', 'standard', 'full'] as const) })}
          />
          <SItem label={t('restSeconds')} sub={t('restSecondsSub')} value={`${settings.restSeconds}${t('sec')}`}
                 onClick={() => setSettings({ restSeconds: cycle(settings.restSeconds, [15, 20, 30, 45]) })} />
          <SItem label={t('weeklyGoal')} value={t('timesPerWeek').replace('%n', String(settings.weeklyGoal))}
                 onClick={() => setSettings({ weeklyGoal: cycle(settings.weeklyGoal, [3, 4, 5, 6, 7]) })} />
          <SItem label={t('weekStart')} sub={t('weekStartSub')}
                 value={settings.weekStart === 1 ? t('monday') : t('sunday')}
                 onClick={() => setSettings({ weekStart: settings.weekStart === 1 ? 0 : 1 })} />
          {/* 지원 여부를 숨기지 않는다 — 안 되는 기기에서 켜두면 되는 줄 안다 */}
          <SItem
            label={t('keepAwake')}
            sub={`${t('keepAwakeSub')} · ${wakeSupported ? t('keepAwakeSupported') : t('keepAwakeUnsupported')}`}
            toggle={settings.keepAwake && wakeSupported}
            onToggle={(v) => setSettings({ keepAwake: v })}
          />
          <SItem label={t('dumbbellWeights')} sub={t('dumbbellSub')}
                 value={`${data.weights.arm} · ${data.weights.torso} · ${data.weights.leg}kg`}
                 onClick={() => onGo('weights')} last />
        </SBox>
      </Fold>

      <Fold label={t('grpData')} open={open === 'grpData'} onToggle={() => setOpen(open === 'grpData' ? null : 'grpData')}>
        <SBox>
          <SItem label={t('exportBackup')} sub={t('exportSub')} onClick={exportBackup} />
          <SItem label={t('importBackup')} onClick={() => fileRef.current?.click()} />
          <SItem label={t('restoreBuiltins')} sub={t('restoreSub')} onClick={() => set({ hiddenIds: [] })} />
          <SItem label={t('resetAll')} sub={t('resetSub')} danger onClick={() => setConfirmReset(true)} last />
        </SBox>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0]
            if (!f) return
            const ok = await importBackup(f)
            setToast(ok ? t('imported') : t('importFailed'))
            setTimeout(() => setToast(null), 2400)
            e.target.value = ''
          }}
        />
      </Fold>

      <Fold label={t('grpGuide')} open={open === 'grpGuide'} onToggle={() => setOpen(open === 'grpGuide' ? null : 'grpGuide')}>
        <SBox>
          <SItem label={t('howToInstall')} sub={t('howToInstallSub')} onClick={() => onGo('install')} />
          <SItem label={t('howToRemind')} sub={t('howToRemindSub')} onClick={() => onGo('remind')} />
          <SItem label={t('howToUse')} sub={t('howToUseSub')} onClick={() => onGo('howto')} />
          <SItem label={t('aboutApp')} sub={t('aboutSub')} onClick={() => onGo('about')} />
          <SItem label={t('safety')} sub={t('safetySub')} onClick={() => onGo('safety')} />
          <SItem label={t('licenses')} sub="Pretendard · Lucide" onClick={() => onGo('licenses')} />
          <SItem label={t('version')} value={__APP_VERSION__} last />
        </SBox>
      </Fold>

      <div className="pb-10 pt-2"><Stamp absolute={false} /></div>

      {/* 조용 모드 시간대는 값만 보여주고 못 고치던 것을 편집 가능하게 */}
      <Sheet open={!!editWindow} onClose={() => setEditWindow(null)}>
        {editWindow && (
          <>
            <h3 className="mb-4 text-[20px] font-bold tracking-[-0.02em]">
              {editWindow === 'morning' ? t('morning') : t('night')}
            </h3>
            {(['from', 'to'] as const).map((k) => {
              const w = editWindow === 'morning' ? settings.quietMorning : settings.quietNight
              const v = `${String(Math.floor(w[k] / 60)).padStart(2, '0')}:${String(w[k] % 60).padStart(2, '0')}`
              return (
                <div key={k} className="mb-3 flex items-center justify-between">
                  <span className="text-[14px] font-medium">{k === 'from' ? t('quietFrom') : t('quietTo')}</span>
                  <input
                    type="time"
                    value={v}
                    onChange={(e) => {
                      const [h, m] = e.target.value.split(':').map(Number)
                      if (Number.isNaN(h)) return
                      const next = { ...w, [k]: h * 60 + m }
                      setSettings(editWindow === 'morning' ? { quietMorning: next } : { quietNight: next })
                    }}
                    className="rounded-[11px] border px-3 py-2 text-[15px]"
                    style={{ background: 'var(--raised)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                  />
                </div>
              )
            })}
            <div className="mt-4"><Cta onClick={() => setEditWindow(null)}>{t('save')}</Cta></div>
          </>
        )}
      </Sheet>

      <Sheet open={confirmReset} onClose={() => setConfirmReset(false)}>
        <h3 className="text-[20px] font-bold tracking-[-0.02em]" style={{ color: 'var(--buzzer-hot)' }}>
          {t('confirmReset')}
        </h3>
        <p className="mt-2 text-[13px] leading-[1.65]" style={{ color: 'var(--ink-2)' }}>{t('confirmResetBody')}</p>
        <div className="mt-5 flex flex-col gap-2">
          <Cta ghost danger onClick={() => { resetAll(); setConfirmReset(false) }}>{t('eraseIt')}</Cta>
          <Cta ghost onClick={() => setConfirmReset(false)}>{t('cancel')}</Cta>
        </div>
      </Sheet>

      {toast && (
        <div className="fixed inset-x-6 bottom-28 z-50 rounded-[12px] px-4 py-3 text-center text-[13px] font-semibold"
             style={{ background: 'var(--raised)', color: 'var(--ink)', boxShadow: 'var(--lift)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}

/* ── 하위 안내 화면 ─────────────────────────────── */
function Sub({ page, onBack }: { page: Page; onBack: () => void }) {
  const { t } = useStore()
  const title = {
    about: t('aboutApp'), howto: t('howToUse'), remind: t('howToRemind'),
    install: t('howToInstall'), safety: t('safety'), weights: t('dumbbellWeights'),
    licenses: t('licenses'), root: '',
  }[page]

  return (
    <div className="fade-up flex h-full flex-col overflow-y-auto hide-scroll px-5"
         style={{ paddingTop: 'max(56px, calc(env(safe-area-inset-top) + 12px))' }}>
      <ScreenHead kicker={t('grpGuide')} title={title} onBack={onBack} />
      <div className="pb-10">
        {page === 'about' && <About />}
        {page === 'howto' && <About />}
        {page === 'install' && <Install />}
        {page === 'remind' && <Remind />}
        {page === 'safety' && <Safety />}
        {page === 'weights' && <WeightsPage />}
        {page === 'licenses' && <Licenses />}
      </div>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b py-[14px] text-[12.5px] leading-[1.72] last:border-b-0"
         style={{ borderColor: 'var(--line)', color: 'var(--ink-2)' }}>
      <b className="mb-[6px] block text-[14px] font-semibold" style={{ color: 'var(--ink)' }}>{title}</b>
      {children}
    </div>
  )
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <span className="mt-[7px] block border-l-2 pl-[11px] text-[12px]"
          style={{ borderColor: 'var(--line-2)', color: 'var(--ink-3)' }}>
      {children}
    </span>
  )
}

function About() {
  const { t } = useStore()
  return (
    <>
      <Block title={t('whatIsIt')}>{t('whatIsItBody')}</Block>
      <Block title={t('homeAndAway')}>{t('homeAndAwayBody')}</Block>
      <Block title={t('quartersTitle')}>
        {t('quartersBody')}
        <Li>{t('sizeTimeout')} · 5{t('min')} · 1Q</Li>
        <Li>{t('sizeStandard')} · 15{t('min')} · 3Q + {t('cooldown')}</Li>
        <Li>{t('sizeFull')} · 30{t('min')} · 4Q + {t('partCardio')}</Li>
      </Block>
      <Block title={t('noiseTitle')}>
        <Li><NoiseMark level={1} /> &nbsp;{t('noise1Desc')}</Li>
        <Li><NoiseMark level={2} /> &nbsp;{t('noise2Desc')}</Li>
        <Li><NoiseMark level={3} /> &nbsp;{t('noise3Desc')}</Li>
        <span className="mt-3 block">{t('noiseQuietNote')}</span>
      </Block>
      <Block title={t('wontDo')}>
        <Li>{t('wont1')}</Li>
        <Li>{t('wont2')}</Li>
      </Block>
    </>
  )
}

export function Install() {
  const { t } = useStore()
  return (
    <>
      <Block title={t('iphone')}>{t('installIos')}</Block>
      <Block title={t('android')}>{t('installAndroid')}</Block>
      <Block title={t('desktop')}>{t('installDesktop')}</Block>
      <div className="mt-4 rounded-[12px] px-[14px] py-3 text-[12px] leading-[1.6]"
           style={{ background: 'var(--buzzer-soft)', color: 'var(--buzzer)' }}>
        {t('installNote')}
      </div>
    </>
  )
}

function Remind() {
  const { t, lang } = useStore()
  return (
    <>
      <Block title={t('howToRemind')}>{t('howToRemindSub')}</Block>
      <Block title={t('iphone')}>
        {lang === 'ko'
          ? '단축어 앱 → 자동화 → 시각 → 매일 원하는 시간 → 앱 열기에서 홈코트를 고릅니다.'
          : 'Shortcuts app, then Automation, Time of Day, pick your hour, and choose Open App with Home Court.'}
      </Block>
      <Block title={t('android')}>
        {lang === 'ko'
          ? '시계 앱의 알람을 원하는 시간에 맞추고 라벨에 홈코트라고 적어둡니다.'
          : 'Set an alarm in the Clock app and label it Home Court.'}
      </Block>
    </>
  )
}

function Safety() {
  const { t } = useStore()
  return <Block title={t('safety')}>{t('safetyBody')}</Block>
}

function Licenses() {
  return (
    <>
      <Block title="Pretendard">SIL Open Font License 1.1 · orioncactus/pretendard</Block>
      <Block title="React · Vite · Tailwind CSS">MIT License</Block>
      <Block title="vite-plugin-pwa">MIT License</Block>
    </>
  )
}

function WeightsPage() {
  const { t, lang, data, set } = useStore()
  const groups: { key: Exclude<LoadGroup, null>; label: string; ex: string }[] = [
    { key: 'arm', label: t('groupArm'), ex: lang === 'ko' ? '숄더 프레스 · 레이즈' : 'Shoulder press, raises' },
    { key: 'torso', label: t('groupTorso'), ex: lang === 'ko' ? '원암 로우 · 플로어 프레스' : 'One-arm row, floor press' },
    { key: 'leg', label: t('groupLeg'), ex: lang === 'ko' ? '고블릿 스쿼트 · RDL' : 'Goblet squat, RDL' },
  ]
  const bump = (k: Exclude<LoadGroup, null>, dir: 1 | -1) => {
    const cap = data.profile.dumbbellMax ?? Infinity
    const next = Math.max(0, Math.min(cap, data.weights[k] + STEP[k] * dir))
    set({ weights: { ...data.weights, [k]: next } })
  }
  return (
    <>
      {groups.map((g) => (
        <div key={g.key} className="flex items-center gap-3 border-b py-[14px]" style={{ borderColor: 'var(--line)' }}>
          <span className="w-[68px] shrink-0 text-[13.5px] font-semibold">{g.label}</span>
          <span className="tnum w-[56px] shrink-0 text-[22px] font-extrabold tracking-[-0.03em]"
                style={{ color: 'var(--buzzer)' }}>
            {data.weights[g.key]}<i className="ml-[1px] text-[11.5px] font-semibold not-italic">kg</i>
          </span>
          <span className="min-w-0 flex-1 text-[11.5px]" style={{ color: 'var(--ink-3)' }}>{g.ex}</span>
          <span className="flex shrink-0 gap-1">
            {([-1, 1] as const).map((d) => (
              <button key={d} onClick={() => bump(g.key, d)}
                      className="press grid h-8 w-8 place-items-center rounded-[9px] border text-[13px]"
                      style={{ borderColor: 'var(--line)', color: 'var(--ink-3)' }}>
                {d === 1 ? '+' : '−'}
              </button>
            ))}
          </span>
        </div>
      ))}
      <Block title={t('howToKnow')}>
        <Li>{t('know1')}</Li>
        <Li>{t('know2')}</Li>
        <Li>{t('know3')}</Li>
      </Block>
      <Block title={t('awkwardTitle')}>
        <Li>{t('awkward1')}</Li>
        <Li>{t('awkward2')}</Li>
        <Li>{t('awkward3')}</Li>
        <Li>{t('awkward4')}</Li>
        <span className="mt-3 block">{t('awkwardNote')}</span>
      </Block>
      <div className="mt-2 rounded-[12px] px-[14px] py-3 text-[12px] leading-[1.6]"
           style={{ background: 'var(--buzzer-soft)', color: 'var(--buzzer)' }}>
        {t('weightAutoNote')}
      </div>
      <div className="mt-4">
        <Badge muted>{t('privacyNote')}</Badge>
      </div>
    </>
  )
}
