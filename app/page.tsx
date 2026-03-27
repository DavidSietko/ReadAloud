"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { BookLibrary } from "@/components/book-library"
import { ReaderView } from "@/components/reader-view"

interface Book {
  id: number
  title: string
  author: string
  type: string
  progress: number
  duration: string
  cover: string
}

export default function Home() {
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
      <main className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <section className="mb-12 py-12 text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
              Your Personal AI Reading Companion
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl text-pretty">
              Experience books like never before. Choose any book, customize the voice, 
              and interact naturally as your AI companion reads aloud to you.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
                <span className="flex h-2 w-2 rounded-full bg-accent" />
                <span className="text-sm text-muted-foreground">Multiple voice options</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
                <span className="flex h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">Adjustable reading speed</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
                <span className="flex h-2 w-2 rounded-full bg-chart-4" />
                <span className="text-sm text-muted-foreground">Interactive conversations</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold text-foreground">Natural Voice Selection</h3>
            <p className="text-sm text-muted-foreground">
              Choose from a variety of natural-sounding voices. Adjust pitch, speed, and tone to match your preference.
            </p>
          </div>
          
          <div className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold text-foreground">Interactive Conversations</h3>
            <p className="text-sm text-muted-foreground">
              Ask questions, get explanations, or just chat. Your AI companion understands context and responds naturally.
            </p>
          </div>
          
          <div className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-4/10">
              <svg className="h-6 w-6 text-chart-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold text-foreground">Bring Your Content</h3>
            <p className="text-sm text-muted-foreground">
              Import e-books, audiobooks, or paste your own text. Read anything you want with your personal companion.
            </p>
          </div>
        </section>

        {/* Book Library */}
        <BookLibrary onSelectBook={setSelectedBook} />
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <svg className="h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="font-semibold text-foreground">ReadAloud</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Making reading accessible for everyone
            </p>
            <nav className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">About</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Help</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
