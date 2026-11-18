import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../AuthContext.jsx'
import CarPhoto from '../components/CarPhoto.jsx'
import Loader from '../components/Loader.jsx'
import Notice from '../components/Notice.jsx'
import { formatPrice } from '../utils.js'

export default function CarDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [car, setCar] = useState(null)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState('')
  const [done, setDone] = useState('')
  const [busy, setBusy] = useState(false)
  const [shown, setShown] = useState(0)

  useEffect(() => {
    api('/cars/' + id).then((d) => setCar(d.car)).catch((e) => setError(e.message))
  }, [id])

  async function askForOffers(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api('/requests', { method: 'POST', body: { car_id: car.id, notes } })
      setDone('Request sent! Dealers will now send you their offers.')
      setTimeout(() => navigate('/buyer/offers'), 1200)
    } catch (e) {
      setError(e.message)
    }
    setBusy(false)
  }

  if (error && !car) return <div className="page container"><Notice kind="error">{error}</Notice><Link to="/browse">Back to cars</Link></div>
  if (!car) return <Loader />

  const specs = [
    ['Year', car.year], ['Mileage', car.mileage != null ? Number(car.mileage).toLocaleString() + ' km' : '-'],
    ['Fuel', car.fuel], ['Gearbox', car.transmission],
    ['Body', car.body_type], ['Location', car.location || '-'],
  ]

  return (
    <div className="page container">
      <p><Link to="/browse">&larr; Back to cars</Link></p>
      <div className="detail">
        <div>
          <div className="detail-media">
            <CarPhoto car={{ ...car, image_url: (car.images || [])[shown] || car.image_url }} />
          </div>
          {(car.images || []).length > 1 && (
            <div className="thumbs">
              {car.images.map((link, i) => (
                <button type="button" key={link} className={i === shown ? 'on' : ''} onClick={() => setShown(i)} aria-label={`Photo ${i + 1}`}>
                  <img src={link} alt="" />
                </button>
              ))}
            </div>
          )}
          <div>
          </div>
          <div className="panel" style={{ marginTop: '1.2rem' }}>
            <h2>About this car</h2>
            <p>{car.description || 'No description yet.'}</p>
          </div>
        </div>

        <div className="panel">
          <span className={`badge ${car.kind === 'owner' ? 'blue' : 'violet'}`}>
            {car.kind === 'owner' ? 'Private seller' : 'Dealer stock'}
          </span>
          <h1 style={{ fontSize: '1.6rem', marginTop: '.5rem' }}>{car.year} {car.make} {car.model}</h1>
          <div className="detail-price">{formatPrice(car.price)}</div>

          <div className="spec-grid">
            {specs.map(([label, value]) => (
              <div className="spec" key={label}><small>{label}</small><b>{value}</b></div>
            ))}
          </div>

          {car.owner && car.kind === 'stock' && (
            <p>Sold by <Link to={`/dealers/${car.owner.id}`}><b>{car.owner.business_name}</b></Link></p>
          )}

          <Notice kind="error">{error}</Notice>
          <Notice kind="success">{done}</Notice>

          {!user && (
            <div className="button-row">
              <Link to="/login" state={{ from: `/cars/${car.id}` }} className="btn primary">Log in to ask for offers</Link>
            </div>
          )}
          {user && user.role === 'buyer' && car.kind === 'stock' && !done && (
            <form onSubmit={askForOffers}>
              <div className="field">
                <label htmlFor="notes">Message to dealers (optional)</label>
                <textarea id="notes" rows="3" value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="I can pay cash. I want it this month." />
              </div>
              <button className="btn primary" disabled={busy}>{busy ? 'Sending...' : 'Ask dealers for offers'}</button>
            </form>
          )}
          {user && user.role !== 'buyer' && <p className="muted">Log in as a buyer to ask for offers.</p>}
        </div>
      </div>
    </div>
  )
}
