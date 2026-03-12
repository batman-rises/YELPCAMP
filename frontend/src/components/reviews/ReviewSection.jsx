import { useState } from 'react'
import { User, Trash2, MessageSquare } from 'lucide-react'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { StarDisplay, StarPicker } from '../ui/StarRating'

export default function ReviewSection({ campgroundId, reviews, onReviewChange }) {
  const { currentUser }     = useAuth()
  const { addToast }        = useToast()
  const [rating, setRating] = useState(0)
  const [body, setBody]     = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) return addToast('Please select a rating', 'error')
    if (!body.trim()) return addToast('Please write a review', 'error')

    setSubmitting(true)
    try {
      await api.post(`/campgrounds/${campgroundId}/reviews`, {
        review: { rating, body }
      })
      addToast('Review posted!')
      setRating(0)
      setBody('')
      onReviewChange()
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit review', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (reviewId) => {
    try {
      await api.delete(`/campgrounds/${campgroundId}/reviews/${reviewId}`)
      addToast('Review deleted')
      onReviewChange()
    } catch {
      addToast('Failed to delete review', 'error')
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl text-forest-800 mb-5 flex items-center gap-2">
        <MessageSquare size={20} className="text-forest-500" />
        Reviews
        {reviews.length > 0 && (
          <span className="text-base text-gray-400 font-body font-normal">({reviews.length})</span>
        )}
      </h2>

      {/* Review form */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="bg-forest-50 border border-forest-100 rounded-2xl p-5 mb-6">
          <h3 className="font-medium text-forest-800 mb-4 text-sm">Leave a Review</h3>
          <div className="mb-4">
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Share your experience at this campground..."
            rows={3}
            className="input-field resize-none mb-4"
          />
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Posting...' : 'Post Review'}
          </button>
        </form>
      ) : (
        <div className="bg-gray-50 border border-[#e3dfd7] rounded-2xl p-5 mb-6 text-center text-sm text-gray-500">
          <a href="/login" className="text-forest-600 font-medium hover:underline">Login</a> to leave a review
        </div>
      )}

      {/* Review list */}
      {reviews.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">
          No reviews yet. Be the first to review this campground.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map(review => (
            <div key={review._id} className="bg-white border border-[#e3dfd7] rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-forest-100 rounded-full flex items-center justify-center">
                    <User size={15} className="text-forest-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {review.author?.username || 'Anonymous'}
                    </p>
                    <StarDisplay rating={review.rating} size={12} />
                  </div>
                </div>
                {currentUser && review.author?._id === currentUser._id && (
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              <p className="text-gray-600 text-sm mt-3 leading-relaxed">{review.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
