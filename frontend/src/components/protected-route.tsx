import { Navigate } from 'react-router-dom'
import { api } from '@/lib/api'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!api.auth.isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}
