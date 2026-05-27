import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, BookOpen, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import type { Book } from '@/lib/api'

function formatAuthor(name: string): string {
  const parts = name.split(', ')
  return parts.length === 2 ? `${parts[1]} ${parts[0]}` : name
}

function BookCard({ book, onSelect }: { book: Book; onSelect: (b: Book) => void }) {
  const author = book.authors[0] ? formatAuthor(book.authors[0].name) : 'Unknown author'

  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
      onClick={() => onSelect(book)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(book)}
      aria-label={`Open ${book.title} by ${author}`}
    >
      <CardContent className="p-0">
        {/* Cover */}
        <div className="relative h-52 w-full overflow-hidden rounded-t-lg bg-muted">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={`Cover of ${book.title}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-1.5 p-3">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
            {book.title}
          </h3>
          <p className="truncate text-xs text-muted-foreground">{author}</p>
          {book.download_count != null && (
            <Badge variant="secondary" className="text-xs font-normal">
              {book.download_count.toLocaleString()} downloads
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function BookCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <Skeleton className="h-52 w-full rounded-t-lg rounded-b-none" />
        <div className="space-y-2 p-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      </CardContent>
    </Card>
  )
}

interface BookLibraryProps {
  onSelectBook: (book: Book) => void
}

export function BookLibrary({ onSelectBook }: BookLibraryProps) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ['books', 'search', debouncedSearch, page],
    queryFn: () =>
      api.books.search({
        q: debouncedSearch || undefined,
        page,
      }),
    placeholderData: (prev) => prev,
    staleTime: 2 * 60 * 1000,
  })

  const books = data?.results ?? []
  const hasNext = !!data?.next
  const hasPrev = !!data?.previous
  const totalCount = data?.count ?? 0

  return (
    <section>
      {/* Header row */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Library</h2>
          <p className="text-sm text-muted-foreground">
            {debouncedSearch
              ? `${totalCount.toLocaleString()} results for "${debouncedSearch}"`
              : 'Most popular books from Project Gutenberg'}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          {isFetching && !isLoading ? (
            <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : (
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          )}
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or author…"
            className="pl-9"
            aria-label="Search books"
          />
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-muted-foreground">Failed to load books. Please try again.</p>
        </div>
      )}

      {/* Book grid */}
      {!isError && (
        <div
          className={`grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 transition-opacity duration-200 ${
            isFetching && !isLoading ? 'opacity-60' : 'opacity-100'
          }`}
        >
          {isLoading
            ? Array.from({ length: 20 }).map((_, i) => <BookCardSkeleton key={i} />)
            : books.map((book) => (
                <BookCard key={book.id} book={book} onSelect={onSelectBook} />
              ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && books.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="font-medium text-foreground">No books found</p>
          <p className="text-sm text-muted-foreground">Try a different search term</p>
        </div>
      )}

      {/* Pagination */}
      {(hasNext || hasPrev) && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p - 1)}
            disabled={!hasPrev || isFetching}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-2">Page {page}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNext || isFetching}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </section>
  )
}
