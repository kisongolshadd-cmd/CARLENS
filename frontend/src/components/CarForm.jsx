import { useEffect, useState } from 'react'
import { uploadPhoto } from '../api.js'
import { getMakes, getModels } from '../externalApi.js'
import { BODY_TYPES, CAR_COLORS, FUELS, LOCATIONS, TRANSMISSIONS } from '../utils.js'

const EMPTY = {
  make: '', model: '', year: '', price: '', mileage: '', fuel: 'Petrol',
  transmission: 'Automatic', body_type: 'SUV', location: '', color: CAR_COLORS[0],
  image_url: '', description: '',
}

export default function CarForm({ initial, onSubmit, submitLabel = 'Save car', busy }) {
  const [form, setForm] = useState({ ...EMPTY, ...(initial || {}) })
  const [makes, setMakes] = useState([])
  const [models, setModels] = useState([])
  const [photos, setPhotos] = useState(initial?.images || [])
  const [uploading, setUploading] = useState(false)
  const [photoError, setPhotoError] = useState('')

  useEffect(() => {
    getMakes().then(setMakes)
  }, [])

  useEffect(() => {
    getModels(form.make).then(setModels)
  }, [form.make])

  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function addPhotos(event) {
    const files = Array.from(event.target.files).slice(0, 6 - photos.length)
    event.target.value = ''
    if (files.length === 0) return
    setUploading(true)
    setPhotoError('')
    const added = []
    for (const file of files) {
      try {
        added.push(await uploadPhoto(file))
      } catch (e) {
        setPhotoError(e.message)
      }
    }
    setPhotos((old) => [...old, ...added])
    setUploading(false)
  }

  function removePhoto(link) {
    setPhotos(photos.filter((p) => p !== link))
  }

  function makeMain(link) {
    setPhotos([link, ...photos.filter((p) => p !== link)])
  }

  function submit(event) {
    event.preventDefault()
    onSubmit({
      make: form.make,
      model: form.model,
      year: form.year,
      price: form.price,
      mileage: form.mileage === '' || form.mileage === null ? 0 : form.mileage,
      fuel: form.fuel,
      transmission: form.transmission,
      body_type: form.body_type,
      location: form.location || '',
      color: form.color,
      image_url: photos[0] || '',
      gallery: photos.slice(1),
      description: form.description || '',
    })
  }

  return (
    <form className="panel form-grid" onSubmit={submit}>
      <div className="field">
        <label htmlFor="make">Make</label>
        <input id="make" name="make" list="make-list" value={form.make} onChange={change}
          placeholder="Toyota" required />
        <datalist id="make-list">
          {makes.map((make) => <option key={make} value={make} />)}
        </datalist>
      </div>

      <div className="field">
        <label htmlFor="model">Model</label>
        <input id="model" name="model" list="model-list" value={form.model} onChange={change}
          placeholder="Prado" required />
        <datalist id="model-list">
          {models.slice(0, 80).map((model) => <option key={model} value={model} />)}
        </datalist>
      </div>

      <div className="field">
        <label htmlFor="year">Year</label>
        <input id="year" name="year" type="number" min="1980" max="2027" value={form.year}
          onChange={change} placeholder="2018" required />
      </div>

      <div className="field">
        <label htmlFor="price">Price (KES)</label>
        <input id="price" name="price" type="number" min="1" value={form.price}
          onChange={change} placeholder="2500000" required />
      </div>

      <div className="field">
        <label htmlFor="mileage">Mileage (km)</label>
        <input id="mileage" name="mileage" type="number" min="0" value={form.mileage ?? ''}
          onChange={change} placeholder="65000" />
      </div>

      <div className="field">
        <label htmlFor="location">Location</label>
        <input id="location" name="location" list="location-list" value={form.location || ''}
          onChange={change} placeholder="Nairobi" />
        <datalist id="location-list">
          {LOCATIONS.map((place) => <option key={place} value={place} />)}
        </datalist>
      </div>

      <div className="field">
        <label htmlFor="fuel">Fuel</label>
        <select id="fuel" name="fuel" value={form.fuel || ''} onChange={change}>
          {FUELS.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      <div className="field">
        <label htmlFor="transmission">Gearbox</label>
        <select id="transmission" name="transmission" value={form.transmission || ''} onChange={change}>
          {TRANSMISSIONS.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      <div className="field">
        <label htmlFor="body_type">Body type</label>
        <select id="body_type" name="body_type" value={form.body_type || ''} onChange={change}>
          {BODY_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      <div className="field full">
        <label htmlFor="photos">Photos (up to 6, the first one is the main photo)</label>
        <input id="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple
          onChange={addPhotos} disabled={uploading || photos.length >= 6} />
        {uploading && <span className="muted">Uploading...</span>}
        {photoError && <span className="photo-error">{photoError}</span>}
        <div className="photo-grid">
          {photos.map((link, index) => (
            <div className="photo-item" key={link}>
              <img src={link} alt={`Car photo ${index + 1}`} />
              {index === 0 ? <span className="main-tag">Main</span> : (
                <button type="button" className="btn small accent" onClick={() => makeMain(link)}>Make main</button>
              )}
              <button type="button" className="photo-remove" onClick={() => removePhoto(link)} aria-label="Remove photo">x</button>
            </div>
          ))}
        </div>
      </div>

      <fieldset className="field full swatches">
        <legend>Backdrop colour</legend>
        <div className="swatch-row">
          {CAR_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`swatch ${form.color === color ? 'chosen' : ''}`}
              style={{ background: color }}
              onClick={() => setForm({ ...form, color })}
              aria-label={`Colour ${color}`}
              aria-pressed={form.color === color}
            />
          ))}
        </div>
      </fieldset>

      <div className="field full">
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" rows="4" value={form.description || ''}
          onChange={change} placeholder="Tell buyers about the condition, service history and extras." />
      </div>

      <div className="full">
        <button type="submit" className="btn primary" disabled={busy}>
          {busy ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
