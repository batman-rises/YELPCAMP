import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MapPin, ArrowRight, HeartOff } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { CampgroundCardSkeleton } from '../components/ui/Skeleton'

export default function FavoritesPage() {
  const { currentUser, setCurrentUser } = useAuth()
  const { addToast }                    = useToast()
  const [favorites, setFavorites]       = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    api.get('/favorites')
      .then(res => setFavorites(res.data.favorites))
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false))
  }, [])

  const removeFavorite = async (campId) => {
    try {
      const res = await api.post(`/campgrounds/${campId}/favorite`)
      setCurrentUser(res.data.user)
      setFavorites(prev => prev.filter(c => c._id !== campId))
      addToast('Removed from favorites')
    } catch {
      addToast('Failed to remove', 'error')
    }
  }

  return (
    <div className="page-container py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-red-50 p-2.5 rounded-xl">
          <Heart size={22} className="text-red-400 fill-red-400" />
        </div>
        <div>
          <h1 className="section-title">My Favorites</h1>
          <p className="text-gray-500 text-sm">Campgrounds you've saved</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-5">
          {Array.from({ length: 3 }).map((_, i) => <CampgroundCardSkeleton key={i} />)}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-[#e3dfd7]">
          <HeartOff size={44} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-display text-xl text-gray-500 mb-2">No favorites yet</h3>
          <p className="text-gray-400 text-sm mb-6">Save campgrounds you love to find them easily</p>
          <Link to="/campgrounds" className="btn-primary inline-flex items-center gap-2">
            Explore Campgrounds
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {favorites.map(camp => (
            <div key={camp._id} className="card card-hover group">
              <div className="h-44 overflow-hidden relative">
                <img
                  src={camp.images?.[0]?.url || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600'}
                  alt={camp.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={() => removeFavorite(camp._id)}
                  className="absolute top-3 right-3 bg-white/90 hover:bg-white text-red-400 p-1.5 rounded-full shadow-sm transition-all"
                  title="Remove from favorites"
                >
                  <Heart size={15} className="fill-red-400" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-display text-lg text-forest-900 mb-1">{camp.title}</h3>
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                  <MapPin size={13} />
                  {camp.location}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-forest-700 text-sm">
                    ₹{camp.price?.toLocaleString('en-IN')}<span className="text-gray-400 font-normal">/night</span>
                  </span>
                  <Link to={`/campgrounds/${camp._id}`} className="btn-primary py-1.5 text-xs flex items-center gap-1">
                    View
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
