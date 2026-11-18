import { Link } from 'react-router-dom'
import { formatDate, formatPrice, statusClass, STATUS_TEXT } from '../utils.js'
import Stars from './Stars.jsx'
import { PinIcon } from './Icons.jsx'

export default function OfferCard({ offer, best, canAnswer, onAccept, onReject, busy }) {
  const dealer = offer.dealer

  return (
    <div className={`offer-card ${offer.status} ${best ? 'best' : ''}`}>
      {best && offer.status === 'pending' && <span className="ribbon">Best price</span>}

      <div className="offer-main">
        <div>
          <Link to={`/dealers/${dealer.id}`} className="offer-dealer">
            {dealer.business_name}
          </Link>
          <div className="offer-meta">
            {dealer.location && <span className="with-icon"><PinIcon /> {dealer.location}</span>}
            {dealer.rating ? (
              <span className="with-icon">
                <Stars value={dealer.rating} size={14} /> {dealer.rating} ({dealer.review_count})
              </span>
            ) : (
              <span className="muted">No reviews yet</span>
            )}
          </div>
        </div>
        <div className="offer-price">{formatPrice(offer.price)}</div>
      </div>

      {offer.message && <p className="offer-message">"{offer.message}"</p>}

      <div className="offer-foot">
        <span className="muted">Sent {formatDate(offer.created_at)}</span>
        <span className={`badge ${statusClass(offer.status)}`}>
          {offer.status === 'pending' ? 'Waiting for answer' : STATUS_TEXT[offer.status] || offer.status}
        </span>
      </div>

      {offer.contact && (
        <div className="contact-box">
          <b>Deal agreed. Contact {offer.contact.name}</b>
          <div>
            {offer.contact.phone && <a href={`tel:${offer.contact.phone}`}>Call {offer.contact.phone}</a>}
            {offer.contact.email && <a href={`mailto:${offer.contact.email}`}>{offer.contact.email}</a>}
          </div>
        </div>
      )}

      {canAnswer && offer.status === 'pending' && (
        <div className="button-row">
          <button type="button" className="btn success" disabled={busy} onClick={() => onAccept(offer)}>
            Accept offer
          </button>
          <button type="button" className="btn outline danger-text" disabled={busy} onClick={() => onReject(offer)}>
            Decline
          </button>
        </div>
      )}
    </div>
  )
}
