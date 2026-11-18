import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import Notice from '../components/Notice.jsx'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      setResult(await api('/auth/forgot', { method: 'POST', body: { email } }))
    } catch (e) {
      setError(e.message)
    }
    setBusy(false)
  }

  return (
    <div className="auth-wrap">
      <form className="panel auth-card" onSubmit={submit}>
        <h1 className="page-title" style={{ fontSize: '1.7rem' }}>Forgot password</h1>
        <p className="page-sub">Enter your email and we will send you a link.</p>
        <Notice kind="error">{error}</Notice>
        {result && <Notice kind="success">{result.message}</Notice>}
        {result?.dev_link && (
          <Notice kind="info">Email is not set up yet, so use this link: <a href={result.dev_link}>reset my password</a></Notice>
        )}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button className="btn primary" style={{ width: '100%' }} disabled={busy}>{busy ? 'Sending...' : 'Send reset link'}</button>
        <p className="center muted" style={{ marginTop: '1rem' }}><Link to="/login">Back to log in</Link></p>
      </form>
    </div>
  )
}
