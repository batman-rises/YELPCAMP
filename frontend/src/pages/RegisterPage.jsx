import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const BG = 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80'

export default function RegisterPage() {
  const navigate         = useNavigate()
  const { register }     = useAuth()
  const { addToast }     = useToast()
  const [form, setForm]  = useState({ username: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      addToast(`Welcome to LetsCamp, ${form.username}!`)
      navigate('/campgrounds')
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* Left — image */}
      <div className="hidden lg:block relative">
        <img src={BG} alt="Campground" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-l from-[#f7f5f0]/20 to-forest-950/50" />
        <div className="absolute bottom-12 left-12 text-white max-w-xs">
          <p className="font-display text-2xl italic font-light leading-snug">
            "Not all those who wander are lost — but they do need a good campground."
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-8 bg-[#f7f5f0]">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <Link to="/" className="font-display text-2xl text-forest-800">LetsCamp</Link>
            <h1 className="font-display text-3xl text-gray-900 mt-6 mb-1">Create account</h1>
            <p className="text-gray-500 text-sm">Join thousands of explorers on LetsCamp</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <input
                type="text" value={form.username} onChange={set('username')}
                placeholder="explorerName" className="input-field" autoFocus required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email" value={form.email} onChange={set('email')}
                placeholder="you@example.com" className="input-field" required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="••••••••" className="input-field pr-10" required
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary mt-2 flex items-center justify-center gap-2">
              <UserPlus size={15} />
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-forest-700 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
