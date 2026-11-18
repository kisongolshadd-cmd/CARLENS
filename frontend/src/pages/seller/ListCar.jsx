import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api.js'
import CarForm from '../../components/CarForm.jsx'
import Loader from '../../components/Loader.jsx'
import Notice from '../../components/Notice.jsx'

export default function ListCar() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [car, setCar] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (id) api('/cars/' + id).then((d) => setCar(d.car)).catch((e) => setError(e.message))
  }, [id])

  async function save(values) {
    setBusy(true)
    setError('')
    try {
      if (id) await api('/cars/' + id, { method: 'PUT', body: values })
      else await api('/cars', { method: 'POST', body: values })
      navigate('/seller/listings')
    } catch (e) {
      setError(e.message)
      setBusy(false)
    }
  }

  if (id && !car && !error) return <Loader />

  return (
    <div className="page container" style={{ maxWidth: 820 }}>
      <h1 className="page-title">{id ? 'Edit your car' : 'Sell your car'}</h1>
      <p className="page-sub">Our admin checks every listing before dealers can see it.</p>
      <Notice kind="error">{error}</Notice>
      <CarForm initial={car} onSubmit={save} busy={busy} submitLabel={id ? 'Save changes' : 'Submit for approval'} />
    </div>
  )
}
