import { Link } from 'react-router-dom'
import { Tent, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center text-center px-4">
      <div>
        <Tent size={56} className="text-forest-200 mx-auto mb-6" />
        <h1 className="font-display text-6xl text-forest-900 mb-3">404</h1>
        <p className="font-display text-2xl text-gray-600 mb-2">Lost in the wilderness</p>
        <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">
          The page you're looking for doesn't exist. Maybe it was washed away by a river.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={15} />
          Back to Base Camp
        </Link>
      </div>
    </div>
  )
}
