import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page container center">
      <h1 className="page-title" style={{ fontSize: '4rem' }}>404</h1>
      <p>We could not find that page.</p>
      <Link to="/" className="btn primary">Go home</Link>
    </div>
  )
}
