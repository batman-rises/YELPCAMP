import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import api from '../lib/api'
import { useToast } from '../context/ToastContext'
import CampgroundForm from '../components/campgrounds/CampgroundForm'
import { Skeleton } from '../components/ui/Skeleton'

export default function CampgroundEdit() {
  const { id }                          = useParams()
  const navigate                        = useNavigate()
  const { addToast }                    = useToast()
  const [campground, setCampground]     = useState(null)
  const [loading, setLoading]           = useState(true)
  const [submitting, setSubmitting]     = useState(false)

  useEffect(() => {
    api.get(`/campgrounds/${id}`)
      .then(res => setCampground(res.data.campground))
      .catch(() => {
        addToast('Campground not found', 'error')
        navigate('/campgrounds')
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (formData) => {
    setSubmitting(true)
    try {
      await api.put(`/campgrounds/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      addToast('Campground updated!')
      navigate(`/campgrounds/${id}`)
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update campground', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="page-container py-10 max-w-2xl mx-auto flex flex-col gap-5">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  )

  return (
    <div className="page-container py-10 max-w-2xl mx-auto">
      <Link to={`/campgrounds/${id}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-forest-700 mb-6 transition-colors">
        <ChevronLeft size={16} />
        Back to Campground
      </Link>

      <div className="mb-8">
        <h1 className="section-title mb-2">Edit Campground</h1>
        <p className="text-gray-500 text-sm">Update the details for <strong>{campground?.title}</strong></p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e3dfd7] p-6 sm:p-8 shadow-soft">
        <CampgroundForm
          initialData={campground}
          onSubmit={handleSubmit}
          submitLabel="Update Campground"
          loading={submitting}
        />
      </div>
    </div>
  )
}
