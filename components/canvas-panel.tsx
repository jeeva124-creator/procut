"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RotateCcw, FlipHorizontal, FlipVertical, RotateCw, Square, Maximize2, Crop, Download } from "lucide-react"

interface CanvasPanelProps {
  selectedClip: string | null
  onTransformChange?: (transform: VideoTransform) => void
}

export interface VideoTransform {
  position: { x: number; y: number }
  scale: number
  rotation: number
  opacity: number
  flipHorizontal: boolean
  flipVertical: boolean
  cropMode: "fill" | "fit" | "crop"
}

export function CanvasPanel({ selectedClip, onTransformChange }: CanvasPanelProps) {
  const [activeTab, setActiveTab] = useState("transform")
  const [transform, setTransform] = useState<VideoTransform>({
    position: { x: 0, y: 0 },
    scale: 100,
    rotation: 0,
    opacity: 100,
    flipHorizontal: false,
    flipVertical: false,
    cropMode: "fit",
  })

  const [adjustments, setAdjustments] = useState({
    brightness: [0],
    contrast: [0],
    saturation: [0],
    hue: [0],
  })

  const [speed, setSpeed] = useState([100])
  const [timeSettings, setTimeSettings] = useState({
    startTime: [0],
    endTime: [100],
    fadeIn: [0],
    fadeOut: [0],
  })

  const updateTransform = (updates: Partial<VideoTransform>) => {
    const newTransform = { ...transform, ...updates }
    setTransform(newTransform)
    onTransformChange?.(newTransform)
    console.log("[v0] Transform updated:", JSON.stringify(newTransform))
  }

  const handleExport = async () => {
    console.log("[v0] Starting video export...")

    // Trigger the export panel dialog
    const exportButton = document.querySelector("[data-export-panel-trigger]") as HTMLButtonElement
    if (exportButton) {
      exportButton.click()
    } else {
      // Fallback: create a proper video export
      try {
        const response = await fetch("/api/render", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectData: {
              clips: [], // Would be passed from parent
              textOverlays: [], // Would be passed from parent
              transforms: transform, // Pass current transforms
              width: 1920,
              height: 1080,
              fps: 30,
              durationInFrames: 900,
            },
            quality: "high",
            format: "mp4",
            codec: "h264",
            bitrate: 5000,
          }),
        })

        if (response.ok) {
          const result = await response.json()
          console.log("[v0] Export started:", result.renderId)

          // Show success message
          const exportBtn = document.querySelector("[data-export-btn]") as HTMLButtonElement
          if (exportBtn) {
            exportBtn.textContent = "Export Started!"
            setTimeout(() => {
              exportBtn.textContent = "Export Video"
            }, 3000)
          }
        } else {
          throw new Error("Export failed")
        }
      } catch (error) {
        console.error("[v0] Export error:", error)
        const exportBtn = document.querySelector("[data-export-btn]") as HTMLButtonElement
        if (exportBtn) {
          exportBtn.textContent = "Export Failed"
          setTimeout(() => {
            exportBtn.textContent = "Export Video"
          }, 3000)
        }
      }
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-[#3a3a3a]">
        <h2 className="text-lg font-semibold text-white mb-3">Canvas</h2>
        {/* <Button
          onClick={handleExport}
          data-export-btn
          className="w-full bg-green-600 hover:bg-green-700 text-white mb-3"
        >
          <Download className="h-4 w-4 mr-2" />
          {/* Export Video */}
        {/* </Button> */} 
      </div>

      <ScrollArea className="flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[#1a1a1a] border-b border-[#3a3a3a]">
            <TabsTrigger value="transform" className="text-white data-[state=active]:bg-[#3a3a3a]">
              Transform
            </TabsTrigger>
            <TabsTrigger value="adjust" className="text-white data-[state=active]:bg-[#3a3a3a]">
              Adjust
            </TabsTrigger>
            <TabsTrigger value="speed" className="text-white data-[state=active]:bg-[#3a3a3a]">
              Speed
            </TabsTrigger>
            <TabsTrigger value="time" className="text-white data-[state=active]:bg-[#3a3a3a]">
              Time
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transform" className="p-4 space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={transform.cropMode === "fill" ? "default" : "outline"}
                  size="sm"
                  className={`${
                    transform.cropMode === "fill"
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-[#1a1a1a] border-[#3a3a3a] text-white hover:bg-[#2a2a2a]"
                  } flex flex-col items-center p-5`}
                  onClick={() => updateTransform({ cropMode: "fill" })}
                >
                  {/* <Square className="h-6 w-6 mb-1" /> */}
                  Fill
                </Button>
                <Button
                  variant={transform.cropMode === "fit" ? "default" : "outline"}
                  size="sm"
                  className={`${
                    transform.cropMode === "fit"
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-[#1a1a1a] border-[#3a3a3a] text-white hover:bg-[#2a2a2a]"
                  } flex flex-col items-center p-3`}
                  onClick={() => updateTransform({ cropMode: "fit" })}
                >
                  {/* <Maximize2 className="h-6 w-6 mb-1" /> */}
                  Fit
                </Button>
                <Button
                  variant={transform.cropMode === "crop" ? "default" : "outline"}
                  size="sm"
                  className={`${
                    transform.cropMode === "crop"
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-[#1a1a1a] border-[#3a3a3a] text-white hover:bg-[#2a2a2a]"
                  } flex flex-col items-center p-3`}
                  onClick={() => updateTransform({ cropMode: "crop" })}
                >
                  {/* <Crop className="h-6 w-6 mb-1" /> */}
                  Crop
                </Button>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-white">Flip & Rotate</h3>
                <div className="flex gap-2 items-center">
                  <Button
                    variant={transform.flipHorizontal ? "default" : "outline"}
                    size="sm"
                    className={`${
                      transform.flipHorizontal
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-[#1a1a1a] border-[#3a3a3a] text-white hover:bg-[#2a2a2a]"
                    } p-2`}
                    onClick={() => updateTransform({ flipHorizontal: !transform.flipHorizontal })}
                  >
                    <FlipHorizontal className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={transform.flipVertical ? "default" : "outline"}
                    size="sm"
                    className={`${
                      transform.flipVertical
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-[#1a1a1a] border-[#3a3a3a] text-white hover:bg-[#2a2a2a]"
                    } p-2`}
                    onClick={() => updateTransform({ flipVertical: !transform.flipVertical })}
                  >
                    <FlipVertical className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-[#1a1a1a] border-[#3a3a3a] text-white hover:bg-[#2a2a2a] p-2"
                    onClick={() => updateTransform({ rotation: transform.rotation - 90 })}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-[#1a1a1a] border-[#3a3a3a] text-white hover:bg-[#2a2a2a] p-2"
                    onClick={() => updateTransform({ rotation: transform.rotation + 90 })}
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2 ml-2">
                    <Input
                      type="number"
                      value={transform.rotation}
                      onChange={(e) => updateTransform({ rotation: Number(e.target.value) })}
                      className="w-16 h-8 bg-[#1a1a1a] border-[#3a3a3a] text-white text-center"
                      step="1"
                      min="-360"
                      max="360"
                    />
                    <span className="text-white text-sm">°</span>
                  </div>
                </div>
              </div>

              {/* Position */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-400">Position</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-gray-500">X</Label>
                    <Input
                      type="number"
                      value={transform.position.x}
                      onChange={(e) =>
                        updateTransform({
                          position: { ...transform.position, x: Number(e.target.value) },
                        })
                      }
                      className="h-8 bg-[#1a1a1a] border-[#3a3a3a] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Y</Label>
                    <Input
                      type="number"
                      value={transform.position.y}
                      onChange={(e) =>
                        updateTransform({
                          position: { ...transform.position, y: Number(e.target.value) },
                        })
                      }
                      className="h-8 bg-[#1a1a1a] border-[#3a3a3a] text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Scale */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-400">Scale ({transform.scale}%)</Label>
                <Slider
                  value={[transform.scale]}
                  onValueChange={(value) => updateTransform({ scale: value[0] })}
                  min={10}
                  max={200}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Opacity */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-400">Opacity ({transform.opacity}%)</Label>
                <Slider
                  value={[transform.opacity]}
                  onValueChange={(value) => updateTransform({ opacity: value[0] })}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="adjust" className="p-4 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-gray-400">Brightness ({adjustments.brightness[0]})</Label>
                <Slider
                  value={adjustments.brightness}
                  onValueChange={(value) => setAdjustments((prev) => ({ ...prev, brightness: value }))}
                  min={-100}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-400">Contrast ({adjustments.contrast[0]})</Label>
                <Slider
                  value={adjustments.contrast}
                  onValueChange={(value) => setAdjustments((prev) => ({ ...prev, contrast: value }))}
                  min={-100}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-400">Saturation ({adjustments.saturation[0]})</Label>
                <Slider
                  value={adjustments.saturation}
                  onValueChange={(value) => setAdjustments((prev) => ({ ...prev, saturation: value }))}
                  min={-100}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-400">Hue ({adjustments.hue[0]}°)</Label>
                <Slider
                  value={adjustments.hue}
                  onValueChange={(value) => setAdjustments((prev) => ({ ...prev, hue: value }))}
                  min={-180}
                  max={180}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="speed" className="p-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-400">Playback Speed ({speed[0]}%)</Label>
              <Slider value={speed} onValueChange={setSpeed} min={25} max={400} step={5} className="w-full" />
            </div>
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[25, 50, 100, 200].map((speedValue) => (
                <Button
                  key={speedValue}
                  variant="outline"
                  size="sm"
                  className="bg-[#1a1a1a] border-[#3a3a3a] text-white hover:bg-[#2a2a2a]"
                  onClick={() => setSpeed([speedValue])}
                >
                  {speedValue}%
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="time" className="p-4 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-gray-400">Start Time ({timeSettings.startTime[0]}%)</Label>
                <Slider
                  value={timeSettings.startTime}
                  onValueChange={(value) => setTimeSettings((prev) => ({ ...prev, startTime: value }))}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-400">End Time ({timeSettings.endTime[0]}%)</Label>
                <Slider
                  value={timeSettings.endTime}
                  onValueChange={(value) => setTimeSettings((prev) => ({ ...prev, endTime: value }))}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-400">Fade In ({timeSettings.fadeIn[0]}s)</Label>
                <Slider
                  value={timeSettings.fadeIn}
                  onValueChange={(value) => setTimeSettings((prev) => ({ ...prev, fadeIn: value }))}
                  min={0}
                  max={5}
                  step={0.1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-400">Fade Out ({timeSettings.fadeOut[0]}s)</Label>
                <Slider
                  value={timeSettings.fadeOut}
                  onValueChange={(value) => setTimeSettings((prev) => ({ ...prev, fadeOut: value }))}
                  min={0}
                  max={5}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  )
}
