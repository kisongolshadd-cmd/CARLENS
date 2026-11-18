import { useState } from 'react'
import CarArt from './CarArt.jsx'

export default function CarPhoto({ car }) {
  const [failed, setFailed] = useState(false)

  if (!car.image_url || failed) {
    return <CarArt color={car.color} type={car.body_type} />
  }

  return (
    <div className="photo-stage" style={{ '--paint': car.color || '#7C3AED' }}>
      <img className="photo-bg" src={car.image_url} alt="" aria-hidden="true" />
      <img className="photo-main" src={car.image_url} alt={`${car.make} ${car.model}`} onError={() => setFailed(true)} />
    </div>
  )
}
