import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import Notice from '../components/Notice.jsx'
import { homeFor } from '../utils.js'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const user = await login(email, password)
      navigate(location.state?.from || homeFor(user.role), { replace: true })
    } catch (e) {
      setError(e.message)
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <form className="panel auth-card" onSubmit={submit}>
        <h1 className="page-title" style={{ fontSize: '1.7rem' }}>Welcome back</h1>
        <p className="page-sub">Log in to continue.</p>
        <Notice kind="error">{error}</Notice>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <p className="muted" style={{ textAlign: 'right', margin: '-0.4rem 0 0.8rem' }}><Link to="/forgot-password">Forgot password?</Link></p>
        <button className="btn primary" style={{ width: '100%' }} disabled={busy}>{busy ? 'Logging in...' : 'Log in'}</button>
        <p className="center muted" style={{ marginTop: '1rem' }}>New here? <Link to="/register">Create an account</Link></p>
        <div className="demo-box">
          <b>Demo logins</b> (password: password123)<br />
          buyer: amina@example.com · seller: kevin@example.com<br />
          dealer: faith@example.com · admin: admin@carlens.com
        </div>
      </form>
    </div>
  )
}
