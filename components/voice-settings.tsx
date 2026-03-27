"use client"

import { useState } from "react"
import { Check, Minus, Plus, Type, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"

const voices = [
  { id: "emma", name: "Emma", description: "Warm, friendly female voice", accent: "American" },
  { id: "james", name: "James", description: "Deep, calm male voice", accent: "British" },
  { id: "sofia", name: "Sofia", description: "Gentle, expressive female voice", accent: "Spanish" },
  { id: "alex", name: "Alex", description: "Neutral, clear voice", accent: "American" },
  { id: "maya", name: "Maya", description: "Soft, soothing female voice", accent: "Indian" },
  { id: "oliver", name: "Oliver", description: "Cheerful male voice", accent: "Australian" },
]

interface VoiceSettingsProps {
  speed: number
  onSpeedChange: (speed: number) => void
  fontSize: number
  onFontSizeChange: (size: number) => void
}

export function VoiceSettings({ speed, onSpeedChange, fontSize, onFontSizeChange }: VoiceSettingsProps) {
  const [selectedVoice, setSelectedVoice] = useState("emma")
  const [pitch, setPitch] = useState(50)

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2]

  return (
    <div className="mt-6 space-y-6">
      {/* Voice Selection */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Voice</Label>
        <RadioGroup value={selectedVoice} onValueChange={setSelectedVoice} className="grid gap-2">
          {voices.map((voice) => (
            <Label
              key={voice.id}
              htmlFor={voice.id}
              className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                selectedVoice === voice.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value={voice.id} id={voice.id} className="sr-only" />
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg font-medium text-muted-foreground">
                  {voice.name[0]}
                </div>
                <div>
                  <p className="font-medium text-foreground">{voice.name}</p>
                  <p className="text-xs text-muted-foreground">{voice.description}</p>
                </div>
              </div>
              {selectedVoice === voice.id && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </Label>
          ))}
        </RadioGroup>
        <Button variant="outline" size="sm" className="w-full">
          <Volume2 className="mr-2 h-4 w-4" />
          Preview Voice
        </Button>
      </div>

      <Separator />

      {/* Reading Speed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Reading Speed</Label>
          <span className="text-sm font-mono text-muted-foreground">{speed}x</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {speedOptions.map((s) => (
            <Button
              key={s}
              variant={speed === s ? "default" : "outline"}
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

      {/* Voice Pitch */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Voice Pitch</Label>
          <span className="text-sm text-muted-foreground">
            {pitch < 40 ? "Lower" : pitch > 60 ? "Higher" : "Normal"}
          </span>
        </div>
        <Slider
          value={[pitch]}
          max={100}
          step={1}
          onValueChange={([value]) => setPitch(value)}
          aria-label="Voice pitch"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Lower</span>
          <span>Higher</span>
        </div>
      </div>

      <Separator />

      {/* Font Size */}
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
