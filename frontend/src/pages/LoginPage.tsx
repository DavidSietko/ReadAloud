import { BookOpen, Mic, MessageCircle, Library } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

const features = [
  {
    icon: BookOpen,
    title: '70,000+ Books',
    description: 'Access the full Project Gutenberg library',
  },
  {
    icon: Mic,
    title: 'Natural Voices',
    description: 'Customisable AI-powered text-to-speech',
  },
  {
    icon: MessageCircle,
    title: 'AI Companion',
    description: 'Chat about the book as you read',
  },
  {
    icon: Library,
    title: 'Reading History',
    description: 'Pick up exactly where you left off',
  },
]

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-primary p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/10">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-primary-foreground">ReadAloud</span>
        </div>

        <div>
          <h1 className="mb-4 text-4xl font-bold leading-tight text-primary-foreground">
            Your personal AI reading companion
          </h1>
          <p className="mb-12 text-lg text-primary-foreground/70">
            Thousands of books, read aloud to you with a voice you choose — with an AI that
            understands every page.
          </p>

          <div className="grid grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <Icon className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-medium text-primary-foreground">{title}</p>
                  <p className="text-sm text-primary-foreground/60">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-primary-foreground/40">
          © {new Date().getFullYear()} ReadAloud. Making reading accessible for everyone.
        </p>
      </div>

      {/* Right panel — sign in */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">ReadAloud</span>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Welcome</CardTitle>
              <CardDescription>
                Sign in to start reading — or create your account automatically on first sign-in.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full gap-3"
                variant="outline"
                size="lg"
                onClick={() => api.auth.loginGoogle()}
              >
                <GoogleIcon />
                Continue with Google
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By continuing, you agree to our{' '}
                <a href="#" className="underline underline-offset-4 hover:text-foreground">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="underline underline-offset-4 hover:text-foreground">
                  Privacy Policy
                </a>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
