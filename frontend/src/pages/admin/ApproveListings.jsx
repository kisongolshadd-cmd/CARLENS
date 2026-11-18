import { useEffect, useState } from 'react'
import { api } from '../../api.js'
import CarPhoto from '../../components/CarPhoto.jsx'
import Loader from '../../components/Loader.jsx'
import Notice from '../../components/Notice.jsx'
import { formatPrice } from '../../utils.js'

export default function ApproveListings() {
  const [cars, setCars] = useState(null)
  const [error, setError] = useState('')

  function load() {
    api('/admin/listings').then((d) => setCars(d.items)).catch((e) => setError(e.message))
  }
  useEffect(load, [])

  async function approve(car) {
    try { await api(`/admin/listings/${car.id}/approve`, { method: 'POST' }); load() } catch (e) { setError(e.message) }
  }

  async function reject(car) {
    const reason = window.prompt('Why is this listing rejected?', 'Please check the details and try again')
    if (reason === null) return
    try { await api(`/admin/listings/${car.id}/reject`, { method: 'POST', body: { reason } }); load() } catch (e) { setError(e.message) }
  }

  if (!cars && !error) return <Loader />

  return (
    <div className="page container">
      <h1 className="page-title">Approve listings</h1>
      <p className="page-sub">Cars that sellers want to sell.</p>
      <Notice kind="error">{error}</Notice>
      <div className="mini-list">
        {cars && cars.length === 0 && <div className="empty">Nothing waiting. Great job!</div>}
        {cars && cars.map((car) => (
          <div className="mini-car" key={car.id}>
            <div className="thumb"><CarPhoto car={car} /></div>
            <div className="info"><b>{car.year} {car.make} {car.model}</b> · {formatPrice(car.price)}<br />
              <span className="muted">By {car.owner?.name} · {car.location}</span>
              <p className="muted" style={{ margin: 0 }}>{car.description}</p></div>
            <div className="row-actions">
              <button className="btn success small" onClick={() => approve(car)}>Approve</button>
              <button className="btn outline danger-text small" onClick={() => reject(car)}>Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
