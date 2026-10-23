export const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

// "unitPrice" -> "Unit price", "order_id" -> "Order id"
export function humanize(key: string) {
  const words = key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

export function formatMoney(amount: unknown, currency?: unknown) {
  const n = Number(amount)
  if (!Number.isFinite(n)) return String(amount ?? '')
  const code = typeof currency === 'string' && currency.length === 3 ? currency : undefined
  try {
    return new Intl.NumberFormat(undefined, {
      style: code ? 'currency' : 'decimal',
      currency: code,
      maximumFractionDigits: 2,
    }).format(n)
  } catch {
    return `${code ?? ''} ${n.toLocaleString()}`.trim()
  }
}

export function formatValue(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—'
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  if (typeof v === 'number') return v.toLocaleString()
  if (typeof v === 'string') {
    // ISO dates from the API
    if (/^\d{4}-\d{2}-\d{2}T/.test(v)) {
      const d = new Date(v)
      if (!Number.isNaN(d.getTime())) return d.toLocaleString()
    }
    return v
  }
  return JSON.stringify(v)
}

// Backend may send a bare array or wrap it ({ rows }, { items }, { products } ...)
export function pickArray(data: unknown, keys: string[]): Record<string, unknown>[] {
  if (Array.isArray(data)) return data.filter(isRecord)
  if (isRecord(data)) {
    for (const k of keys) {
      const v = data[k]
      if (Array.isArray(v)) return v.filter(isRecord)
    }
  }
  return []
}
