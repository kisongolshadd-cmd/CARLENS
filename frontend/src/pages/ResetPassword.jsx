import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import Notice from '../components/Notice.jsx'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const [password, setPassword] = useState('')
  const [done, setDone] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = await api('/auth/reset', { method: 'POST', body: { token: params.get('token'), password } })
      setDone(data.message)
    } catch (e) {
      setError(e.message)
    }
    setBusy(false)
  }

  return (
    <div className="auth-wrap">
      <form className="panel auth-card" onSubmit={submit}>
        <h1 className="page-title" style={{ fontSize: '1.7rem' }}>Choose a new password</h1>
        <Notice kind="error">{error}</Notice>
        {done ? (
          <>
            <Notice kind="success">{done}</Notice>
            <Link to="/login" className="btn primary" style={{ width: '100%', textAlign: 'center' }}>Log in</Link>
          </>
        ) : (
          <>
            <div className="field">
              <label htmlFor="password">New password (6+ characters)</label>
              <input id="password" type="password" minLength="6" value={password}
                onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button className="btn primary" style={{ width: '100%' }} disabled={busy}>{busy ? 'Saving...' : 'Save password'}</button>
          </>
        )}
      </form>
    </div>
  )
}
