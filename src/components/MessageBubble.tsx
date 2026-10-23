import botAvatar from '../assets/05_ai_agent_bot.jpg'
import { useChatActions } from '../chatActions'
import { isImage } from '../lib/files'
import type { ChatMessage } from '../types/chat'
import ResponseCard from './cards/ResponseCard'
import DebugPanel from './DebugPanel'
import { FileIcon, RetryIcon } from './icons'
import Suggestions from './Suggestions'

interface Props {
  message: ChatMessage
  isLatest: boolean
  showDebug: boolean
  onRetry: (id: string) => void
}

export default function MessageBubble({ message, isLatest, showDebug, onRetry }: Props) {
  const { busy } = useChatActions()
  const isUser = message.role === 'user'
  const res = message.response

  return (
    <div className={`msg msg--${message.role}`}>
      {!isUser && <img className="msg__avatar" src={botAvatar} alt="" />}

      <div className="msg__body">
        {message.attachments && message.attachments.length > 0 && (
          <div className="msg__files">
            {message.attachments.map((a) =>
              isImage(a.mimeType) ? (
                <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="msg__thumb">
                  <img src={a.url} alt={a.name} />
                </a>
              ) : (
                <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="file-pill">
                  <FileIcon size={18} />
                  <span>{a.name}</span>
                </a>
              ),
            )}
          </div>
        )}

        {message.status === 'sending' && (
          <div className="bubble bubble--typing" aria-label="Assistant is typing">
            <span /> <span /> <span />
          </div>
        )}

        {message.status === 'error' && (
          <div className="bubble bubble--error">
            <span>{message.error}</span>
            <button className="btn btn--small" onClick={() => onRetry(message.id)} disabled={busy}>
              <RetryIcon size={15} /> Retry
            </button>
          </div>
        )}

        {message.status === 'done' && message.text && (
          <div className={`bubble${res && !res.success ? ' bubble--warn' : ''}`}>{message.text}</div>
        )}

        {res && (
          <>
            {res.error && res.chat && <div className="msg__note">{res.error}</div>}
            <ResponseCard response={res} active={isLatest} />
            {isLatest && <Suggestions items={res.suggestions ?? []} />}
            {showDebug && <DebugPanel response={res} />}
          </>
        )}
      </div>
    </div>
  )
}
