import { useState, useRef, useEffect } from 'react'
import { Send, Mic, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { api } from '@/lib/api'
import type { ChatMessage } from '@/lib/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const suggestedQuestions = [
  'What does this passage mean?',
  'Can you explain that word?',
  'Tell me about the author',
  'What themes appear here?',
]

interface ChatPanelProps {
  bookTitle: string
  bookId: number
  bookContext: string
}

export function ChatPanel({ bookTitle, bookId, bookContext }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'greeting',
      role: 'assistant',
      content: `Hi! I'm your reading companion for "${bookTitle}". Feel free to ask me anything about the story, vocabulary, or just chat while we read together.`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (text?: string) => {
    const userText = (text ?? input).trim()
    if (!userText || isStreaming) return

    setInput('')

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])

    // Build history from all messages except the initial greeting
    const history: ChatMessage[] = messages
      .filter(m => m.id !== 'greeting')
      .map(m => ({ role: m.role, content: m.content }))
    history.push({ role: 'user', content: userText })

    const assistantId = (Date.now() + 1).toString()
    setMessages(prev => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', timestamp: new Date() },
    ])
    setIsStreaming(true)

    abortRef.current = new AbortController()

    try {
      const res = await api.ai.chat(
        { book_id: bookId, message: userText, book_context: bookContext, history },
        abortRef.current.signal,
      )
      if (!res.ok) throw new Error(`API error ${res.status}`)

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break
          accumulated += data
          setMessages(prev =>
            prev.map(m => m.id === assistantId ? { ...m, content: accumulated } : m)
          )
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: 'Sorry, something went wrong. Please try again.' }
            : m
        )
      )
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback
                  className={
                    message.role === 'assistant'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }
                >
                  {message.role === 'assistant' ? 'AI' : 'You'}
                </AvatarFallback>
              </Avatar>
              <div
                className={`rounded-2xl px-4 py-2 max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p
                  className={`mt-1 text-xs ${
                    message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {isStreaming && messages[messages.length - 1]?.content === '' && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
              </Avatar>
              <div className="rounded-2xl bg-muted px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t px-4 py-3">
        <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          <span>Try asking:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((question) => (
            <Button
              key={question}
              variant="outline"
              size="sm"
              className="h-auto py-1.5 text-xs"
              onClick={() => handleSend(question)}
              disabled={isStreaming}
            >
              {question}
            </Button>
          ))}
        </div>
      </div>

      <div className="border-t p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex gap-2"
        >
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Voice input (coming soon)"
            disabled
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your reading companion…"
            className="flex-1"
            aria-label="Message input"
            disabled={isStreaming}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isStreaming} aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
