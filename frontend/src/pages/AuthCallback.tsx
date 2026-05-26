import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      api.auth.setToken(token)
    }
    navigate('/', { replace: true })
  }, [navigate])

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-muted-foreground">Signing you in…</p>
    </div>
  )
}