import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../AuthContext.jsx'
import Notice from '../components/Notice.jsx'
import Loader from '../components/Loader.jsx'

export default function VerifyEmail() {
  const [params] = useSearchParams()
  const { user, setUser } = useAuth()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api('/auth/verify', { method: 'POST', body: { token: params.get('token') } })
      .then((data) => {
        setMessage('Your email is verified. Thank you!')
        if (user && user.id === data.user.id) setUser(data.user)
      })
      .catch((e) => setError(e.message))
  }, [])

  return (
    <div className="auth-wrap">
      <div className="panel auth-card center">
        <h1 className="page-title" style={{ fontSize: '1.7rem' }}>Email verification</h1>
        {!message && !error && <Loader />}
        <Notice kind="success">{message}</Notice>
        <Notice kind="error">{error}</Notice>
        <Link to="/" className="btn primary">Go to CarLens</Link>
      </div>
    </div>
  )
}
