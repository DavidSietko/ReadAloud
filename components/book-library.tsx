"use client"

import Image from "next/image"
import { Book, Headphones, Upload, Search, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const sampleBooks = [
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    type: "ebook",
    progress: 45,
    duration: "4h 30m",
    cover: "/images/books/great-gatsby.jpg"
  },
  {
    id: 2,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    type: "audiobook",
    progress: 0,
    duration: "11h 15m",
    cover: "/images/books/pride-prejudice.jpg"
  },
  {
    id: 3,
    title: "1984",
    author: "George Orwell",
    type: "ebook",
    progress: 78,
    duration: "8h 45m",
    cover: "/images/books/1984.jpg"
  },
  {
    id: 4,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    type: "audiobook",
    progress: 23,
    duration: "10h 30m",
    cover: "/images/books/to-kill-mockingbird.jpg"
  },
]

interface BookLibraryProps {
  onSelectBook: (book: typeof sampleBooks[0]) => void
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
            <Input 
              placeholder="Search books..." 
              className="pl-9"
              aria-label="Search your library"
            />
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
              <Card 
                key={book.id} 
                className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                onClick={() => onSelectBook(book)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onSelectBook(book)}
                aria-label={`Open ${book.title} by ${book.author}`}
              >
                <CardContent className="p-4">
                  <div className="relative mb-4 h-40 w-full overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={book.cover}
                      alt={`Cover of ${book.title}`}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-medium text-foreground">{book.title}</h3>
                        <p className="truncate text-sm text-muted-foreground">{book.author}</p>
                      </div>
                      <Badge variant={book.type === "audiobook" ? "default" : "secondary"} className="shrink-0">
                        {book.type === "audiobook" ? (
                          <Headphones className="mr-1 h-3 w-3" />
                        ) : (
                          <Book className="mr-1 h-3 w-3" />
                        )}
                        {book.type === "audiobook" ? "Audio" : "Text"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {book.duration}
                      </span>
                      {book.progress > 0 && (
                        <span className="text-primary">{book.progress}% complete</span>
                      )}
                    </div>

                    {book.progress > 0 && (
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div 
                          className="h-full bg-primary transition-all" 
                          style={{ width: `${book.progress}%` }}
                          role="progressbar"
                          aria-valuenow={book.progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ebooks" className="mt-0">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sampleBooks.filter(b => b.type === "ebook").map((book) => (
              <Card 
                key={book.id} 
                className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                onClick={() => onSelectBook(book)}
              >
                <CardContent className="p-4">
                  <div className="relative mb-4 h-40 w-full overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={book.cover}
                      alt={`Cover of ${book.title}`}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <h3 className="truncate font-medium text-foreground">{book.title}</h3>
                  <p className="truncate text-sm text-muted-foreground">{book.author}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audiobooks" className="mt-0">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sampleBooks.filter(b => b.type === "audiobook").map((book) => (
              <Card 
                key={book.id} 
                className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                onClick={() => onSelectBook(book)}
              >
                <CardContent className="p-4">
                  <div className="relative mb-4 h-40 w-full overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={book.cover}
                      alt={`Cover of ${book.title}`}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <h3 className="truncate font-medium text-foreground">{book.title}</h3>
                  <p className="truncate text-sm text-muted-foreground">{book.author}</p>
                </CardContent>
              </Card>
            ))}
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
