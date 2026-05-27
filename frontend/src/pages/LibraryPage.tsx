import { useState } from 'react'
import { Header } from '@/components/header'
import { BookLibrary } from '@/components/book-library'
import { ReaderView } from '@/components/reader-view'
import type { Book } from '@/lib/api'

export default function LibraryPage() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)

  if (selectedBook) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <ReaderView book={selectedBook} onBack={() => setSelectedBook(null)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <BookLibrary onSelectBook={setSelectedBook} />
      </main>
    </div>
  )
}
