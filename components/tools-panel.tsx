"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { TextOverlayEditor } from "@/components/text-overlay-editor"
import { TransitionsPanel } from "@/components/transitions-panel"
import {
  Palette,
  Volume2,
  Scissors,
  RotateCw,
  Move,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Contrast,
  Sun,
  Zap,
  Music,
  Mic,
  Settings,
} from "lucide-react"

interface ToolsPanelProps {
  selectedClip: string | null
}

export function ToolsPanel({ selectedClip }: ToolsPanelProps) {
  // Text overlay states
  const [textContent, setTextContent] = useState("")
  const [fontSize, setFontSize] = useState([24])
  const [textColor, setTextColor] = useState("#ffffff")
  const [fontFamily, setFontFamily] = useState("Arial")
  const [textAlign, setTextAlign] = useState("center")

  // Transform states
  const [position, setPosition] = useState({ x: [0], y: [0] })
  const [scale, setScale] = useState([100])
  const [rotation, setRotation] = useState([0])
  const [opacity, setOpacity] = useState([100])

  // Color correction states
  const [brightness, setBrightness] = useState([0])
  const [contrast, setContrast] = useState([0])
  const [saturation, setSaturation] = useState([0])
  const [hue, setHue] = useState([0])

  // Audio states
  const [volume, setVolume] = useState([100])
  const [audioFadeIn, setAudioFadeIn] = useState([0])
  const [audioFadeOut, setAudioFadeOut] = useState([0])
  const [pitch, setPitch] = useState([0])

  // Crop states
  const [cropTop, setCropTop] = useState([0])
  const [cropBottom, setCropBottom] = useState([0])
  const [cropLeft, setCropLeft] = useState([0])
  const [cropRight, setCropRight] = useState([0])

  // Speed states
  const [playbackSpeed, setPlaybackSpeed] = useState([100])

  // Transitions state management
  const [transitions, setTransitions] = useState<any[]>([])
  const [selectedTransition, setSelectedTransition] = useState<string>()

  const handleAddTransition = (transition: any) => {
    const newTransition = {
      ...transition,
      id: Math.random().toString(36).substr(2, 9),
    }
    setTransitions((prev) => [...prev, newTransition])
  }

  const handleUpdateTransition = (id: string, updates: any) => {
    setTransitions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }

  const handleRemoveTransition = (id: string) => {
    setTransitions((prev) => prev.filter((t) => t.id !== id))
    if (selectedTransition === id) setSelectedTransition(undefined)
  }

  const resetTransform = () => {
    setPosition({ x: [0], y: [0] })
    setScale([100])
    setRotation([0])
    setOpacity([100])
  }

  const resetColorCorrection = () => {
    setBrightness([0])
    setContrast([0])
    setSaturation([0])
    setHue([0])
  }

  const resetCrop = () => {
    setCropTop([0])
    setCropBottom([0])
    setCropLeft([0])
    setCropRight([0])
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Tools & Properties</h3>
          {selectedClip && <Badge variant="outline">Clip Selected</Badge>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {selectedClip ? (
          <Tabs defaultValue="transform" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="transform">Transform</TabsTrigger>
              <TabsTrigger value="color">Color</TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
              <TabsTrigger value="crop">Crop</TabsTrigger>
              <TabsTrigger value="speed">Speed</TabsTrigger>
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="transitions">Transitions</TabsTrigger>
            </TabsList>

            <TabsContent value="transform" className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Move className="h-4 w-4" />
                    Position & Transform
                  </h4>
                  <Button variant="ghost" size="sm" onClick={resetTransform}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>X Position</Label>
                      <Slider
                        value={position.x}
                        onValueChange={(value) => setPosition((prev) => ({ ...prev, x: value }))}
                        min={-500}
                        max={500}
                        step={1}
                        className="mt-2"
                      />
                      <span className="text-sm text-muted-foreground">{position.x[0]}px</span>
                    </div>
                    <div>
                      <Label>Y Position</Label>
                      <Slider
                        value={position.y}
                        onValueChange={(value) => setPosition((prev) => ({ ...prev, y: value }))}
                        min={-500}
                        max={500}
                        step={1}
                        className="mt-2"
                      />
                      <span className="text-sm text-muted-foreground">{position.y[0]}px</span>
                    </div>
                  </div>

                  <div>
                    <Label>Scale</Label>
                    <Slider value={scale} onValueChange={setScale} min={10} max={300} step={1} className="mt-2" />
                    <span className="text-sm text-muted-foreground">{scale[0]}%</span>
                  </div>

                  <div>
                    <Label>Rotation</Label>
                    <Slider
                      value={rotation}
                      onValueChange={setRotation}
                      min={-180}
                      max={180}
                      step={1}
                      className="mt-2"
                    />
                    <span className="text-sm text-muted-foreground">{rotation[0]}°</span>
                  </div>

                  <div>
                    <Label>Opacity</Label>
                    <Slider value={opacity} onValueChange={setOpacity} min={0} max={100} step={1} className="mt-2" />
                    <span className="text-sm text-muted-foreground">{opacity[0]}%</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <FlipHorizontal className="h-3 w-3" />
                      Flip H
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <FlipVertical className="h-3 w-3" />
                      Flip V
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="color" className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Color Correction
                  </h4>
                  <Button variant="ghost" size="sm" onClick={resetColorCorrection}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Sun className="h-3 w-3" />
                      Brightness
                    </Label>
                    <Slider
                      value={brightness}
                      onValueChange={setBrightness}
                      min={-100}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                    <span className="text-sm text-muted-foreground">{brightness[0]}</span>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <Contrast className="h-3 w-3" />
                      Contrast
                    </Label>
                    <Slider
                      value={contrast}
                      onValueChange={setContrast}
                      min={-100}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                    <span className="text-sm text-muted-foreground">{contrast[0]}</span>
                  </div>

                  <div>
                    <Label>Saturation</Label>
                    <Slider
                      value={saturation}
                      onValueChange={setSaturation}
                      min={-100}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                    <span className="text-sm text-muted-foreground">{saturation[0]}</span>
                  </div>

                  <div>
                    <Label>Hue</Label>
                    <Slider value={hue} onValueChange={setHue} min={-180} max={180} step={1} className="mt-2" />
                    <span className="text-sm text-muted-foreground">{hue[0]}°</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Quick Presets
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="bg-transparent">
                    Warm
                  </Button>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    Cool
                  </Button>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    Vintage
                  </Button>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    B&W
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="audio" className="space-y-4">
              <Card className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Audio Settings
                </h4>
                <div className="space-y-4">
                  <div>
                    <Label>Volume</Label>
                    <Slider value={volume} onValueChange={setVolume} min={0} max={200} step={1} className="mt-2" />
                    <span className="text-sm text-muted-foreground">{volume[0]}%</span>
                  </div>

                  <div>
                    <Label>Fade In Duration</Label>
                    <Slider
                      value={audioFadeIn}
                      onValueChange={setAudioFadeIn}
                      min={0}
                      max={5}
                      step={0.1}
                      className="mt-2"
                    />
                    <span className="text-sm text-muted-foreground">{audioFadeIn[0]}s</span>
                  </div>

                  <div>
                    <Label>Fade Out Duration</Label>
                    <Slider
                      value={audioFadeOut}
                      onValueChange={setAudioFadeOut}
                      min={0}
                      max={5}
                      step={0.1}
                      className="mt-2"
                    />
                    <span className="text-sm text-muted-foreground">{audioFadeOut[0]}s</span>
                  </div>

                  <div>
                    <Label>Pitch</Label>
                    <Slider value={pitch} onValueChange={setPitch} min={-12} max={12} step={0.1} className="mt-2" />
                    <span className="text-sm text-muted-foreground">{pitch[0]} semitones</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  Audio Effects
                </h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Mic className="h-4 w-4 mr-2" />
                    Noise Reduction
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Echo
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Reverb
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Bass Boost
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="crop" className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Crop className="h-4 w-4" />
                    Crop & Trim
                  </h4>
                  <Button variant="ghost" size="sm" onClick={resetCrop}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Top</Label>
                      <Slider value={cropTop} onValueChange={setCropTop} min={0} max={50} step={1} className="mt-2" />
                      <span className="text-sm text-muted-foreground">{cropTop[0]}%</span>
                    </div>
                    <div>
                      <Label>Bottom</Label>
                      <Slider
                        value={cropBottom}
                        onValueChange={setCropBottom}
                        min={0}
                        max={50}
                        step={1}
                        className="mt-2"
                      />
                      <span className="text-sm text-muted-foreground">{cropBottom[0]}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Left</Label>
                      <Slider value={cropLeft} onValueChange={setCropLeft} min={0} max={50} step={1} className="mt-2" />
                      <span className="text-sm text-muted-foreground">{cropLeft[0]}%</span>
                    </div>
                    <div>
                      <Label>Right</Label>
                      <Slider
                        value={cropRight}
                        onValueChange={setCropRight}
                        min={0}
                        max={50}
                        step={1}
                        className="mt-2"
                      />
                      <span className="text-sm text-muted-foreground">{cropRight[0]}%</span>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label>Aspect Ratio</Label>
                    <Select defaultValue="original">
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="original">Original</SelectItem>
                        <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                        <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                        <SelectItem value="1:1">1:1 (Square)</SelectItem>
                        <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="speed" className="space-y-4">
              <Card className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Playback Speed
                </h4>
                <div className="space-y-4">
                  <div>
                    <Label>Speed</Label>
                    <Slider
                      value={playbackSpeed}
                      onValueChange={setPlaybackSpeed}
                      min={25}
                      max={400}
                      step={5}
                      className="mt-2"
                    />
                    <span className="text-sm text-muted-foreground">{playbackSpeed[0]}%</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPlaybackSpeed([50])}
                      className="bg-transparent"
                    >
                      0.5x
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPlaybackSpeed([100])}
                      className="bg-transparent"
                    >
                      1x
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPlaybackSpeed([200])}
                      className="bg-transparent"
                    >
                      2x
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <Label>Frame Rate</Label>
                    <Select defaultValue="30">
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24">24 fps (Cinema)</SelectItem>
                        <SelectItem value="30">30 fps (Standard)</SelectItem>
                        <SelectItem value="60">60 fps (Smooth)</SelectItem>
                        <SelectItem value="120">120 fps (High Speed)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Scissors className="h-4 w-4" />
                  Precision Tools
                </h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Frame-by-Frame Edit
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Keyframe Animation
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Motion Tracking
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="text" className="space-y-4">
              <TextOverlayEditor />
            </TabsContent>

            <TabsContent value="transitions" className="space-y-4">
              <TransitionsPanel
                transitions={transitions}
                onAddTransition={handleAddTransition}
                onUpdateTransition={handleUpdateTransition}
                onRemoveTransition={handleRemoveTransition}
                selectedTransition={selectedTransition}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <RotateCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No clip selected</p>
            <p className="text-sm text-muted-foreground">Select a clip from the timeline to access editing tools</p>
          </div>
        )}
      </div>
    </div>
  )
}
