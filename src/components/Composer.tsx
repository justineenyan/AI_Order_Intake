import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ACCEPTED_TYPES, formatBytes, isImage } from '../lib/files'
import { CloseIcon, FileIcon, PaperclipIcon, SendIcon } from './icons'

interface Props {
  files: File[]
  onAddFiles: (files: File[]) => void
  onRemoveFile: (index: number) => void
  onSend: (text: string) => void
  busy: boolean
  notice: string | null
}

export default function Composer({ files, onAddFiles, onRemoveFile, onSend, busy, notice }: Props) {
  const [text, setText] = useState('')
  const area = useRef<HTMLTextAreaElement>(null)
  const picker = useRef<HTMLInputElement>(null)

  const previews = useMemo(
    () => files.map((f) => ({ file: f, url: isImage(f.type) ? URL.createObjectURL(f) : null })),
    [files],
  )
  useEffect(() => () => previews.forEach((p) => p.url && URL.revokeObjectURL(p.url)), [previews])

  // grow with content, up to the max-height in css
  useLayoutEffect(() => {
    const el = area.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [text])

  // put the cursor back in the box when a card attaches something
  useEffect(() => {
    if (files.length) area.current?.focus()
  }, [files.length])

  const canSend = !busy && (text.trim().length > 0 || files.length > 0)

  const submit = () => {
    if (!canSend) return
    onSend(text)
    setText('')
  }

  return (
    <div className="composer-wrap">
      {notice && <div className="composer__notice">{notice}</div>}

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        {previews.length > 0 && (
          <div className="composer__files">
            {previews.map((p, i) => (
              <div key={`${p.file.name}-${i}`} className="attachment">
                {p.url ? (
                  <img src={p.url} alt="" />
                ) : (
                  <span className="attachment__icon">
                    <FileIcon size={20} />
                  </span>
                )}
                <div className="attachment__meta">
                  <span className="attachment__name">{p.file.name}</span>
                  <span className="attachment__size">{formatBytes(p.file.size)}</span>
                </div>
                <button
                  type="button"
                  className="attachment__remove"
                  onClick={() => onRemoveFile(i)}
                  aria-label={`Remove ${p.file.name}`}
                >
                  <CloseIcon size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="composer__row">
          <button
            type="button"
            id="attach-button"
            className="icon-btn"
            onClick={() => picker.current?.click()}
            title="Attach image or PDF"
            aria-label="Attach file"
          >
            <PaperclipIcon />
          </button>
          <input
            ref={picker}
            type="file"
            hidden
            multiple
            accept={ACCEPTED_TYPES.join(',')}
            onChange={(e) => {
              if (e.target.files) onAddFiles(Array.from(e.target.files))
              e.target.value = ''
            }}
          />

          <textarea
            id="chat-input"
            ref={area}
            rows={1}
            value={text}
            placeholder={files.length ? 'Add a note (optional)…' : 'Ask about an order, a delivery or a payment…'}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                submit()
              }
            }}
            onPaste={(e) => {
              const pasted = Array.from(e.clipboardData.files)
              if (pasted.length) {
                e.preventDefault()
                onAddFiles(pasted)
              }
            }}
          />

          <button id="send-button" type="submit" className="send-btn" disabled={!canSend} aria-label="Send">
            <SendIcon size={20} />
          </button>
        </div>
      </form>
      <p className="composer__hint">Enter to send, Shift + Enter for a new line. You can paste or drop a receipt.</p>
    </div>
  )
}
