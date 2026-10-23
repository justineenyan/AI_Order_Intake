import { useChatActions } from '../../chatActions'
import { formatMoney, pickArray } from '../../lib/format'

export default function ProductSelector({ data, active }: { data: unknown; active: boolean }) {
  const { send, busy } = useChatActions()
  const products = pickArray(data, ['products', 'items', 'rows'])
  if (!products.length) return null

  return (
    <div className="card product-grid">
      {products.map((p, i) => {
        const name = String(p.name ?? p.productName ?? p.title ?? `Product ${i + 1}`)
        return (
          <button
            key={String(p.id ?? name)}
            className="product"
            disabled={!active || busy}
            onClick={() => send(`I'd like ${name}`)}
          >
            <span className="product__name">{name}</span>
            {p.description != null && <span className="product__desc">{String(p.description)}</span>}
            {p.price != null && (
              <span className="product__price">
                {formatMoney(p.price, p.currency ?? 'KES')}
                {p.unit != null && <small> / {String(p.unit)}</small>}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
