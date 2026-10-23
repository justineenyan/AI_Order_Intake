import { BrandMark, CodeIcon, MoonIcon, PlusIcon, SunIcon } from './icons'
import type { Theme } from '../hooks/useTheme'

interface Props {
  theme: Theme
  onToggleTheme: () => void
  debug: boolean
  onToggleDebug: () => void
  onNewChat: () => void
  hasMessages: boolean
}

export default function Header({ theme, onToggleTheme, debug, onToggleDebug, onNewChat, hasMessages }: Props) {
  return (
    <header className="header">
      <div className="header__brand">
        <BrandMark />
        <div>
          <div className="header__title">Heidelberg Materials</div>
          <div className="header__subtitle">
            <span className="status-dot" /> Order Assistant
          </div>
        </div>
      </div>

      <div className="header__actions">
        {hasMessages && (
          <button id="new-chat" className="btn btn--ghost" onClick={onNewChat}>
            <PlusIcon size={18} />
            <span className="hide-sm">New chat</span>
          </button>
        )}
        <button
          id="toggle-debug"
          className={`icon-btn${debug ? ' is-active' : ''}`}
          onClick={onToggleDebug}
          aria-pressed={debug}
          title={debug ? 'Hide debug info' : 'Show debug info'}
        >
          <CodeIcon size={18} />
        </button>
        <button
          id="toggle-theme"
          className="icon-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </button>
      </div>
    </header>
  )
}
