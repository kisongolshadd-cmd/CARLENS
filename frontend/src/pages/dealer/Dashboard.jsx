import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api.js'
import { useAuth } from '../../AuthContext.jsx'
import Loader from '../../components/Loader.jsx'
import Notice from '../../components/Notice.jsx'
import CarPhoto from '../../components/CarPhoto.jsx'
import { formatDate, formatPrice, statusClass } from '../../utils.js'

const COLORS = { pending: '#facc15', accepted: '#16a34a', rejected: '#ef4444', closed: '#2563eb' }

export default function DealerDashboard() {
  const { user } = useAuth()
  const [cars, setCars] = useState(null)
  const [offers, setOffers] = useState([])
  const [requests, setRequests] = useState([])
  const [sellerCars, setSellerCars] = useState([])
  const [rating, setRating] = useState(null)

  useEffect(() => {
    api('/my-cars').then((d) => setCars(d.items)).catch(() => setCars([]))
    api('/offers/mine').then((d) => setOffers(d.items)).catch(() => {})
    api('/requests/open').then((d) => setRequests(d.items)).catch(() => {})
    api('/seller-listings').then((d) => setSellerCars(d.items)).catch(() => {})
    api('/dealers/' + user.id).then(setRating).catch(() => {})
  }, [user.id])

  if (!cars) return <Loader />

  const count = (status) => offers.filter((o) => o.status === status).length
  const decided = count('accepted') + count('rejected') + count('closed')
  const winRate = decided ? Math.round((count('accepted') / decided) * 100) : 0
  const stockValue = cars.reduce((sum, c) => sum + c.price, 0)
  const waiting = requests.filter((r) => !r.my_offer)
  const newSeller = sellerCars.filter((c) => !c.my_offer_status)
  const topCars = [...cars].sort((a, b) => b.offers_count - a.offers_count).slice(0, 4)
  const biggest = Math.max(1, ...Object.keys(COLORS).map(count))
  const accepted = offers.filter((o) => o.status === 'accepted').reduce((s, o) => s + o.price, 0)

  return (
    <div className="page container">
      <h1 className="page-title">Hello, {user.business_name || user.name}</h1>
      <p className="page-sub">Everything about your dealership in one place.</p>
      {user.dealer_status === 'pending' && <Notice kind="warning">Your account is waiting for admin approval. You can send offers once it is approved.</Notice>}
      {user.dealer_status === 'rejected' && <Notice kind="error">Your dealer account was not approved.</Notice>}

      <div className="stat-grid">
        <div className="stat-card c1"><b>{cars.length}</b>Cars in stock</div>
        <div className="stat-card c2"><b>{formatPrice(stockValue).replace('KES ', '')}</b>Stock value (KES)</div>
        <div className="stat-card c4"><b>{count('pending')}</b>Offers waiting</div>
        <div className="stat-card c3"><b>{count('accepted')}</b>Deals won</div>
        <div className="stat-card c6"><b>{winRate}%</b>Win rate</div>
        <div className="stat-card c5"><b>{rating?.rating ?? '-'}</b>Rating ({rating?.review_count ?? 0} reviews)</div>
      </div>

      <div className="dash-grid">
        <div className="panel">
          <h2>Your offers</h2>
          {Object.keys(COLORS).map((status) => (
            <div className="bar-row" key={status}>
              <span style={{ textTransform: 'capitalize' }}>{status}</span>
              <div className="bar"><i style={{ width: (count(status) / biggest) * 100 + '%', background: COLORS[status] }} /></div>
              <b>{count(status)}</b>
            </div>
          ))}
          <p className="muted" style={{ marginTop: '.8rem' }}>Value of accepted deals: <b>{formatPrice(accepted)}</b></p>
        </div>

        <div className="panel">
          <h2>To do today</h2>
          <div className="todo t1"><span>Buyer requests with no offer from you</span><b>{waiting.length}</b></div>
          <div className="todo t2"><span>Seller cars you can bid on</span><b>{newSeller.length}</b></div>
          <div className="todo t3"><span>Offers still waiting for an answer</span><b>{count('pending')}</b></div>
          <div className="button-row">
            <Link to="/dealer/requests" className="btn primary small">Answer requests</Link>
            <Link to="/dealer/listings" className="btn blue small">Add a car</Link>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="panel">
          <h2>Latest offers</h2>
          <div className="table-wrap" style={{ boxShadow: 'none' }}>
            <table>
              <thead><tr><th>For</th><th>Price</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {offers.slice(0, 6).map((o) => {
                  const car = o.car || o.request?.car
                  const name = car ? `${car.year} ${car.make} ${car.model}` : `${o.request?.make} ${o.request?.model}`
                  return (
                    <tr key={o.id}><td>{name}</td><td>{formatPrice(o.price)}</td>
                      <td><span className={`badge ${statusClass(o.status)}`}>{o.status}</span></td><td>{formatDate(o.created_at)}</td></tr>
                  )
                })}
                {offers.length === 0 && <tr><td colSpan="4" className="muted">No offers yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <h2>Cars buyers ask about</h2>
          <div className="mini-list">
            {topCars.map((car) => (
              <div className="mini-car" key={car.id} style={{ boxShadow: 'none', padding: 0 }}>
                <div className="thumb" style={{ width: 90 }}><CarPhoto car={car} /></div>
                <div className="info"><b>{car.make} {car.model}</b><br /><span className="muted">{car.offers_count} offer(s) · {formatPrice(car.price)}</span></div>
              </div>
            ))}
            {topCars.length === 0 && <p className="muted">Add cars to see them here.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
