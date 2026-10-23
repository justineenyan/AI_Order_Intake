import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../types/chat'
import MessageBubble from './MessageBubble'

interface Props {
  messages: ChatMessage[]
  showDebug: boolean
  onRetry: (id: string) => void
}

export default function MessageList({ messages, showDebug, onRetry }: Props) {
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  const lastBotId = [...messages].reverse().find((m) => m.role === 'bot')?.id

  return (
    <div className="messages" role="log" aria-live="polite">
      {messages.map((m) => (
        <MessageBubble
          key={m.id}
          message={m}
          isLatest={m.id === lastBotId}
          showDebug={showDebug}
          onRetry={onRetry}
        />
      ))}
      <div ref={end} />
    </div>
  )
}
