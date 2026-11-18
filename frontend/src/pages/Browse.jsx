import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api, toQuery } from '../api.js'
import CarCard from '../components/CarCard.jsx'
import FilterPanel from '../components/FilterPanel.jsx'
import Loader from '../components/Loader.jsx'
import Notice from '../components/Notice.jsx'

const EMPTY = { q: '', make: '', body_type: '', fuel: '', transmission: '', location: '', min_price: '', max_price: '', sort: 'newest' }

export default function Browse() {
  const [params, setParams] = useSearchParams()
  const filters = { ...EMPTY }
  Object.keys(EMPTY).forEach((key) => { filters[key] = params.get(key) || EMPTY[key] })
  const page = Number(params.get('page')) || 1

  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setResult(null)
    setError('')
    const query = toQuery({ ...filters, page, per_page: 9, sort: filters.sort === 'newest' ? '' : filters.sort })
    api('/cars' + query).then(setResult).catch((e) => setError(e.message))
  }, [params])

  function apply(values) {
    const next = {}
    Object.entries(values).forEach(([k, v]) => { if (v) next[k] = v })
    setParams(next)
  }

  function goTo(number) {
    const next = Object.fromEntries(params)
    next.page = number
    setParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="page container">
      <h1 className="page-title">Browse cars</h1>
      <p className="page-sub">Find a car, then ask dealers for their best offer.</p>

      <div className="browse-layout">
        <FilterPanel filters={filters} onApply={apply} onReset={() => setParams({})} />

        <section>
          <Notice kind="error">{error}</Notice>
          {!result && !error && <Loader />}
          {result && (
            <>
              <div className="results-bar"><b>{result.total} car{result.total === 1 ? '' : 's'} found</b></div>
              {result.items.length === 0 ? (
                <div className="empty"><h3>No cars match</h3><p>Try removing some filters.</p></div>
              ) : (
                <div className="car-grid">
                  {result.items.map((car) => <CarCard key={car.id} car={car} />)}
                </div>
              )}
              {result.pages > 1 && (
                <div className="pager">
                  <button className="btn outline small" disabled={page <= 1} onClick={() => goTo(page - 1)}>Previous</button>
                  <span>Page {result.page} of {result.pages}</span>
                  <button className="btn outline small" disabled={page >= result.pages} onClick={() => goTo(page + 1)}>Next</button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
