import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogIn, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const BG = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80'

export default function LoginPage() {
  const navigate           = useNavigate()
  const location           = useLocation()
  const { login }          = useAuth()
  const { addToast }       = useToast()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)

  const from = location.state?.from?.pathname || '/campgrounds'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(username, password)
      addToast(`Welcome back, ${username}!`)
      navigate(from, { replace: true })
    } catch (err) {
      addToast(err.response?.data?.message || 'Invalid username or password', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* Left — form */}
      <div className="flex items-center justify-center p-8 bg-[#f7f5f0]">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <Link to="/" className="font-display text-2xl text-forest-800">LetsCamp</Link>
            <h1 className="font-display text-3xl text-gray-900 mt-6 mb-1">Welcome back</h1>
            <p className="text-gray-500 text-sm">Sign in to continue your adventure</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="your username"
                className="input-field"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary mt-2 flex items-center justify-center gap-2">
              <LogIn size={15} />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-forest-700 font-medium hover:underline">Register</Link>
          </p>
        </div>
      </div>

      {/* Right — image */}
      <div className="hidden lg:block relative">
        <img src={BG} alt="Campground" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f7f5f0]/20 to-forest-950/40" />
        <div className="absolute bottom-12 left-12 text-white">
          <p className="font-display text-3xl italic font-light">"Into the forest I go,<br/>to lose my mind<br/>and find my soul."</p>
        </div>
      </div>
    </div>
  )
}
