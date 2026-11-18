import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api.js'
import CarCard from '../../components/CarCard.jsx'
import Loader from '../../components/Loader.jsx'

export default function Favorites() {
  const [cars, setCars] = useState(null)

  useEffect(() => {
    api('/favorites').then((d) => setCars(d.items)).catch(() => setCars([]))
  }, [])

  if (!cars) return <Loader />

  return (
    <div className="page container">
      <h1 className="page-title">My favorites</h1>
      <p className="page-sub">Cars you saved to look at later.</p>
      {cars.length === 0 ? (
        <div className="empty"><h3>Nothing saved yet</h3><Link to="/browse" className="btn primary">Browse cars</Link></div>
      ) : (
        <div className="car-grid">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} onUnfavorite={(id) => setCars(cars.filter((c) => c.id !== id))} />
          ))}
        </div>
      )}
    </div>
  )
}
