import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../AuthContext.jsx'
import Notice from '../components/Notice.jsx'
import { LOCATIONS, homeFor } from '../utils.js'

const ROLES = [['buyer', 'Buyer'], ['seller', 'Seller'], ['dealer', 'Dealer']]

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ role: 'buyer', name: '', email: '', phone: '', password: '', business_name: '', location: 'Nairobi', national_id: '' })
  const [licence, setLicence] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = new FormData()
      Object.entries(form).forEach(([key, value]) => data.append(key, value))
      if (licence) data.append('licence', licence)
      await api('/auth/register', { method: 'POST', body: data })
      const user = await login(form.email, form.password)
      navigate(homeFor(user.role), { replace: true })
    } catch (e) {
      setError(e.message)
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <form className="panel auth-card" onSubmit={submit}>
        <h1 className="page-title" style={{ fontSize: '1.7rem' }}>Join CarLens</h1>
        <p className="page-sub">I want to join as a...</p>
        <div className="role-pick">
          {ROLES.map(([value, label]) => (
            <button type="button" key={value} className={form.role === value ? 'chosen' : ''}
              onClick={() => setForm({ ...form, role: value })}>{label}</button>
          ))}
        </div>
        {form.role === 'dealer' && <Notice kind="info">Dealer accounts are checked by our admin before you can send offers.</Notice>}
        <Notice kind="error">{error}</Notice>

        <div className="field"><label htmlFor="name">Full name</label>
          <input id="name" name="name" value={form.name} onChange={change} required /></div>
        {form.role === 'dealer' && (
          <div className="field"><label htmlFor="business_name">Business name</label>
            <input id="business_name" name="business_name" value={form.business_name} onChange={change} required /></div>
        )}
        {form.role !== 'buyer' && (
          <div className="field"><label htmlFor="national_id">National ID number</label>
            <input id="national_id" name="national_id" value={form.national_id} onChange={change}
              inputMode="numeric" placeholder="e.g. 31245678" required /></div>
        )}
        {form.role === 'dealer' && (
          <div className="field"><label htmlFor="licence">Business licence (photo or PDF)</label>
            <input id="licence" type="file" accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={(e) => setLicence(e.target.files[0] || null)} required /></div>
        )}
        <div className="field"><label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={change} required /></div>
        <div className="field-row">
          <div className="field"><label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" value={form.phone} onChange={change} placeholder="0712345678" /></div>
          <div className="field"><label htmlFor="location">Town</label>
            <select id="location" name="location" value={form.location} onChange={change}>
              {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
            </select></div>
        </div>
        <div className="field"><label htmlFor="password">Password (6+ characters)</label>
          <input id="password" name="password" type="password" minLength="6" value={form.password} onChange={change} required /></div>
        <button className="btn primary" style={{ width: '100%' }} disabled={busy}>{busy ? 'Creating...' : 'Create account'}</button>
        <p className="center muted" style={{ marginTop: '1rem' }}>Have an account? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  )
}
