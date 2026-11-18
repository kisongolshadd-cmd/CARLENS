import { useState } from 'react'
import { api } from '../api.js'
import { useAuth } from '../AuthContext.jsx'
import Notice from '../components/Notice.jsx'
import { LOCATIONS } from '../utils.js'

export default function Profile() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({
    name: user.name, phone: user.phone || '', location: user.location || '', business_name: user.business_name || '',
  })
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function saveDetails(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    try {
      const data = await api('/auth/me', { method: 'PUT', body: form })
      setUser(data.user)
      setMessage('Your details are saved.')
    } catch (e) {
      setError(e.message)
    }
  }

  async function savePassword(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    try {
      await api('/auth/password', { method: 'PUT', body: passwords })
      setPasswords({ old_password: '', new_password: '' })
      setMessage('Your password is changed.')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="page container" style={{ maxWidth: 720 }}>
      <h1 className="page-title">My profile</h1>
      <p className="page-sub">{user.email} · {user.role}</p>
      <Notice kind="success">{message}</Notice>
      <Notice kind="error">{error}</Notice>

      <form className="panel" onSubmit={saveDetails} style={{ marginBottom: '1.2rem' }}>
        <h2>My details</h2>
        <div className="field"><label htmlFor="name">Full name</label>
          <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
        {user.role === 'dealer' && (
          <div className="field"><label htmlFor="business_name">Business name</label>
            <input id="business_name" value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} required /></div>
        )}
        <div className="field-row">
          <div className="field"><label htmlFor="phone">Phone</label>
            <input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0712345678" /></div>
          <div className="field"><label htmlFor="location">Town</label>
            <select id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
              <option value="">Choose</option>
              {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
            </select></div>
        </div>
        <button className="btn primary">Save details</button>
      </form>

      <form className="panel" onSubmit={savePassword}>
        <h2>Change password</h2>
        <div className="field"><label htmlFor="old_password">Old password</label>
          <input id="old_password" type="password" value={passwords.old_password}
            onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })} required /></div>
        <div className="field"><label htmlFor="new_password">New password (6+ characters)</label>
          <input id="new_password" type="password" minLength="6" value={passwords.new_password}
            onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })} required /></div>
        <button className="btn blue">Change password</button>
      </form>
    </div>
  )
}
