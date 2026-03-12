import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, MapPin, Star, ArrowUpDown, X, Plus } from 'lucide-react'
import api from '../lib/api'
import ClusterMap from '../components/maps/ClusterMap'
import { StarDisplay } from '../components/ui/StarRating'
import { CampgroundCardSkeleton } from '../components/ui/Skeleton'
import { useAuth } from '../context/AuthContext'

const SORT_OPTIONS = [
  { value: '',           label: 'Default'     },
  { value: 'price_asc',  label: 'Price: Low'  },
  { value: 'price_desc', label: 'Price: High' },
]

const RATING_OPTIONS = [
  { value: '',    label: 'Any rating' },
  { value: '4.5', label: '4.5 +' },
  { value: '4',   label: '4.0 +'  },
  { value: '3.5', label: '3.5 +'  },
]

export default function CampgroundsIndex() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [campgrounds, setCampgrounds]   = useState([])
  const [geoJSON, setGeoJSON]           = useState({ type: 'FeatureCollection', features: [] })
  const [loading, setLoading]           = useState(true)
  const [showFilters, setShowFilters]   = useState(false)
  const { currentUser }                 = useAuth()

  const search   = searchParams.get('search')   || ''
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const sort     = searchParams.get('sort')     || ''
  const rating   = searchParams.get('rating')   || ''

  const fetchCampgrounds = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/campgrounds', { params: { search, minPrice, maxPrice, sort, rating } })
      setCampgrounds(res.data.campgrounds)
      setGeoJSON(res.data.geoJSON || { type: 'FeatureCollection', features: [] })
    } catch {
      setCampgrounds([])
    } finally {
      setLoading(false)
    }
  }, [search, minPrice, maxPrice, sort, rating])

  useEffect(() => { fetchCampgrounds() }, [fetchCampgrounds])

  const updateParam = (key, val) => {
    const params = new URLSearchParams(searchParams)
    if (val) params.set(key, val)
    else params.delete(key)
    setSearchParams(params)
  }

  const clearFilters = () => setSearchParams({})
  const hasFilters   = search || minPrice || maxPrice || sort || rating

  return (
    <div className="page-container py-10">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title mb-1">Campgrounds</h1>
          <p className="text-gray-500 text-sm">Discover India's finest camping spots</p>
        </div>
        {currentUser && (
          <Link to="/campgrounds/new" className="btn-primary inline-flex items-center gap-1.5 self-start">
            <Plus size={15} />
            Add Campground
          </Link>
        )}
      </div>

      {/* Search + filter bar */}
      <div className="bg-white border border-[#e3dfd7] rounded-2xl p-4 mb-6 shadow-soft">
        <div className="flex gap-3 flex-wrap items-end">

          {/* Search */}
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Search</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => updateParam('search', e.target.value)}
                placeholder="Name or location..."
                className="input-field pl-9"
              />
            </div>
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
              showFilters || hasFilters
                ? 'border-forest-600 bg-forest-50 text-forest-700'
                : 'border-[#e3dfd7] text-gray-600 hover:border-forest-400'
            }`}
          >
            <SlidersHorizontal size={15} />
            Filters
            {hasFilters && <span className="bg-forest-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">!</span>}
          </button>

          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 px-3 py-3 transition-colors">
              <X size={14} />
              Clear
            </button>
          )}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-[#e3dfd7] grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Min Price (₹)</label>
              <input type="number" value={minPrice} onChange={e => updateParam('minPrice', e.target.value)}
                placeholder="0" className="input-field" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Max Price (₹)</label>
              <input type="number" value={maxPrice} onChange={e => updateParam('maxPrice', e.target.value)}
                placeholder="5000" className="input-field" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Min Rating</label>
              <select value={rating} onChange={e => updateParam('rating', e.target.value)} className="input-field">
                {RATING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Sort By</label>
              <select value={sort} onChange={e => updateParam('sort', e.target.value)} className="input-field">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="mb-8">
        <ClusterMap geoJSON={geoJSON} />
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-gray-500 mb-5">
          {campgrounds.length} campground{campgrounds.length !== 1 ? 's' : ''} found
          {search && <span> for "<strong>{search}</strong>"</span>}
        </p>
      )}

      {/* Cards */}
      <div className="flex flex-col gap-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <CampgroundCardSkeleton key={i} />)
        ) : campgrounds.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#e3dfd7]">
            <MapPin size={40} className="text-forest-200 mx-auto mb-4" />
            <h3 className="font-display text-xl text-gray-600 mb-2">No campgrounds found</h3>
            <p className="text-gray-400 text-sm mb-6">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="btn-outline">Clear Filters</button>
          </div>
        ) : (
          campgrounds.map(camp => (
            <CampgroundCard key={camp._id} campground={camp} />
          ))
        )}
      </div>
    </div>
  )
}

function CampgroundCard({ campground }) {
  const imgSrc = campground.images?.[0]?.url || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=80'

  return (
    <div className="card card-hover group flex flex-col sm:flex-row overflow-hidden">
      <div className="sm:w-64 h-48 sm:h-auto shrink-0 overflow-hidden">
        <img
          src={imgSrc}
          alt={campground.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl text-forest-900 mb-1">{campground.title}</h2>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin size={13} />
              {campground.location}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-semibold text-forest-700">₹{campground.price?.toLocaleString('en-IN')}</div>
            <div className="text-xs text-gray-400">/ night</div>
          </div>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed mt-3 flex-1 line-clamp-2">
          {campground.description}
        </p>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#f0ede8]">
          <div className="flex items-center gap-2">
            {campground.avgRating ? (
              <>
                <StarDisplay rating={campground.avgRating} size={14} />
                <span className="text-sm font-medium text-gray-700">{campground.avgRating.toFixed(1)}</span>
                {campground.reviewCount > 0 && (
                  <span className="text-xs text-gray-400">({campground.reviewCount})</span>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-400 italic">No reviews yet</span>
            )}
          </div>
          <Link to={`/campgrounds/${campground._id}`} className="btn-primary">
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}
