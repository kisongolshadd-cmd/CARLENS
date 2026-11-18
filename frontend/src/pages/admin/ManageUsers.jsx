import { useEffect, useState } from 'react'
import { api } from '../../api.js'
import Loader from '../../components/Loader.jsx'
import Notice from '../../components/Notice.jsx'
import { formatDate } from '../../utils.js'

export default function ManageUsers() {
  const [users, setUsers] = useState(null)
  const [role, setRole] = useState('all')
  const [error, setError] = useState('')

  function load() {
    api('/admin/users').then((d) => setUsers(d.items)).catch((e) => setError(e.message))
  }
  useEffect(load, [])

  async function toggle(user) {
    try {
      await api(`/admin/users/${user.id}/${user.is_active ? 'block' : 'unblock'}`, { method: 'POST' })
      load()
    } catch (e) { setError(e.message) }
  }

  if (!users && !error) return <Loader />
  const shown = (users || []).filter((u) => role === 'all' || u.role === role)

  return (
    <div className="page container">
      <h1 className="page-title">Manage users</h1>
      <div className="tabs">
        {['all', 'buyer', 'seller', 'dealer', 'admin'].map((r) => (
          <button key={r} className={role === r ? 'chosen' : ''} onClick={() => setRole(r)}>{r}</button>
        ))}
      </div>
      <Notice kind="error">{error}</Notice>
      <div className="table-wrap"><table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {shown.map((u) => (
            <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td><span className="badge violet">{u.role}</span></td>
              <td>{formatDate(u.created_at)}</td>
              <td><span className={`badge ${u.is_active ? 'green' : 'red'}`}>{u.is_active ? 'Active' : 'Blocked'}</span></td>
              <td>{u.role !== 'admin' && (
                <button className={`btn small ${u.is_active ? 'outline danger-text' : 'success'}`} onClick={() => toggle(u)}>
                  {u.is_active ? 'Block' : 'Unblock'}</button>)}</td></tr>
          ))}
        </tbody></table></div>
    </div>
  )
}
