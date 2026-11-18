import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api.js'
import Notice from '../../components/Notice.jsx'

export default function PostRequest() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ make: '', model: '', max_budget: '', notes: '' })
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
      await api('/requests', { method: 'POST', body: form })
      navigate('/buyer/offers')
    } catch (e) {
      setError(e.message)
      setBusy(false)
    }
  }

  return (
    <div className="page container" style={{ maxWidth: 720 }}>
      <h1 className="page-title">Request a car</h1>
      <p className="page-sub">Tell dealers what you are looking for and they will send you offers.</p>
      <form className="panel" onSubmit={submit}>
        <Notice kind="error">{error}</Notice>
        <div className="field-row">
          <div className="field"><label htmlFor="make">Make</label>
            <input id="make" name="make" value={form.make} onChange={change} placeholder="Toyota" required /></div>
          <div className="field"><label htmlFor="model">Model</label>
            <input id="model" name="model" value={form.model} onChange={change} placeholder="Harrier" required /></div>
        </div>
        <div className="field"><label htmlFor="max_budget">Maximum budget (KES)</label>
          <input id="max_budget" name="max_budget" type="number" min="1" value={form.max_budget} onChange={change} required /></div>
        <div className="field"><label htmlFor="notes">Anything else?</label>
          <textarea id="notes" name="notes" rows="4" value={form.notes} onChange={change} placeholder="Year, colour, mileage..." /></div>
        <button className="btn primary" disabled={busy}>{busy ? 'Sending...' : 'Send request'}</button>
      </form>
    </div>
  )
}
