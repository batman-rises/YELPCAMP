import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import CampgroundsIndex from './pages/CampgroundsIndex'
import CampgroundShow from './pages/CampgroundShow'
import CampgroundNew from './pages/CampgroundNew'
import CampgroundEdit from './pages/CampgroundEdit'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import FavoritesPage from './pages/FavoritesPage'
import MyBookingsPage from './pages/MyBookingsPage'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './components/layout/ProtectedRoute'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="campgrounds" element={<CampgroundsIndex />} />
            <Route path="campgrounds/:id" element={<CampgroundShow />} />
            <Route path="campgrounds/new" element={
              <ProtectedRoute><CampgroundNew /></ProtectedRoute>
            } />
            <Route path="campgrounds/:id/edit" element={
              <ProtectedRoute><CampgroundEdit /></ProtectedRoute>
            } />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="favorites" element={
              <ProtectedRoute><FavoritesPage /></ProtectedRoute>
            } />
            <Route path="my-bookings" element={
              <ProtectedRoute><MyBookingsPage /></ProtectedRoute>
            } />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
