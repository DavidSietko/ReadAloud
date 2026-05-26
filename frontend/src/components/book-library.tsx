import { Book, Headphones, Upload, Search, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Book as BookType } from '@/lib/api'

const sampleBooks: BookType[] = [
  {
    id: 64317,
    title: 'The Great Gatsby',
    authors: [{ name: 'Fitzgerald, F. Scott', birth_year: 1896, death_year: 1940 }],
    subjects: ['Fiction'],
    languages: ['en'],
    download_count: null,
    cover_url: 'https://www.gutenberg.org/cache/epub/64317/pg64317.cover.medium.jpg',
    formats: { epub: null, text: null, html: null },
  },
  {
    id: 1342,
    title: 'Pride and Prejudice',
    authors: [{ name: 'Austen, Jane', birth_year: 1775, death_year: 1817 }],
    subjects: ['Fiction'],
    languages: ['en'],
    download_count: null,
    cover_url: 'https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg',
    formats: { epub: null, text: null, html: null },
  },
  {
    id: 84,
    title: 'Frankenstein',
    authors: [{ name: 'Shelley, Mary Wollstonecraft', birth_year: 1797, death_year: 1851 }],
    subjects: ['Fiction'],
    languages: ['en'],
    download_count: null,
    cover_url: 'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg',
    formats: { epub: null, text: null, html: null },
  },
  {
    id: 1952,
    title: 'The Yellow Wallpaper',
    authors: [{ name: 'Gilman, Charlotte Perkins', birth_year: 1860, death_year: 1935 }],
    subjects: ['Fiction'],
    languages: ['en'],
    download_count: null,
    cover_url: 'https://www.gutenberg.org/cache/epub/1952/pg1952.cover.medium.jpg',
    formats: { epub: null, text: null, html: null },
  },
]

interface BookLibraryProps {
  onSelectBook: (book: BookType) => void
}

function BookCard({ book, onSelect }: { book: BookType; onSelect: (b: BookType) => void }) {
  const firstAuthor = book.authors[0]?.name ?? 'Unknown'

  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
      onClick={() => onSelect(book)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(book)}
      aria-label={`Open ${book.title} by ${firstAuthor}`}
    >
      <CardContent className="p-4">
        <div className="relative mb-4 h-40 w-full overflow-hidden rounded-lg bg-muted">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={`Cover of ${book.title}`}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Book className="h-12 w-12 text-muted-foreground/40" />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-medium text-foreground">{book.title}</h3>
              <p className="truncate text-sm text-muted-foreground">{firstAuthor}</p>
            </div>
            <Badge variant="secondary" className="shrink-0">
              <Book className="mr-1 h-3 w-3" />
              Text
            </Badge>
          </div>
          {book.download_count != null && (
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {book.download_count.toLocaleString()} downloads
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function BookLibrary({ onSelectBook }: BookLibraryProps) {
  return (
    <section id="library" className="py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Your Library</h2>
          <p className="text-sm text-muted-foreground">Choose a book to read together</p>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search books…" className="pl-9" aria-label="Search your library" />
          </div>
          <Button variant="outline" size="icon" aria-label="Upload new content">
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="ebooks">E-Books</TabsTrigger>
          <TabsTrigger value="audiobooks">Audiobooks</TabsTrigger>
          <TabsTrigger value="custom">My Text</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sampleBooks.map((book) => (
              <BookCard key={book.id} book={book} onSelect={onSelectBook} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ebooks" className="mt-0">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sampleBooks.map((book) => (
              <BookCard key={book.id} book={book} onSelect={onSelectBook} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audiobooks" className="mt-0">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Headphones className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">Audiobooks coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="custom" className="mt-0">
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 font-medium text-foreground">Add Your Own Text</h3>
              <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                Paste text, upload a file, or enter a URL to have your AI companion read it to you
              </p>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Content
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  )
}