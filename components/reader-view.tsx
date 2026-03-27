"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Bookmark,
  ChevronLeft,
  MessageCircle,
  Settings2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { VoiceSettings } from "@/components/voice-settings"
import { ChatPanel } from "@/components/chat-panel"

const sampleText = `It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair, we had everything before us, we had nothing before us, we were all going direct to Heaven, we were all going direct the other way—in short, the period was so far like the present period, that some of its noisiest authorities insisted on its being received, for good or for evil, in the superlative degree of comparison only.

There were a king with a large jaw and a queen with a plain face, on the throne of England; there were a king with a large jaw and a queen with a fair face, on the throne of France. In both countries it was clearer than crystal to the lords of the State preserves of loaves and fishes, that things in general were settled for ever.

It was the year of Our Lord one thousand seven hundred and seventy-five. Spiritual revelations were conceded to England at that favoured period, as at this.`

interface ReaderViewProps {
  book: {
    title: string
    author: string
    type: string
    progress: number
    cover: string
  }
  onBack: () => void
}

export function ReaderView({ book, onBack }: ReaderViewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPosition, setCurrentPosition] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [fontSize, setFontSize] = useState(18)
  const [showChat, setShowChat] = useState(false)
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(0)
  
  const words = sampleText.split(/\s+/)
  const totalDuration = words.length * 0.4 // Approximate seconds per word
  
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setHighlightedWordIndex((prev) => {
          if (prev >= words.length - 1) {
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
        setCurrentPosition((prev) => Math.min(prev + (speed * 0.4), totalDuration))
      }, 400 / speed)
    }
    return () => clearInterval(interval)
  }, [isPlaying, speed, words.length, totalDuration])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const skipBack = () => {
    setHighlightedWordIndex(Math.max(0, highlightedWordIndex - 10))
    setCurrentPosition(Math.max(0, currentPosition - 4))
  }

  const skipForward = () => {
    setHighlightedWordIndex(Math.min(words.length - 1, highlightedWordIndex + 10))
    setCurrentPosition(Math.min(totalDuration, currentPosition + 4))
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b bg-background px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to library">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="relative h-10 w-8 overflow-hidden rounded bg-muted">
            <Image
              src={book.cover}
              alt={`Cover of ${book.title}`}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-medium text-foreground">{book.title}</h2>
            <p className="text-xs text-muted-foreground">{book.author}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Bookmark this page">
            <Bookmark className="h-5 w-5" />
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
                <SheetDescription>
                  Customize how your AI companion reads to you
                </SheetDescription>
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
        {/* Reading Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div 
            className="mx-auto max-w-2xl font-serif leading-relaxed text-foreground"
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
          >
            {words.map((word, index) => (
              <span
                key={index}
                className={`transition-colors duration-200 ${
                  index === highlightedWordIndex
                    ? "bg-primary/20 text-primary font-medium rounded px-0.5"
                    : index < highlightedWordIndex
                    ? "text-muted-foreground"
                    : ""
                }`}
              >
                {word}{" "}
              </span>
            ))}
          </div>
        </div>

        {/* Chat Panel (Desktop) */}
        {showChat && (
          <div className="hidden w-96 border-l bg-card md:block">
            <ChatPanel bookTitle={book.title} />
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="border-t bg-card px-4 py-4">
        {/* Progress Bar */}
        <div className="mb-4">
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

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          {/* Left: Volume */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMuted(!isMuted)}
              aria-label={isMuted ? "Unmute" : "Mute"}
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

          {/* Center: Playback */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={skipBack} aria-label="Skip back 10 seconds">
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button 
              size="lg"
              className="h-14 w-14 rounded-full"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={skipForward} aria-label="Skip forward 10 seconds">
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          {/* Right: Speed & Chat */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono">
              {speed}x
            </Badge>
            <Button 
              variant={showChat ? "default" : "ghost"} 
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
