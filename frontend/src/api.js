const BASE = '/api'

export function getToken() {
  try {
    return localStorage.getItem('token')
  } catch {
    return null
  }
}

export function saveToken(token) {
  try {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  } catch {
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = {}
  const isForm = body instanceof FormData
  if (body && !isForm) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers.Authorization = 'Bearer ' + token

  let response
  try {
    response = await fetch(BASE + path, {
      method,
      headers,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    })
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?')
  }

  let data = {}
  try {
    data = await response.json()
  } catch {
  }

  if (!response.ok) {
    const error = new Error(data.error || 'Something went wrong')
    error.status = response.status
    throw error
  }
  return data
}

export function toQuery(values) {
  const params = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) params.set(key, value)
  })
  const text = params.toString()
  return text ? '?' + text : ''
}

export async function uploadPhoto(file) {
  const form = new FormData()
  form.append('photo', file)
  const token = getToken()
  let response
  try {
    response = await fetch(BASE + '/uploads', {
      method: 'POST',
      headers: token ? { Authorization: 'Bearer ' + token } : {},
      body: form,
    })
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?')
  }
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Could not upload the photo')
  return data.url
}

export async function openLicence(dealerId) {
  const tab = window.open('', '_blank')
  const token = getToken()
  try {
    const response = await fetch(BASE + `/admin/dealers/${dealerId}/licence`, {
      headers: { Authorization: 'Bearer ' + token },
    })
    if (!response.ok) throw new Error('No licence found')
    const blob = await response.blob()
    tab.location = URL.createObjectURL(blob)
  } catch (e) {
    if (tab) tab.close()
    throw e
  }
}
