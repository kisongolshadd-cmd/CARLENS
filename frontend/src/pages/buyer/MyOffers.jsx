import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api.js'
import Loader from '../../components/Loader.jsx'
import Notice from '../../components/Notice.jsx'
import OfferCard from '../../components/OfferCard.jsx'
import { formatDate, formatPrice, statusClass, STATUS_TEXT } from '../../utils.js'

export default function MyOffers() {
  const [requests, setRequests] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function load() {
    api('/requests/mine').then((d) => setRequests(d.items)).catch((e) => setError(e.message))
  }
  useEffect(load, [])

  async function act(url) {
    setBusy(true)
    setError('')
    try { await api(url, { method: 'POST' }); load() } catch (e) { setError(e.message) }
    setBusy(false)
  }

  if (!requests && !error) return <Loader />

  return (
    <div className="page container">
      <h1 className="page-title">My offers</h1>
      <p className="page-sub">Compare what dealers sent you and accept the best one.</p>
      <Notice kind="error">{error}</Notice>
      {requests && requests.length === 0 && (
        <div className="empty"><h3>No requests yet</h3>
          <p>Open a car and ask for offers, or describe the car you want.</p>
          <Link to="/buyer/post-request" className="btn primary">Request a car</Link></div>
      )}
      <div className="stack">
        {requests && requests.map((req) => {
          const pending = req.offers.filter((o) => o.status === 'pending')
          const lowest = pending.length > 1 ? Math.min(...pending.map((o) => o.price)) : null
          const title = req.car ? `${req.car.year} ${req.car.make} ${req.car.model}` : `${req.make} ${req.model}`
          return (
            <div className="request-card" key={req.id}>
              <div className="request-head">
                <div>
                  <h3>{title}</h3>
                  <span className="muted">
                    Asked {formatDate(req.created_at)}
                    {req.car ? ` · listed at ${formatPrice(req.car.price)}` : ` · budget ${formatPrice(req.max_budget)}`}
                  </span>
                </div>
                <div>
                  <span className={`badge ${statusClass(req.status)}`}>{STATUS_TEXT[req.status] || req.status}</span>
                  {req.status === 'open' && (
                    <button className="btn outline small" style={{ marginLeft: '.5rem' }} disabled={busy}
                      onClick={() => act(`/requests/${req.id}/close`)}>Close request</button>
                  )}
                </div>
              </div>
              {req.offers.length === 0 ? <p className="muted">No offers yet. Dealers will reply soon.</p> : (
                <div className="stack">
                  {req.offers.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} busy={busy}
                      best={lowest !== null && offer.price === lowest}
                      canAnswer={req.status === 'open'}
                      onAccept={(o) => act(`/offers/${o.id}/accept`)}
                      onReject={(o) => act(`/offers/${o.id}/reject`)} />
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
