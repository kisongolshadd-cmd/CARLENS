import { useState } from 'react'
import { api } from '../api.js'
import { useAuth } from '../AuthContext.jsx'

export default function VerifyBanner() {
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [link, setLink] = useState('')

  if (!user || user.email_verified || user.role === 'admin') return null

  async function resend() {
    try {
      const data = await api('/auth/resend-verification', { method: 'POST' })
      setText(data.message)
      setLink(data.dev_link || '')
    } catch (e) {
      setText(e.message)
    }
  }

  return (
    <div className="verify-banner">
      <div className="container">
        Please verify your email ({user.email}) to post, list or send offers.{' '}
        <button type="button" className="link-button" onClick={resend}>Send me the link</button>
        {text && <span> {text}</span>}
        {link && <span> Email is not set up yet: <a href={link}>verify now</a></span>}
      </div>
    </div>
  )
}
