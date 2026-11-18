import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../AuthContext.jsx'
import { formatPrice } from '../utils.js'
import CarPhoto from './CarPhoto.jsx'
import { HeartIcon, PinIcon } from './Icons.jsx'

export default function CarCard({ car, onUnfavorite }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(car.is_favorite)

  async function toggleFavorite() {
    if (!user) {
      navigate('/login', { state: { from: '/browse' } })
      return
    }
    try {
      const data = await api('/favorites/' + car.id, { method: 'POST' })
      setSaved(data.is_favorite)
      if (!data.is_favorite && onUnfavorite) onUnfavorite(car.id)
    } catch {
    }
  }

  const showHeart = !user || user.role === 'buyer'

  return (
    <article className="car-card">
      <Link to={`/cars/${car.id}`} className="car-card-media" aria-label={`${car.make} ${car.model}`}>
        <CarPhoto car={car} />
        <span className="price-tag">{formatPrice(car.price)}</span>
      </Link>

      {showHeart && (
        <button
          type="button"
          className={`heart ${saved ? 'saved' : ''}`}
          onClick={toggleFavorite}
          aria-label={saved ? 'Remove from favorites' : 'Save to favorites'}
          aria-pressed={saved}
        >
          <HeartIcon filled={saved} />
        </button>
      )}

      <div className="car-card-body">
        <h3>
          <Link to={`/cars/${car.id}`}>
            {car.year} {car.make} {car.model}
          </Link>
        </h3>

        <div className="chips">
          {car.mileage !== null && car.mileage !== undefined && (
            <span className="chip violet">{Number(car.mileage).toLocaleString()} km</span>
          )}
          {car.fuel && <span className="chip blue">{car.fuel}</span>}
          {car.transmission && <span className="chip green">{car.transmission}</span>}
          {car.body_type && <span className="chip yellow">{car.body_type}</span>}
        </div>

        <div className="car-card-foot">
          <span className="with-icon"><PinIcon /> {car.location || 'Kenya'}</span>
          {car.owner && <span className="dealer-name">{car.owner.business_name}</span>}
        </div>
      </div>
    </article>
  )
}
