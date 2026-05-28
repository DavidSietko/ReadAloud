const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getToken(): string | null {
  return localStorage.getItem('access_token')
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...init?.headers },
  })
  if (res.status === 401) {
    localStorage.removeItem('access_token')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json() as Promise<T>
}

export interface ReadingProgressData {
  gutenberg_id: number
  current_chunk: number
  progress: number
  last_read_at: string
}

export const api = {
  auth: {
    loginGoogle() {
      window.location.href = `${API_URL}/auth/google`
    },
    logout() {
      localStorage.removeItem('access_token')
    },
    setToken(token: string) {
      localStorage.setItem('access_token', token)
    },
    getToken,
    isAuthenticated() {
      return !!getToken()
    },
  },

  users: {
    me: () => request<UserProfile>('/users/me'),
    getProgress: (bookId: number) =>
      request<ReadingProgressData | null>(`/users/progress/${bookId}`),
    saveProgress: (bookId: number, data: { current_chunk: number; progress: number }) =>
      request<ReadingProgressData>(`/users/progress/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
  },

  books: {
    search: (params: BookSearchParams) => {
      const q = new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v != null)
          .map(([k, v]) => [k, String(v)])
      )
      return request<BookSearchResponse>(`/books/search?${q}`)
    },
    get: (id: number) => request<Book>(`/books/${id}`),
    getText: (id: number, chunk = 0) =>
      request<BookTextResponse>(`/books/${id}/text?chunk=${chunk}`),
  },

  ai: {
    chat: (req: ChatRequest) =>
      fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      }),
  },
}

// --- Types ---

export interface UserProfile {
  id: number
  email: string
  name: string
  avatar_url: string | null
  created_at: string
}

export interface BookAuthor {
  name: string
  birth_year: number | null
  death_year: number | null
}

export interface BookFormats {
  epub: string | null
  text: string | null
  html: string | null
}

export interface Book {
  id: number
  title: string
  authors: BookAuthor[]
  subjects: string[]
  languages: string[]
  download_count: number | null
  cover_url: string | null
  formats: BookFormats
}

export interface BookSearchParams {
  q?: string
  topic?: string
  language?: string
  page?: number
}

export interface BookSearchResponse {
  count: number
  next: string | null
  previous: string | null
  results: Book[]
}

export interface BookTextResponse {
  book_id: number
  chunk: number
  total_chunks: number
  content: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  book_id: number
  message: string
  book_context: string
  history: ChatMessage[]
}