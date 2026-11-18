import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api.js'
import CarPhoto from '../../components/CarPhoto.jsx'
import Loader from '../../components/Loader.jsx'
import Notice from '../../components/Notice.jsx'
import OfferCard from '../../components/OfferCard.jsx'
import { formatPrice, statusClass, STATUS_TEXT } from '../../utils.js'

export default function MyListings() {
  const [cars, setCars] = useState(null)
  const [offers, setOffers] = useState({})
  const [open, setOpen] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function load() {
    api('/my-cars').then((d) => setCars(d.items)).catch((e) => setError(e.message))
  }
  useEffect(load, [])

  async function showOffers(car) {
    if (open === car.id) return setOpen(null)
    try {
      const d = await api(`/seller/cars/${car.id}/offers`)
      setOffers({ ...offers, [car.id]: d.items })
      setOpen(car.id)
    } catch (e) { setError(e.message) }
  }

  async function act(car, url) {
    setBusy(true)
    setError('')
    try {
      await api(url, { method: 'POST' })
      const d = await api(`/seller/cars/${car.id}/offers`)
      setOffers({ ...offers, [car.id]: d.items })
      load()
    } catch (e) { setError(e.message) }
    setBusy(false)
  }

  async function remove(car) {
    if (!window.confirm('Delete this listing?')) return
    try { await api('/cars/' + car.id, { method: 'DELETE' }); load() } catch (e) { setError(e.message) }
  }

  if (!cars && !error) return <Loader />

  return (
    <div className="page container">
      <div className="section-head">
        <div><h1 className="page-title">My listings</h1><p className="page-sub">Cars you are selling and the offers on them.</p></div>
        <Link to="/seller/list-car" className="btn primary">+ Sell a car</Link>
      </div>
      <Notice kind="error">{error}</Notice>
      {cars && cars.length === 0 && <div className="empty"><h3>You have not listed a car</h3></div>}
      <div className="mini-list">
        {cars && cars.map((car) => {
          const list = offers[car.id] || []
          const pending = list.filter((o) => o.status === 'pending')
          const lowest = pending.length > 1 ? Math.max(...pending.map((o) => o.price)) : null
          return (
            <div key={car.id}>
              <div className="mini-car">
                <div className="thumb"><CarPhoto car={car} /></div>
                <div className="info">
                  <b>{car.year} {car.make} {car.model}</b> · {formatPrice(car.price)}<br />
                  <span className={`badge ${statusClass(car.status)}`}>{STATUS_TEXT[car.status]}</span>{' '}
                  <span className="muted">{car.offers_count} offer(s)</span>
                  {car.status === 'rejected' && <p className="muted">Reason: {car.reject_reason}</p>}
                </div>
                <div className="row-actions">
                  {car.status !== 'sold' && <Link className="btn outline small" to={`/seller/list-car/${car.id}`}>Edit</Link>}
                  <button className="btn blue small" onClick={() => showOffers(car)}>{open === car.id ? 'Hide offers' : 'View offers'}</button>
                  <button className="btn outline danger-text small" onClick={() => remove(car)}>Delete</button>
                </div>
              </div>
              {open === car.id && (
                <div className="stack" style={{ margin: '.8rem 0 0 1rem' }}>
                  {list.length === 0 && <p className="muted">No offers yet.</p>}
                  {list.map((o) => (
                    <OfferCard key={o.id} offer={o} busy={busy} best={lowest !== null && o.price === lowest}
                      canAnswer={car.status !== 'sold'}
                      onAccept={(x) => act(car, `/offers/${x.id}/accept`)}
                      onReject={(x) => act(car, `/offers/${x.id}/reject`)} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
