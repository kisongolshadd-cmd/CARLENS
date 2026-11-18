import { useEffect, useState } from 'react'
import { getMakes } from '../externalApi.js'
import { BODY_TYPES, FUELS, LOCATIONS, TRANSMISSIONS } from '../utils.js'

export default function FilterPanel({ filters, onApply, onReset }) {
  const [form, setForm] = useState(filters)
  const [makes, setMakes] = useState([])

  useEffect(() => {
    getMakes().then(setMakes)
  }, [])

  useEffect(() => {
    setForm(filters)
  }, [filters])

  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  function submit(event) {
    event.preventDefault()
    onApply(form)
  }

  return (
    <form className="panel filter-panel" onSubmit={submit}>
      <h2>Find your car</h2>

      <div className="field">
        <label htmlFor="q">Search</label>
        <input id="q" name="q" value={form.q} onChange={change} placeholder="Toyota, SUV, 4x4..." />
      </div>

      <div className="field">
        <label htmlFor="make">Make</label>
        <select id="make" name="make" value={form.make} onChange={change}>
          <option value="">Any make</option>
          {makes.map((make) => (
            <option key={make} value={make}>{make}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="body_type">Body type</label>
        <select id="body_type" name="body_type" value={form.body_type} onChange={change}>
          <option value="">Any body type</option>
          {BODY_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="fuel">Fuel</label>
          <select id="fuel" name="fuel" value={form.fuel} onChange={change}>
            <option value="">Any</option>
            {FUELS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="transmission">Gearbox</label>
          <select id="transmission" name="transmission" value={form.transmission} onChange={change}>
            <option value="">Any</option>
            {TRANSMISSIONS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="location">Location</label>
        <select id="location" name="location" value={form.location} onChange={change}>
          <option value="">Anywhere in Kenya</option>
          {LOCATIONS.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="min_price">Min price (KES)</label>
          <input id="min_price" name="min_price" type="number" min="0" step="50000"
            value={form.min_price} onChange={change} placeholder="0" />
        </div>
        <div className="field">
          <label htmlFor="max_price">Max price (KES)</label>
          <input id="max_price" name="max_price" type="number" min="0" step="50000"
            value={form.max_price} onChange={change} placeholder="Any" />
        </div>
      </div>

      <div className="field">
        <label htmlFor="sort">Sort by</label>
        <select id="sort" name="sort" value={form.sort} onChange={change}>
          <option value="newest">Newest first</option>
          <option value="price_low">Price: low to high</option>
          <option value="price_high">Price: high to low</option>
        </select>
      </div>

      <div className="button-row">
        <button type="submit" className="btn primary">Apply filters</button>
        <button type="button" className="btn outline" onClick={onReset}>Reset</button>
      </div>
    </form>
  )
}
