import { useChatActions } from '../../chatActions'
import { formatMoney, formatValue, humanize, isRecord } from '../../lib/format'

// Keys we know how to show nicely. Anything else the backend adds still gets listed.
const KNOWN = ['product', 'quantity', 'unit', 'location', 'unitPrice', 'total', 'currency']

export default function OrderSummary({ data, active }: { data: unknown; active: boolean }) {
  const { send, busy } = useChatActions()
  if (!isRecord(data)) return null

  const extra = Object.entries(data).filter(([k]) => !KNOWN.includes(k))
  const currency = data.currency

  return (
    <div className="card">
      <div className="card__head">Order summary</div>
      <dl className="kv">
        {data.product != null && <Row label="Product" value={formatValue(data.product)} />}
        {data.quantity != null && (
          <Row label="Quantity" value={`${formatValue(data.quantity)} ${data.unit ? String(data.unit) : ''}`} />
        )}
        {data.location != null && <Row label="Delivery" value={formatValue(data.location)} />}
        {data.unitPrice != null && <Row label="Unit price" value={formatMoney(data.unitPrice, currency)} />}
        {extra.map(([k, v]) => (
          <Row key={k} label={humanize(k)} value={formatValue(v)} />
        ))}
      </dl>
      {data.total != null && (
        <div className="card__total">
          <span>Total</span>
          <strong>{formatMoney(data.total, currency)}</strong>
        </div>
      )}
      <div className="card__actions">
        <button className="btn btn--primary" disabled={!active || busy} onClick={() => send('Confirm order')}>
          Confirm order
        </button>
        <button className="btn btn--ghost" disabled={!active || busy} onClick={() => send('I want to change the order')}>
          Edit
        </button>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  )
}
