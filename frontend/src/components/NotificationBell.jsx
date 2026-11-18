import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { formatDate } from '../utils.js'

export default function NotificationBell() {
  const navigate = useNavigate()
  const location = useLocation()
  const [data, setData] = useState({ items: [], unread: 0 })
  const [open, setOpen] = useState(false)

  function load() {
    api('/notifications').then(setData).catch(() => {})
  }

  useEffect(() => { setOpen(false) }, [location.pathname])

  useEffect(() => {
    load()
    const timer = setInterval(load, 30000)
    return () => clearInterval(timer)
  }, [])

  async function toggle() {
    const next = !open
    setOpen(next)
    if (next && data.unread > 0) {
      await api('/notifications/read', { method: 'POST' }).catch(() => {})
      setTimeout(load, 1500)
    }
  }

  function go(item) {
    setOpen(false)
    if (item.link) navigate(item.link)
  }

  return (
    <div className="bell-wrap">
      <button type="button" className="bell" onClick={toggle} aria-label={`Notifications, ${data.unread} new`} aria-expanded={open}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {data.unread > 0 && <span className="bell-count">{data.unread}</span>}
      </button>
      {open && (
        <div className="bell-menu">
          <b>Notifications</b>
          {data.items.length === 0 && <p className="muted">Nothing yet.</p>}
          {data.items.map((item) => (
            <button type="button" key={item.id} className={`bell-item ${item.is_read && !open ? 'read' : ''}`} onClick={() => go(item)}>
              {item.text}
              <small>{formatDate(item.created_at)}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
