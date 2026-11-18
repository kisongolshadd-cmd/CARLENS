import { useEffect, useState } from 'react'
import { api, openLicence } from '../../api.js'
import Loader from '../../components/Loader.jsx'
import Notice from '../../components/Notice.jsx'
import { formatDate } from '../../utils.js'

export default function VerifyDealers() {
  const [status, setStatus] = useState('pending')
  const [dealers, setDealers] = useState(null)
  const [error, setError] = useState('')

  function load() {
    setDealers(null)
    api('/admin/dealers?status=' + status).then((d) => setDealers(d.items)).catch((e) => setError(e.message))
  }
  useEffect(load, [status])

  async function decide(dealer, action) {
    try { await api(`/admin/dealers/${dealer.id}/${action}`, { method: 'POST' }); load() } catch (e) { setError(e.message) }
  }

  return (
    <div className="page container">
      <h1 className="page-title">Verify dealers</h1>
      <div className="tabs">
        {['pending', 'approved', 'rejected'].map((s) => (
          <button key={s} className={status === s ? 'chosen' : ''} onClick={() => setStatus(s)}>{s}</button>
        ))}
      </div>
      <Notice kind="error">{error}</Notice>
      {!dealers ? <Loader /> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Business</th><th>Owner</th><th>Email</th><th>ID number</th><th>Licence</th><th>Town</th><th>Joined</th><th></th></tr></thead>
          <tbody>
            {dealers.map((d) => (
              <tr key={d.id}><td><b>{d.business_name}</b></td><td>{d.name}</td><td>{d.email}</td><td>{d.national_id || '-'}</td><td>{d.has_licence ? <button className="btn outline small" onClick={() => openLicence(d.id).catch((e) => setError(e.message))}>View</button> : <span className="muted">None</span>}</td><td>{d.location}</td><td>{formatDate(d.created_at)}</td>
                <td><div className="row-actions">
                  {status !== 'approved' && <button className="btn success small" onClick={() => decide(d, 'approve')}>Approve</button>}
                  {status !== 'rejected' && <button className="btn outline danger-text small" onClick={() => decide(d, 'reject')}>Reject</button>}
                </div></td></tr>
            ))}
            {dealers.length === 0 && <tr><td colSpan="8" className="muted">Nobody here.</td></tr>}
          </tbody></table></div>
      )}
    </div>
  )
}
