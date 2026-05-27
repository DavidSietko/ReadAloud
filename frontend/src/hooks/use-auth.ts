import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useAuth() {
  const queryClient = useQueryClient()

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: api.users.me,
    enabled: api.auth.isAuthenticated(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  function logout() {
    api.auth.logout()
    queryClient.clear()
    window.location.href = '/login'
  }

  return {
    user: user ?? null,
    isLoading: api.auth.isAuthenticated() && isLoading,
    isAuthenticated: !!user,
    logout,
  }
}
