import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()
  const location = useLocation()

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
