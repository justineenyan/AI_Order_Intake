import CementCircle from './CementCircle'

const STARTERS = [
  'Order 100 bags of cement',
  'Track my order',
  'Upload payment receipt',
  'Show my recent orders',
]

export default function Welcome({ onPick }: { onPick: (text: string) => void }) {
  return (
    <section className="welcome">
      <CementCircle />
      <h1 className="welcome__title">
        Smart cement ordering, <span>one chat away</span>
      </h1>
      <p className="welcome__lead">
        Tell me what you need. I can place an order, check a payment receipt or tell you where your truck is.
      </p>
      <div className="chips chips--center">
        {STARTERS.map((s, i) => (
          <button key={s} id={`starter-${i}`} className="chip" onClick={() => onPick(s)}>
            {s}
          </button>
        ))}
      </div>
    </section>
  )
}
