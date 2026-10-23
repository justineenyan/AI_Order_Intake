import { formatValue, humanize, pickArray } from '../../lib/format'

export default function DataTable({ data }: { data: unknown }) {
  const rows = pickArray(data, ['rows', 'items', 'data', 'records', 'orders'])
  if (!rows.length) return null

  // union of keys, in first-seen order, so sparse rows don't drop columns
  const columns = [...new Set(rows.flatMap((r) => Object.keys(r)))]

  return (
    <div className="card card--flush">
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c}>{humanize(c)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {columns.map((c) => (
                  <td key={c}>
                    {c.toLowerCase() === 'status' ? <Status value={r[c]} /> : formatValue(r[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-foot">
        {rows.length} {rows.length === 1 ? 'row' : 'rows'}
      </div>
    </div>
  )
}

function Status({ value }: { value: unknown }) {
  const text = formatValue(value)
  const tone = /deliver|complete|paid|success/i.test(text)
    ? 'ok'
    : /cancel|fail|reject/i.test(text)
      ? 'bad'
      : 'pending'
  return <span className={`tag tag--${tone}`}>{text}</span>
}
