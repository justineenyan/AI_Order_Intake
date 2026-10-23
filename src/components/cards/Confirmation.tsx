import { formatMoney, formatValue, humanize, isRecord } from '../../lib/format'
import { CheckIcon } from '../icons'

const SKIP = ['title', 'amount', 'currency', 'message']

export default function Confirmation({ data }: { data: unknown }) {
  const info = isRecord(data) ? data : {}
  const title = typeof info.title === 'string' ? info.title : 'All done'
  const rest = Object.entries(info).filter(([k, v]) => !SKIP.includes(k) && v != null)

  return (
    <div className="card confirm">
      <div className="confirm__icon">
        <CheckIcon size={30} strokeWidth={2.4} />
      </div>
      <div className="confirm__title">{title}</div>
      {info.amount != null && <div className="confirm__amount">{formatMoney(info.amount, info.currency)}</div>}
      {rest.length > 0 && (
        <dl className="kv kv--center">
          {rest.map(([k, v]) => (
            <div key={k} className="kv__row">
              <dt>{humanize(k)}</dt>
              <dd>{formatValue(v)}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
