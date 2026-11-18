import { useEffect, useState } from 'react'
import { api } from '../../api.js'
import CarPhoto from '../../components/CarPhoto.jsx'
import Loader from '../../components/Loader.jsx'
import Notice from '../../components/Notice.jsx'
import { formatDate, formatPrice, statusClass, STATUS_TEXT } from '../../utils.js'

function OfferForm({ placeholder, onSend, busy }) {
  const [price, setPrice] = useState('')
  const [message, setMessage] = useState('')
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSend({ price, message }) }}>
      <div className="field-row">
        <div className="field"><label>Your price (KES)</label>
          <input type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} placeholder={placeholder} required /></div>
        <div className="field"><label>Message</label>
          <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Free delivery, 1 year warranty..." /></div>
      </div>
      <button className="btn success small" disabled={busy}>Send offer</button>
    </form>
  )
}

export default function OpenRequests() {
  const [tab, setTab] = useState('requests')
  const [requests, setRequests] = useState(null)
  const [listings, setListings] = useState(null)
  const [mine, setMine] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  function load() {
    api('/requests/open').then((d) => setRequests(d.items)).catch((e) => setError(e.message))
    api('/seller-listings').then((d) => setListings(d.items)).catch(() => setListings([]))
    api('/offers/mine').then((d) => setMine(d.items)).catch(() => {})
  }
  useEffect(load, [])

  async function send(body) {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await api('/offers', { method: 'POST', body })
      setMessage('Offer sent!')
      load()
    } catch (e) { setError(e.message) }
    setBusy(false)
  }

  if (!requests && !error) return <Loader />

  return (
    <div className="page container">
      <h1 className="page-title">Requests and offers</h1>
      <p className="page-sub">Answer buyers who want a car and make offers on cars from sellers.</p>
      <div className="tabs">
        <button className={tab === 'requests' ? 'chosen' : ''} onClick={() => setTab('requests')}>Buyer requests</button>
        <button className={tab === 'sellers' ? 'chosen' : ''} onClick={() => setTab('sellers')}>Seller cars</button>
        <button className={tab === 'mine' ? 'chosen' : ''} onClick={() => setTab('mine')}>My offers ({mine.length})</button>
      </div>
      <Notice kind="error">{error}</Notice>
      <Notice kind="success">{message}</Notice>

      {tab === 'requests' && (
        <div className="stack">
          {requests && requests.length === 0 && <div className="empty">No open requests right now.</div>}
          {requests && requests.map((req) => (
            <div className="request-card" key={req.id}>
              <div className="request-head">
                <div>
                  <h3>{req.car ? `${req.car.year} ${req.car.make} ${req.car.model}` : `${req.make} ${req.model}`}</h3>
                  <span className="muted">From {req.buyer_name} · {formatDate(req.created_at)} · {req.offers_count} offer(s) so far</span>
                </div>
                <b>{req.car ? formatPrice(req.car.price) : 'Budget ' + formatPrice(req.max_budget)}</b>
              </div>
              {req.notes && <p className="offer-message">"{req.notes}"</p>}
              {req.my_offer
                ? <span className={`badge ${statusClass(req.my_offer.status)}`}>You offered {formatPrice(req.my_offer.price)}</span>
                : <OfferForm busy={busy} placeholder={req.car ? String(req.car.price) : String(req.max_budget || '')}
                    onSend={(v) => send({ request_id: req.id, ...v })} />}
            </div>
          ))}
        </div>
      )}

      {tab === 'sellers' && (
        <div className="stack">
          {listings && listings.length === 0 && <div className="empty">No seller cars right now.</div>}
          {listings && listings.map((car) => (
            <div className="request-card" key={car.id}>
              <div className="mini-car" style={{ boxShadow: 'none', padding: 0 }}>
                <div className="thumb"><CarPhoto car={car} /></div>
                <div className="info"><h3>{car.year} {car.make} {car.model}</h3>
                  <span className="muted">Asking {formatPrice(car.price)} · {car.location}</span></div>
              </div>
              {car.my_offer_status
                ? <span className={`badge ${statusClass(car.my_offer_status)}`}>{STATUS_TEXT[car.my_offer_status] || car.my_offer_status}</span>
                : <OfferForm busy={busy} placeholder={String(car.price)} onSend={(v) => send({ car_id: car.id, ...v })} />}
            </div>
          ))}
        </div>
      )}

      {tab === 'mine' && (
        <div className="table-wrap"><table>
          <thead><tr><th>For</th><th>My price</th><th>Status</th><th>Date</th><th>Contact</th></tr></thead>
          <tbody>
            {mine.map((o) => {
              const car = o.car || o.request?.car
              const name = car ? `${car.year} ${car.make} ${car.model}` : `${o.request?.make} ${o.request?.model}`
              return (
                <tr key={o.id}><td>{name}</td><td>{formatPrice(o.price)}</td>
                  <td><span className={`badge ${statusClass(o.status)}`}>{o.status}</span></td><td>{formatDate(o.created_at)}</td>
                  <td>{o.contact ? <><b>{o.contact.name}</b><br />{o.contact.phone && <a href={`tel:${o.contact.phone}`}>{o.contact.phone}</a>}</> : '-'}</td></tr>
              )
            })}
            {mine.length === 0 && <tr><td colSpan="5" className="muted">You have not sent offers.</td></tr>}
          </tbody></table></div>
      )}
    </div>
  )
}
