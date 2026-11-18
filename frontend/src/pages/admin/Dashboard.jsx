import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api.js'
import Loader from '../../components/Loader.jsx'
import { formatDate, formatPrice } from '../../utils.js'

const CARDS = [
  ['total_users', 'Users', 'c1'], ['total_cars', 'Cars listed', 'c2'], ['total_requests', 'Buyer requests', 'c4'],
  ['total_offers', 'Offers sent', 'c6'], ['completed_sales', 'Deals done', 'c3'], ['pending_dealers', 'Dealers to verify', 'c5'],
]
const ROLE_COLORS = { buyers: '#7c3aed', sellers: '#f59e0b', dealers: '#2563eb' }

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [dealers, setDealers] = useState([])
  const [listings, setListings] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => {
    api('/admin/reports').then(setStats).catch(() => setStats({}))
    api('/admin/dealers?status=pending').then((d) => setDealers(d.items)).catch(() => {})
    api('/admin/listings').then((d) => setListings(d.items)).catch(() => {})
    api('/admin/users').then((d) => setUsers(d.items)).catch(() => {})
  }, [])

  if (!stats) return <Loader />

  const total = Math.max(1, (stats.buyers || 0) + (stats.sellers || 0) + (stats.dealers || 0))
  let start = 0
  const slices = Object.keys(ROLE_COLORS).map((key) => {
    const part = ((stats[key] || 0) / total) * 100
    const slice = `${ROLE_COLORS[key]} ${start}% ${start + part}%`
    start += part
    return slice
  })
  const funnel = [
    ['Requests', stats.total_requests || 0, '#7c3aed'],
    ['Offers', stats.total_offers || 0, '#2563eb'],
    ['Deals done', stats.completed_sales || 0, '#16a34a'],
  ]
  const biggest = Math.max(1, ...funnel.map((f) => f[1]))

  return (
    <div className="page container">
      <h1 className="page-title">Admin overview</h1>
      <p className="page-sub">How CarLens is doing today.</p>

      <div className="stat-grid">
        {CARDS.map(([key, label, color]) => (
          <div key={key} className={`stat-card ${color}`}><b>{stats[key] ?? 0}</b>{label}</div>
        ))}
      </div>

      <div className="dash-grid">
        <div className="panel">
          <h2>From request to deal</h2>
          {funnel.map(([label, value, color]) => (
            <div className="bar-row" key={label}>
              <span>{label}</span>
              <div className="bar"><i style={{ width: (value / biggest) * 100 + '%', background: color }} /></div>
              <b>{value}</b>
            </div>
          ))}
          <p className="muted">Listings waiting for approval: <b>{stats.pending_listings ?? 0}</b></p>
        </div>
        <div className="panel">
          <h2>Who is on CarLens</h2>
          <div className="donut" style={{ background: `conic-gradient(${slices.join(', ')})` }}><span>{stats.total_users}</span></div>
          <div className="legend">
            {Object.keys(ROLE_COLORS).map((key) => (
              <span key={key}><i style={{ background: ROLE_COLORS[key] }} />{key} {stats[key] || 0}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="panel">
          <h2>Dealers waiting for approval</h2>
          {dealers.length === 0 ? <p className="muted">Nobody is waiting.</p> : dealers.map((d) => (
            <div className="todo t1" key={d.id}><span>{d.business_name} · {d.location}</span><small>{formatDate(d.created_at)}</small></div>
          ))}
          <Link to="/admin/dealers" className="btn primary small">Verify dealers</Link>
        </div>
        <div className="panel">
          <h2>Listings waiting for approval</h2>
          {listings.length === 0 ? <p className="muted">Nothing waiting.</p> : listings.map((c) => (
            <div className="todo t2" key={c.id}><span>{c.year} {c.make} {c.model}</span><small>{formatPrice(c.price)}</small></div>
          ))}
          <Link to="/admin/listings" className="btn blue small">Approve listings</Link>
        </div>
      </div>

      <div className="panel">
        <h2>Newest members</h2>
        <div className="table-wrap" style={{ boxShadow: 'none' }}>
          <table>
            <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Joined</th></tr></thead>
            <tbody>
              {[...users].sort((a, b) => b.id - a.id).slice(0, 5).map((u) => (
                <tr key={u.id}><td>{u.name}</td><td><span className="badge violet">{u.role}</span></td><td>{u.email}</td><td>{formatDate(u.created_at)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="button-row"><Link to="/admin/users" className="btn accent small">Manage all users</Link></div>
      </div>
    </div>
  )
}
