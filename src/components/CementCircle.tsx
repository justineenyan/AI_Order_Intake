import plant from '../assets/01_loading_point_plant.jpg'
import ordering from '../assets/02_ordering_of_cement.jpg'
import payment from '../assets/03_payment_of_cement.jpg'
import truck from '../assets/04_truck_containing_cement.jpg'
import bot from '../assets/05_ai_agent_bot.jpg'
import './CementCircle.css'

// Same placement as the Smart Cement Circle artwork, clockwise from the top.
const STEPS = [
  { src: plant, step: 1, label: 'Loading point / plant', pos: 'top' },
  { src: ordering, step: 2, label: 'Ordering of cement', pos: 'right' },
  { src: truck, step: 4, label: 'Truck delivering cement', pos: 'bottom' },
  { src: payment, step: 3, label: 'Payment of cement', pos: 'left' },
]

export default function CementCircle() {
  return (
    <div className="cement-circle" role="img" aria-label="Order journey: plant, ordering, payment and delivery, with the assistant in the middle">
      <div className="cement-circle__orbit">
        {STEPS.map((s) => (
          <div key={s.step} className={`cement-circle__node cement-circle__node--${s.pos}`}>
            <div className="cement-circle__upright">
              <div className={`cement-circle__photo cement-circle__photo--${s.pos}`}>
                <img src={s.src} alt="" draggable={false} />
              </div>
              <span className="cement-circle__badge" title={s.label}>
                {s.step}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="cement-circle__center">
        <div className="cement-circle__halo" />
        <div className="cement-circle__bot">
          <img src={bot} alt="" draggable={false} />
        </div>
      </div>
    </div>
  )
}
