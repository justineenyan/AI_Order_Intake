import { useRef, useState } from 'react'
import { useChatActions } from '../../chatActions'
import { ACCEPTED_TYPES } from '../../lib/files'
import { formatMoney, isRecord } from '../../lib/format'
import { UploadIcon } from '../icons'

export default function ReceiptUpload({ data, active }: { data: unknown; active: boolean }) {
  const { addFiles } = useChatActions()
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  const info = isRecord(data) ? data : {}

  const take = (list: FileList | null) => {
    if (list?.length) addFiles(Array.from(list))
  }

  return (
    <div className="card">
      {(info.orderId != null || info.amount != null) && (
        <div className="card__meta">
          {info.orderId != null && <span>Order {String(info.orderId)}</span>}
          {info.amount != null && <span>{formatMoney(info.amount, info.currency)}</span>}
        </div>
      )}
      <button
        type="button"
        className={`dropzone${over ? ' is-over' : ''}`}
        disabled={!active}
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        // the page-level drop handler in App picks up the files
        onDrop={() => setOver(false)}
      >
        <UploadIcon size={26} />
        <strong>Add payment receipt</strong>
        <span>Screenshot, photo or PDF, up to 5 MB</span>
      </button>
      <input
        ref={input}
        type="file"
        hidden
        multiple
        accept={ACCEPTED_TYPES.join(',')}
        onChange={(e) => {
          take(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
