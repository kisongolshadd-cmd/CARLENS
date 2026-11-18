import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import Loader from '../components/Loader.jsx'
import { SearchIcon } from '../components/Icons.jsx'
import { BODY_TYPES } from '../utils.js'

const photo = (name) => '/cars/' + name + '.jpg'
const TYPE_COLORS = ['#7c3aed', '#2563eb', '#16a34a', '#ef4444', '#f59e0b', '#ec4899', '#0d9488']

export default function Home() {
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [cars, setCars] = useState(null)

  useEffect(() => {
    api('/cars?per_page=8')
      .then((data) => setCars(data.items))
      .catch(() => setCars([]))
  }, [])

  function search(event) {
    event.preventDefault()
    navigate('/browse?q=' + encodeURIComponent(text))
  }

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <span className="hero-tag">Cars across Kenya</span>
            <h1>Let dealers <span>compete</span> for your next car</h1>
            <p className="lead">
              Pick a car, ask for offers and choose the best deal. Selling your car?
              Verified dealers will make you an offer.
            </p>
            <form className="search-bar" onSubmit={search}>
              <input value={text} onChange={(e) => setText(e.target.value)}
                placeholder="Search a make or model" aria-label="Search cars" />
              <button className="btn accent" type="submit"><SearchIcon /> Search</button>
            </form>
            <div className="button-row">
              <Link to="/browse" className="btn accent">Browse cars</Link>
              <Link to="/register" className="btn outline" style={{ color: '#fff' }}>Create account</Link>
            </div>
          </div>

          <div className="hero-collage" aria-hidden="true">
            <div className="collage-main"><img src={photo('lamborghini-aventador')} alt="" /></div>
            <div className="collage-side"><img src={photo('rolls-royce-phantom')} alt="" /></div>
            <span className="float-badge b1">Verified dealers</span>
            <span className="float-badge b2">Compare offers</span>
          </div>
        </div>
      </section>

      <div className="container">
        <section className="section">
          <div className="section-head"><h2>How CarLens works</h2></div>
          <div className="steps">
            <div className="step"><div className="num">1</div><h3>Browse</h3><p>Search by make, body type, fuel and town.</p></div>
            <div className="step"><div className="num">2</div><h3>Ask for offers</h3><p>Tell dealers what you want and they reply with a price.</p></div>
            <div className="step"><div className="num">3</div><h3>Compare</h3><p>See every offer side by side, best one highlighted.</p></div>
            <div className="step"><div className="num">4</div><h3>Accept and review</h3><p>Accept the best deal, then rate the dealer.</p></div>
          </div>
        </section>

        <section className="section">
          <div className="section-head"><h2>Shop by body type</h2></div>
          <div className="body-types">
            {BODY_TYPES.map((type, i) => (
              <Link key={type} className="body-type" style={{ background: TYPE_COLORS[i % TYPE_COLORS.length] }}
                to={'/browse?body_type=' + type}>{type}</Link>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <h2>On CarLens now</h2>
            <Link to="/browse">See all cars</Link>
          </div>
          {cars === null ? <Loader /> : (
            <div className="gallery">
              {cars.map((car) => (
                <Link to={`/cars/${car.id}`} className="tile" key={car.id}>
                  <img src={car.image_url} alt={`${car.make} ${car.model}`} loading="lazy" />
                  <span>{car.make} {car.model}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="cta">
          <h2>Are you a car dealer?</h2>
          <p>Join CarLens, get verified and send offers to buyers who are ready to buy.</p>
          <Link to="/register" className="btn accent">Become a dealer</Link>
        </section>
      </div>
    </>
  )
}
