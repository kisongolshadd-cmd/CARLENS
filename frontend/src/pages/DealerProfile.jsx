import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api.js'
import CarCard from '../components/CarCard.jsx'
import Loader from '../components/Loader.jsx'
import Notice from '../components/Notice.jsx'
import Stars from '../components/Stars.jsx'
import { formatDate } from '../utils.js'

export default function DealerProfile() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState('')

  function load() {
    api('/dealers/' + id).then(setData).catch((e) => setError(e.message))
  }
  useEffect(load, [id])

  async function review(event) {
    event.preventDefault()
    setMessage('')
    try {
      await api(`/dealers/${id}/reviews`, { method: 'POST', body: { rating, comment } })
      setComment('')
      setMessage('Thank you for your review!')
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  if (error && !data) return <div className="page container"><Notice kind="error">{error}</Notice><Link to="/browse">Back</Link></div>
  if (!data) return <Loader />

  return (
    <div className="page container">
      <div className="panel" style={{ background: 'linear-gradient(120deg,#ede9fe,#fef9c3)' }}>
        <h1 className="page-title">{data.dealer.business_name}</h1>
        <p className="muted">{data.dealer.location}</p>
        {data.rating ? (
          <p className="with-icon"><Stars value={data.rating} /> <b>{data.rating}</b> from {data.review_count} review(s)</p>
        ) : <p className="muted">No reviews yet</p>}
      </div>

      <div className="section-head" style={{ marginTop: '2rem' }}><h2>Cars in stock</h2></div>
      {data.cars.length === 0 ? <div className="empty">No cars right now.</div> : (
        <div className="car-grid">{data.cars.map((c) => <CarCard key={c.id} car={c} />)}</div>
      )}

      <div className="section-head" style={{ marginTop: '2rem' }}><h2>Reviews</h2></div>
      <Notice kind="error">{error}</Notice>
      <Notice kind="success">{message}</Notice>
      {data.can_review && (
        <form className="panel" onSubmit={review} style={{ marginBottom: '1rem' }}>
          <h2>You bought from this dealer. How was it?</h2>
          <Stars value={rating} onChange={setRating} />
          <div className="field" style={{ marginTop: '.7rem' }}>
            <textarea rows="3" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a short review" />
          </div>
          <button className="btn primary">Submit review</button>
        </form>
      )}
      <div className="stack">
        {data.reviews.map((r) => (
          <div className="panel" key={r.id}>
            <Stars value={r.rating} size={16} /> <b>{r.buyer_name}</b> <span className="muted">· {formatDate(r.created_at)}</span>
            <p style={{ margin: '.4rem 0 0' }}>{r.comment}</p>
          </div>
        ))}
        {data.reviews.length === 0 && <p className="muted">No reviews yet.</p>}
      </div>
    </div>
  )
}
