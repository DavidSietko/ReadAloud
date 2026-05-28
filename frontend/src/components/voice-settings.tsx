import { useState, useEffect } from 'react'
import { Check, Minus, Plus, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'

interface VoiceSettingsProps {
  speed: number
  onSpeedChange: (speed: number) => void
  fontSize: number
  onFontSizeChange: (size: number) => void
  voiceName: string
  onVoiceChange: (name: string) => void
  pitch: number
  onPitchChange: (pitch: number) => void
}

export function VoiceSettings({
  speed,
  onSpeedChange,
  fontSize,
  onFontSizeChange,
  voiceName,
  onVoiceChange,
  pitch,
  onPitchChange,
}: VoiceSettingsProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    const load = () => {
      const all = window.speechSynthesis.getVoices()
      const en = all.filter(v => v.lang.startsWith('en'))
      const list = en.length ? en : all
      setVoices(list)
      if (!voiceName && list.length) onVoiceChange(list[0].name)
    }
    load()
    window.speechSynthesis.onvoiceschanged = load
    return () => { window.speechSynthesis.onvoiceschanged = null }
  }, [])

  const handlePreview = () => {
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance('The quick brown fox jumps over the lazy dog.')
    utter.rate = speed
    utter.pitch = pitch
    const voice = window.speechSynthesis.getVoices().find(v => v.name === voiceName)
    if (voice) utter.voice = voice
    window.speechSynthesis.speak(utter)
  }

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2]
  const pitchSlider = Math.round(pitch * 50)

  return (
    <div className="mt-6 space-y-6">
      <div className="space-y-3">
        <Label className="text-base font-medium">Voice</Label>
        <div className="grid gap-2 max-h-64 overflow-y-auto pr-1">
          {voices.map((voice) => (
            <Label
              key={voice.name}
              htmlFor={voice.name}
              className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                voiceName === voice.name
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted/50'
              }`}
              onClick={() => onVoiceChange(voice.name)}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg font-medium text-muted-foreground">
                  {voice.name[0]}
                </div>
                <div>
                  <p className="font-medium text-foreground">{voice.name}</p>
                  <p className="text-xs text-muted-foreground">{voice.lang}</p>
                </div>
              </div>
              {voiceName === voice.name && <Check className="h-5 w-5 text-primary" />}
            </Label>
          ))}
          {voices.length === 0 && (
            <p className="text-sm text-muted-foreground py-2">Loading voices...</p>
          )}
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={handlePreview}>
          <Volume2 className="mr-2 h-4 w-4" />
          Preview Voice
        </Button>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Reading Speed</Label>
          <span className="text-sm font-mono text-muted-foreground">{speed}x</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {speedOptions.map((s) => (
            <Button
              key={s}
              variant={speed === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSpeedChange(s)}
              className="flex-1 min-w-[60px]"
            >
              {s}x
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Voice Pitch</Label>
          <span className="text-sm text-muted-foreground">
            {pitchSlider < 40 ? 'Lower' : pitchSlider > 60 ? 'Higher' : 'Normal'}
          </span>
        </div>
        <Slider
          value={[pitchSlider]}
          max={100}
          step={1}
          onValueChange={([v]) => onPitchChange(v / 50)}
          aria-label="Voice pitch"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Lower</span>
          <span>Higher</span>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Text Size</Label>
          <span className="text-sm text-muted-foreground">{fontSize}px</span>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onFontSizeChange(Math.max(12, fontSize - 2))}
            aria-label="Decrease font size"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Slider
            value={[fontSize]}
            min={12}
            max={32}
            step={1}
            onValueChange={([value]) => onFontSizeChange(value)}
            className="flex-1"
            aria-label="Font size"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => onFontSizeChange(Math.min(32, fontSize + 2))}
            aria-label="Increase font size"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="rounded-lg bg-muted p-4 text-center" style={{ fontSize: `${fontSize}px` }}>
          Preview text size
        </div>
      </div>
    </div>
  )
}
