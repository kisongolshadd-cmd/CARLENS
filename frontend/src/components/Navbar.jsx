import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import { LogoMark } from './Icons.jsx'
import NotificationBell from './NotificationBell.jsx'

function linksFor(role) {
  if (role === 'buyer') {
    return [
      ['/browse', 'Browse cars'],
      ['/buyer/post-request', 'Request a car'],
      ['/buyer/offers', 'My offers'],
      ['/buyer/favorites', 'Favorites'],
    ]
  }
  if (role === 'seller') {
    return [
      ['/seller/listings', 'My listings'],
      ['/seller/list-car', 'Sell a car'],
    ]
  }
  if (role === 'dealer') {
    return [
      ['/dealer', 'Dashboard'],
      ['/dealer/listings', 'My cars'],
      ['/dealer/requests', 'Requests and offers'],
    ]
  }
  if (role === 'admin') {
    return [
      ['/admin', 'Overview'],
      ['/admin/dealers', 'Dealers'],
      ['/admin/listings', 'Listings'],
      ['/admin/users', 'Users'],
    ]
  }
  return [
    ['/browse', 'Browse cars'],
  ]
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  function handleLogout() {
    logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <LogoMark />
          <span>Car<b>Lens</b></span>
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-label="Open the menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span /><span /><span />
        </button>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {linksFor(user?.role).map(([path, label]) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/admin' || path === '/dealer'}
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          ))}

          <div className="nav-user">
            {user ? (
              <>
                <NotificationBell />
                <Link to="/profile" className="user-chip" onClick={() => setOpen(false)} title="My profile">
                  <span className={`role-dot ${user.role}`} />
                  {user.name.split(' ')[0]}
                  <small>{user.role}</small>
                </Link>
                <button type="button" className="btn outline small" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn outline small" onClick={() => setOpen(false)}>
                  Log in
                </Link>
                <Link to="/register" className="btn accent small" onClick={() => setOpen(false)}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
