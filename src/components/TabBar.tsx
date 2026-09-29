// 화면 아래 5칸 탭 막대
import { useStore } from '@/lib/store'

// 탭 이름 (오늘·원정·플레이북·기록·설정)
export type Tab = 'today' | 'away' | 'playbook' | 'record' | 'settings'

const ICONS: Record<Tab, React.ReactNode> = {
  today: (<><path d="M3 10.5 12 3l9 7.5" /><path d="M5.5 12.5V21h13v-8.5" /></>),
  away: (<><circle cx="6" cy="18.5" r="2" /><circle cx="18" cy="5.5" r="2" /><path d="M8 18.5h6a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h6" /></>),
  playbook: (<><path d="M4 5.5A2 2 0 0 1 6 4h12v16H6a2 2 0 0 1-2-2z" /><path d="M8 8h6M8 12h6" /></>),
  record: (<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>),
  settings: (<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 15a2 2 0 1 1 0-4 1.6 1.6 0 0 0 1.5-2.6l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9 3a2 2 0 1 1 4 0 1.6 1.6 0 0 0 2.6 1.5l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.6 1.6 0 0 0 21 11a2 2 0 1 1 0 4z" /></>),
}

const ORDER: Tab[] = ['today', 'away', 'playbook', 'record', 'settings']

// 현재 탭을 강조하고 누르면 onTab으로 탭을 바꾼다
export function TabBar({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  const { t } = useStore()
  const label: Record<Tab, string> = {
    today: t('tabToday'), away: t('tabAway'), playbook: t('tabPlaybook'),
    record: t('tabRecord'), settings: t('tabSettings'),
  }
  return (
    <nav
      className="flex shrink-0 border-t px-[2px] pt-[9px]"
      style={{
        borderColor: 'var(--line)',
        background: 'var(--void)',
        paddingBottom: 'max(26px, env(safe-area-inset-bottom))',
      }}
    >
      {ORDER.map((k) => {
        const on = k === tab
        return (
          <button
            key={k}
            onClick={() => onTab(k)}
            aria-current={on ? 'page' : undefined}
            className="flex flex-1 flex-col items-center gap-[5px] py-[2px] text-[9.5px]"
            style={{ color: on ? 'var(--buzzer)' : 'var(--ink-4)' }}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {ICONS[k]}
            </svg>
            {label[k]}
          </button>
        )
      })}
    </nav>
  )
}
