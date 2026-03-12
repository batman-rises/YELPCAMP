import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import api from '../lib/api'
import { useToast } from '../context/ToastContext'
import CampgroundForm from '../components/campgrounds/CampgroundForm'

export default function CampgroundNew() {
  const navigate       = useNavigate()
  const { addToast }   = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData) => {
    setLoading(true)
    try {
      const res = await api.post('/campgrounds', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      addToast('Campground created successfully!')
      navigate(`/campgrounds/${res.data.campground._id}`)
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create campground', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container py-10 max-w-2xl mx-auto">
      <Link to="/campgrounds" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-forest-700 mb-6 transition-colors">
        <ChevronLeft size={16} />
        Back to Campgrounds
      </Link>

      <div className="mb-8">
        <h1 className="section-title mb-2">Add a Campground</h1>
        <p className="text-gray-500 text-sm">Share a camping spot you love with the LetsCamp community</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e3dfd7] p-6 sm:p-8 shadow-soft">
        <CampgroundForm
          onSubmit={handleSubmit}
          submitLabel="Create Campground"
          loading={loading}
        />
      </div>
    </div>
  )
}
