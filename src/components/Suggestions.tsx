import { useChatActions } from '../chatActions'

export default function Suggestions({ items, disabled }: { items: string[]; disabled?: boolean }) {
  const { send, busy } = useChatActions()
  if (!items.length) return null

  return (
    <div className="chips">
      {items.map((s) => (
        <button key={s} className="chip" disabled={disabled || busy} onClick={() => send(s)}>
          {s}
        </button>
      ))}
    </div>
  )
}
