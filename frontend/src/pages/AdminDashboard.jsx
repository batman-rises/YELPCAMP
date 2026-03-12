import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Users, Tent, BookMarked, IndianRupee, CheckCircle, XCircle, Clock, Trash2, Shield, AlertCircle, ClipboardList } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Skeleton } from '../components/ui/Skeleton'

const TABS = ['Overview', 'Campgrounds', 'Users', 'Bookings']

export default function AdminDashboard() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [tab, setTab] = useState('Overview')
  const [stats, setStats] = useState(null)
  const [campgrounds, setCampgrounds] = useState([])
  const [users, setUsers] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return navigate('/login')
    if (currentUser.role !== 'admin') {
      addToast('Admins only!', 'error')
      return navigate('/')
    }
    fetchAll()
  }, [currentUser])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [s, c, u, b] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/campgrounds'),
        api.get('/admin/users'),
        api.get('/admin/bookings'),
      ])
      setStats(s.data)
      setCampgrounds(c.data.campgrounds)
      setUsers(u.data.users)
      setBookings(b.data.bookings)
    } catch {
      addToast('Failed to load dashboard', 'error')
    } finally {
      setLoading(false)
    }
  }

  const approveCamp = async (id) => {
    await api.patch(`/admin/campgrounds/${id}/approve`)
    addToast('Campground approved!')
    fetchAll()
  }

  const rejectCamp = async (id) => {
    await api.patch(`/admin/campgrounds/${id}/reject`)
    addToast('Campground rejected')
    fetchAll()
  }

  const deleteCamp = async (id) => {
    if (!confirm('Delete this campground?')) return
    await api.delete(`/admin/campgrounds/${id}`)
    addToast('Campground deleted')
    fetchAll()
  }

  const changeRole = async (id, role) => {
    await api.patch(`/admin/users/${id}/role`, { role })
    addToast(`Role updated to ${role}`)
    fetchAll()
  }

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return
    await api.delete(`/admin/users/${id}`)
    addToast('User deleted')
    fetchAll()
  }

  if (loading) return (
    <div className="page-container py-10">
      <Skeleton className="h-8 w-64 mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  )

  return (
    <div className="page-container py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-forest-700 p-2.5 rounded-xl">
          <Shield size={22} className="text-white" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-forest-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Manage your LetsCamp platform</p>
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="blue" />
          <StatCard icon={Tent} label="Campgrounds" value={stats.totalCampgrounds} sub={`${stats.pendingCampgrounds} pending`} color="green" />
          <StatCard icon={BookMarked} label="Bookings" value={stats.totalBookings} sub={`${stats.pendingBookings} pending`} color="amber" />
          <StatCard icon={IndianRupee} label="Revenue" value={`₹${(stats.totalRevenue / 100).toFixed(0)}`} sub="platform fees" color="purple" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-[#f0ece4] p-1 rounded-xl mb-6 w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-white text-forest-800 shadow-sm' : 'text-gray-500 hover:text-forest-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'Overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pending campgrounds */}
          <div className="bg-white rounded-2xl border border-[#e3dfd7] p-5">
            <h2 className="font-display text-lg text-forest-800 mb-4 flex items-center gap-2"><AlertCircle size={18} className="text-amber-500" /> Pending Campgrounds</h2>
            {campgrounds.filter(c => c.status === 'pending').length === 0
              ? <p className="text-gray-400 text-sm">No pending campgrounds</p>
              : campgrounds.filter(c => c.status === 'pending').slice(0, 5).map(c => (
                <div key={c._id} className="flex items-center justify-between py-2 border-b border-[#f0ece4] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-forest-800">{c.title}</p>
                    <p className="text-xs text-gray-400">{c.location} · by {c.author?.username}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => approveCamp(c._id)} className="text-green-600 hover:bg-green-50 p-1.5 rounded-lg"><CheckCircle size={16} /></button>
                    <button onClick={() => rejectCamp(c._id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"><XCircle size={16} /></button>
                  </div>
                </div>
              ))
            }
          </div>

          {/* Recent bookings */}
          <div className="bg-white rounded-2xl border border-[#e3dfd7] p-5">
            <h2 className="font-display text-lg text-forest-800 mb-4 flex items-center gap-2"><ClipboardList size={18} className="text-forest-600" /> Recent Bookings</h2>
            {bookings.slice(0, 5).map(b => (
              <div key={b._id} className="flex items-center justify-between py-2 border-b border-[#f0ece4] last:border-0">
                <div>
                  <p className="text-sm font-medium text-forest-800">{b.campground?.title || 'Unknown'}</p>
                  <p className="text-xs text-gray-400">by {b.tourist?.username} · {b.nights} night{b.nights !== 1 ? 's' : ''}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campgrounds Tab */}
      {tab === 'Campgrounds' && (
        <div className="bg-white rounded-2xl border border-[#e3dfd7] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#f0ece4]">
              <tr>
                <th className="text-left px-4 py-3 text-forest-700 font-medium">Campground</th>
                <th className="text-left px-4 py-3 text-forest-700 font-medium hidden md:table-cell">Owner</th>
                <th className="text-left px-4 py-3 text-forest-700 font-medium hidden md:table-cell">Price</th>
                <th className="text-left px-4 py-3 text-forest-700 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-forest-700 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campgrounds.map(c => (
                <tr key={c._id} className="border-t border-[#f0ece4] hover:bg-[#faf8f5]">
                  <td className="px-4 py-3">
                    <Link to={`/campgrounds/${c._id}`} className="font-medium text-forest-800 hover:text-forest-600">{c.title}</Link>
                    <p className="text-xs text-gray-400">{c.location}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500">{c.author?.username || '—'}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500">₹{c.price}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {c.status === 'pending' && <>
                        <button onClick={() => approveCamp(c._id)} className="text-green-600 hover:bg-green-50 p-1.5 rounded-lg" title="Approve"><CheckCircle size={15} /></button>
                        <button onClick={() => rejectCamp(c._id)} className="text-amber-500 hover:bg-amber-50 p-1.5 rounded-lg" title="Reject"><XCircle size={15} /></button>
                      </>}
                      {c.status === 'approved' && <button onClick={() => rejectCamp(c._id)} className="text-amber-500 hover:bg-amber-50 p-1.5 rounded-lg" title="Revoke"><XCircle size={15} /></button>}
                      {c.status === 'rejected' && <button onClick={() => approveCamp(c._id)} className="text-green-600 hover:bg-green-50 p-1.5 rounded-lg" title="Approve"><CheckCircle size={15} /></button>}
                      <button onClick={() => deleteCamp(c._id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg" title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Users Tab */}
      {tab === 'Users' && (
        <div className="bg-white rounded-2xl border border-[#e3dfd7] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#f0ece4]">
              <tr>
                <th className="text-left px-4 py-3 text-forest-700 font-medium">User</th>
                <th className="text-left px-4 py-3 text-forest-700 font-medium hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-forest-700 font-medium">Role</th>
                <th className="text-left px-4 py-3 text-forest-700 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-t border-[#f0ece4] hover:bg-[#faf8f5]">
                  <td className="px-4 py-3 font-medium text-forest-800">{u.username}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <RoleSelect current={u.role} onChange={(role) => changeRole(u._id, role)} disabled={u._id === currentUser?._id} />
                  </td>
                  <td className="px-4 py-3">
                    {u._id !== currentUser?._id && (
                      <button onClick={() => deleteUser(u._id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"><Trash2 size={15} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bookings Tab */}
      {tab === 'Bookings' && (
        <div className="bg-white rounded-2xl border border-[#e3dfd7] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#f0ece4]">
              <tr>
                <th className="text-left px-4 py-3 text-forest-700 font-medium">Campground</th>
                <th className="text-left px-4 py-3 text-forest-700 font-medium hidden md:table-cell">Tourist</th>
                <th className="text-left px-4 py-3 text-forest-700 font-medium hidden md:table-cell">Dates</th>
                <th className="text-left px-4 py-3 text-forest-700 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-forest-700 font-medium hidden md:table-cell">Fee</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b._id} className="border-t border-[#f0ece4] hover:bg-[#faf8f5]">
                  <td className="px-4 py-3 font-medium text-forest-800">{b.campground?.title || '—'}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500">{b.tourist?.username || '—'}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-400 text-xs">
                    {new Date(b.checkIn).toLocaleDateString('en-IN')} → {new Date(b.checkOut).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500">₹{(b.platformFee / 100).toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  return (
    <div className="bg-white rounded-2xl border border-[#e3dfd7] p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-display text-forest-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    confirmed: 'bg-green-50 text-green-700 border-green-200',
    approved:  'bg-green-50 text-green-700 border-green-200',
    pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
    rejected:  'bg-red-50 text-red-700 border-red-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
  }
  const icons = {
    confirmed: <CheckCircle size={11} />,
    approved:  <CheckCircle size={11} />,
    pending:   <Clock size={11} />,
    rejected:  <XCircle size={11} />,
    cancelled: <XCircle size={11} />,
  }
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${styles[status] || styles.pending}`}>
      {icons[status]} {status}
    </span>
  )
}

function RoleSelect({ current, onChange, disabled }) {
  const colors = { admin: 'text-purple-700 bg-purple-50', owner: 'text-blue-700 bg-blue-50', tourist: 'text-gray-700 bg-gray-50' }
  return (
    <select
      value={current}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border-0 cursor-pointer ${colors[current] || colors.tourist}`}
    >
      <option value="tourist">Tourist</option>
      <option value="owner">Owner</option>
      <option value="admin">Admin</option>
    </select>
  )
}
