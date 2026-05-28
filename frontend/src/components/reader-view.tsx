import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Settings2,
  Book,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { VoiceSettings } from '@/components/voice-settings'
import { ChatPanel } from '@/components/chat-panel'
import { api } from '@/lib/api'
import type { Book as BookType } from '@/lib/api'

interface ReaderViewProps {
  book: BookType
  onBack: () => void
}

export function ReaderView({ book, onBack }: ReaderViewProps) {
  const queryClient = useQueryClient()

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPosition, setCurrentPosition] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [fontSize, setFontSize] = useState(18)
  const [showChat, setShowChat] = useState(false)
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(0)
  const [chunk, setChunk] = useState(0)
  const [progressRestored, setProgressRestored] = useState(false)

  // Load saved progress first to know which chunk to start on
  const { status: progressStatus, data: savedProgress } = useQuery({
    queryKey: ['reading-progress', book.id],
    queryFn: () => api.users.getProgress(book.id),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const progressSettled = progressStatus === 'success' || progressStatus === 'error'

  // Restore chunk and word position once progress is loaded
  useEffect(() => {
    if (progressRestored || !progressSettled) return
    if (savedProgress) {
      setChunk(savedProgress.current_chunk)
    }
    setProgressRestored(true)
  }, [progressSettled, savedProgress, progressRestored])

  // Fetch book text for the current chunk
  const { data: textData, isLoading: textLoading, isError: textError } = useQuery({
    queryKey: ['book-text', book.id, chunk],
    queryFn: () => api.books.getText(book.id, chunk),
    enabled: progressRestored,
    staleTime: Infinity,
  })

  // Restore word position after text loads for the saved chunk
  useEffect(() => {
    if (!textData || !savedProgress || savedProgress.current_chunk !== chunk) return
    const words = textData.content.split(/\s+/).filter(Boolean)
    const wordIdx = Math.floor(savedProgress.progress * words.length)
    setHighlightedWordIndex(wordIdx)
    setCurrentPosition(wordIdx * 0.4)
  }, [textData, savedProgress, chunk])

  const saveProgressMutation = useMutation({
    mutationFn: (data: { current_chunk: number; progress: number }) =>
      api.users.saveProgress(book.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-progress', book.id] })
    },
  })

  const text = textData?.content ?? ''
  const totalChunks = textData?.total_chunks ?? 1
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text])
  const totalDuration = words.length * 0.4

  type Segment =
    | { type: 'heading'; level: number; words: string[]; startIndex: number }
    | { type: 'para'; words: string[]; startIndex: number }

  const segments = useMemo<Segment[]>(() => {
    const blocks = text.split(/\n\n+/).filter(s => s.trim())
    let idx = 0
    return blocks.map(block => {
      const trimmed = block.trim()
      const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/)
      if (headingMatch) {
        const hw = headingMatch[2].split(/\s+/).filter(Boolean)
        const seg: Segment = { type: 'heading', level: headingMatch[1].length, words: hw, startIndex: idx }
        idx += hw.length
        return seg
      }
      const sw = trimmed.split(/\s+/).filter(Boolean)
      const seg: Segment = { type: 'para', words: sw, startIndex: idx }
      idx += sw.length
      return seg
    })
  }, [text])
  const firstAuthor = book.authors[0]?.name ?? 'Unknown'

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isPlaying) {
      interval = setInterval(() => {
        setHighlightedWordIndex((prev) => {
          if (prev >= words.length - 1) {
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
        setCurrentPosition((prev) => Math.min(prev + speed * 0.4, totalDuration))
      }, 400 / speed)
    }
    return () => clearInterval(interval)
  }, [isPlaying, speed, words.length, totalDuration])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const goToChunk = (next: number) => {
    setIsPlaying(false)
    setHighlightedWordIndex(0)
    setCurrentPosition(0)
    setChunk(next)
  }

  const handleBookmark = () => {
    const progress = words.length > 0 ? highlightedWordIndex / words.length : 0
    saveProgressMutation.mutate({ current_chunk: chunk, progress })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b bg-background px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to library">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="relative h-10 w-8 overflow-hidden rounded bg-muted flex items-center justify-center">
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={`Cover of ${book.title}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <Book className="h-5 w-5 text-muted-foreground/50" />
            )}
          </div>
          <div>
            <h2 className="font-medium text-foreground">{book.title}</h2>
            <p className="text-xs text-muted-foreground">{firstAuthor}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBookmark}
            disabled={saveProgressMutation.isPending || textLoading}
            aria-label="Bookmark this position"
          >
            <Bookmark
              className={`h-5 w-5 ${saveProgressMutation.isSuccess ? 'fill-primary text-primary' : ''}`}
            />
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Voice settings">
                <Settings2 className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Voice & Reading Settings</SheetTitle>
                <SheetDescription>Customize how your AI companion reads to you</SheetDescription>
              </SheetHeader>
              <VoiceSettings
                speed={speed}
                onSpeedChange={setSpeed}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {textLoading || !progressRestored ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : textError ? (
            <div className="flex h-full items-center justify-center text-center">
              <p className="text-muted-foreground">
                Text not available for this book.
              </p>
            </div>
          ) : (
            <div
              className="mx-auto max-w-2xl font-serif leading-relaxed text-foreground"
              style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
            >
              {segments.map((seg, si) => {
                const spans = seg.words.map((word, wi) => {
                  const gi = seg.startIndex + wi
                  return (
                    <span
                      key={wi}
                      className={`transition-colors duration-200 ${
                        gi === highlightedWordIndex
                          ? 'bg-primary/20 text-primary font-medium rounded px-0.5'
                          : gi < highlightedWordIndex
                          ? 'text-muted-foreground'
                          : ''
                      }`}
                    >
                      {word}{' '}
                    </span>
                  )
                })
                if (seg.type === 'heading') {
                  const cls = `font-bold mt-8 mb-3 ${seg.level === 1 ? 'text-2xl' : seg.level === 2 ? 'text-xl' : 'text-lg'}`
                  if (seg.level === 1) return <h1 key={si} className={cls}>{spans}</h1>
                  if (seg.level === 2) return <h2 key={si} className={cls}>{spans}</h2>
                  if (seg.level === 3) return <h3 key={si} className={cls}>{spans}</h3>
                  return <h4 key={si} className={cls}>{spans}</h4>
                }
                return <p key={si} className="mb-4">{spans}</p>
              })}
            </div>
          )}
        </div>

        {showChat && (
          <div className="hidden w-96 border-l bg-card md:block">
            <ChatPanel bookTitle={book.title} />
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="border-t bg-card px-4 py-4">
        {/* Progress slider */}
        <div className="mb-2">
          <Slider
            value={[currentPosition]}
            max={totalDuration}
            step={0.1}
            onValueChange={([value]) => {
              setCurrentPosition(value)
              setHighlightedWordIndex(Math.floor(value / 0.4))
            }}
            className="w-full"
            aria-label="Reading progress"
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentPosition)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>

        {/* Chunk navigation */}
        {totalChunks > 1 && (
          <div className="mb-3 flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToChunk(chunk - 1)}
              disabled={chunk === 0 || textLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Prev
            </Button>
            <span>Part {chunk + 1} of {totalChunks}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToChunk(chunk + 1)}
              disabled={chunk >= totalChunks - 1 || textLoading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Playback controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              step={1}
              onValueChange={([value]) => {
                setVolume(value)
                setIsMuted(value === 0)
              }}
              className="w-24"
              aria-label="Volume"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setHighlightedWordIndex(Math.max(0, highlightedWordIndex - 10))
                setCurrentPosition(Math.max(0, currentPosition - 4))
              }}
              aria-label="Skip back"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full"
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={textLoading || !text}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setHighlightedWordIndex(Math.min(words.length - 1, highlightedWordIndex + 10))
                setCurrentPosition(Math.min(totalDuration, currentPosition + 4))
              }}
              aria-label="Skip forward"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono">
              {speed}x
            </Badge>
            <Button
              variant={showChat ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setShowChat(!showChat)}
              aria-label="Toggle chat with AI companion"
              className="hidden md:flex"
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Chat Button */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg md:hidden"
            aria-label="Chat with AI companion"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[70vh]">
          <SheetHeader>
            <SheetTitle>Talk to Your Reading Companion</SheetTitle>
          </SheetHeader>
          <ChatPanel bookTitle={book.title} />
        </SheetContent>
      </Sheet>
    </div>
  )
}
