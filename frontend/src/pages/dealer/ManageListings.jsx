import { useEffect, useState } from 'react'
import { api } from '../../api.js'
import CarPhoto from '../../components/CarPhoto.jsx'
import CarForm from '../../components/CarForm.jsx'
import Loader from '../../components/Loader.jsx'
import Notice from '../../components/Notice.jsx'
import { formatPrice } from '../../utils.js'

export default function ManageListings() {
  const [cars, setCars] = useState(null)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function load() {
    api('/my-cars').then((d) => setCars(d.items)).catch((e) => setError(e.message))
  }
  useEffect(load, [])

  async function save(values) {
    setBusy(true)
    setError('')
    try {
      if (editing.id) await api('/cars/' + editing.id, { method: 'PUT', body: values })
      else await api('/cars', { method: 'POST', body: values })
      setEditing(null)
      load()
    } catch (e) { setError(e.message) }
    setBusy(false)
  }

  async function remove(car) {
    if (!window.confirm('Delete this car?')) return
    try { await api('/cars/' + car.id, { method: 'DELETE' }); load() } catch (e) { setError(e.message) }
  }

  if (!cars && !error) return <Loader />

  return (
    <div className="page container">
      <div className="section-head">
        <div><h1 className="page-title">My cars</h1><p className="page-sub">The cars you sell.</p></div>
        {!editing && <button className="btn primary" onClick={() => setEditing({})}>+ Add a car</button>}
      </div>
      <Notice kind="error">{error}</Notice>

      {editing && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2>{editing.id ? 'Edit car' : 'Add a car'}</h2>
          <CarForm key={editing.id || 'new'} initial={editing.id ? editing : null} onSubmit={save} busy={busy} />
          <button className="btn outline" style={{ marginTop: '.8rem' }} onClick={() => setEditing(null)}>Cancel</button>
        </div>
      )}

      <div className="mini-list">
        {cars && cars.map((car) => (
          <div className="mini-car" key={car.id}>
            <div className="thumb"><CarPhoto car={car} /></div>
            <div className="info"><b>{car.year} {car.make} {car.model}</b><br />
              <span className="muted">{formatPrice(car.price)} · {car.location}</span></div>
            <div className="row-actions">
              <button className="btn blue small" onClick={() => { setEditing(car); window.scrollTo(0, 0) }}>Edit</button>
              <button className="btn outline danger-text small" onClick={() => remove(car)}>Delete</button>
            </div>
          </div>
        ))}
        {cars && cars.length === 0 && !editing && <div className="empty">No cars yet. Add your first one.</div>}
      </div>
    </div>
  )
}
