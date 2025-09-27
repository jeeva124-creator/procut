"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RotateCcw, FlipHorizontal, FlipVertical, RotateCw, Square, Maximize2, Crop, Download, Palette, Zap, Clock, Move, Settings, Sparkles } from "lucide-react"

interface CanvasPanelProps {
  selectedClip: string | null
  onTransformChange?: (transform: VideoTransform) => void
  onAdjustmentsChange?: (adjustments: VideoAdjustments) => void
  onSpeedChange?: (speed: number) => void
  onTimeSettingsChange?: (timeSettings: TimeSettings) => void
}

export interface VideoAdjustments {
  brightness: number
  contrast: number
  saturation: number
  hue: number
}

export interface TimeSettings {
  startTime: number
  endTime: number
  fadeIn: number
  fadeOut: number
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

export function CanvasPanel({ selectedClip, onTransformChange, onAdjustmentsChange, onSpeedChange, onTimeSettingsChange }: CanvasPanelProps) {
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

  const updateAdjustments = (key: keyof VideoAdjustments, value: number[]) => {
    const newAdjustments = {
      brightness: adjustments.brightness[0],
      contrast: adjustments.contrast[0],
      saturation: adjustments.saturation[0],
      hue: adjustments.hue[0],
      [key]: value[0]
    }
    setAdjustments(prev => ({ ...prev, [key]: value }))
    onAdjustmentsChange?.(newAdjustments)
    console.log("[v0] Adjustments updated:", JSON.stringify(newAdjustments))
  }

  const updateSpeed = (value: number[]) => {
    setSpeed(value)
    onSpeedChange?.(value[0])
    console.log("[v0] Speed updated:", value[0])
  }

  const updateTimeSettings = (key: keyof TimeSettings, value: number[]) => {
    const newTimeSettings = {
      startTime: timeSettings.startTime[0],
      endTime: timeSettings.endTime[0],
      fadeIn: timeSettings.fadeIn[0],
      fadeOut: timeSettings.fadeOut[0],
      [key]: value[0]
    }
    setTimeSettings(prev => ({ ...prev, [key]: value }))
    onTimeSettingsChange?.(newTimeSettings)
    console.log("[v0] Time settings updated:", JSON.stringify(newTimeSettings))
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
    <div className="h-full flex flex-col bg-[#1a1a1a] min-h-0">
      <div className="p-4 border-b border-[#3a3a3a] bg-[#2a2a2a]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gray-600 rounded-md flex items-center justify-center">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Studio</h2>
            <p className="text-sm text-white">Transform your video with professional tools</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex w-full bg-[#1a1a1a] border-b border-[#3a3a3a]">
            <button
              onClick={() => setActiveTab("transform")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 font-semibold transition-all duration-200 ${
                activeTab === "transform"
                  ? "bg-blue-600 text-white border-b-2 border-blue-400"
                  : "text-white hover:text-white hover:bg-[#2a2a2a]"
              }`}
            >
              <Move className="h-4 w-4" />
              Transform
            </button>
            <button
              onClick={() => setActiveTab("adjust")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 font-semibold transition-all duration-200 ${
                activeTab === "adjust"
                  ? "bg-blue-600 text-white border-b-2 border-blue-400"
                  : "text-white hover:text-white hover:bg-[#2a2a2a]"
              }`}
            >
              <Palette className="h-4 w-4" />
              Adjust
            </button>
            <button
              onClick={() => setActiveTab("speed")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 font-semibold transition-all duration-200 ${
                activeTab === "speed"
                  ? "bg-blue-600 text-white border-b-2 border-blue-400"
                  : "text-white hover:text-white hover:bg-[#2a2a2a]"
              }`}
            >
              <Zap className="h-4 w-4" />
              Speed
            </button>
            <button
              onClick={() => setActiveTab("time")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 font-semibold transition-all duration-200 ${
                activeTab === "time"
                  ? "bg-blue-600 text-white border-b-2 border-blue-400"
                  : "text-white hover:text-white hover:bg-[#2a2a2a]"
              }`}
            >
              <Clock className="h-4 w-4" />
              Time
            </button>
          </div>

          <TabsContent value="transform" className="p-6 space-y-10">
            {/* Canvas Mode Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gray-600 rounded-md flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Video Mode</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={transform.cropMode === "fill" ? "default" : "outline"}
                  className={`${
                    transform.cropMode === "fill"
                      ? "bg-gray-600 border-transparent text-white shadow-lg"
                      : "bg-[#1a1a1a] border-[#3a3a3a] text-white hover:bg-gray-700 hover:border-gray-500"
                  } flex flex-col items-center p-6 h-20 transition-all duration-300`}
                  onClick={() => updateTransform({ cropMode: "fill" })}
                >
                  <Square className="h-6 w-6 mb-2" />
                  <span className="font-semibold">Fill</span>
                </Button>
                <Button
                  variant={transform.cropMode === "fit" ? "default" : "outline"}
                  className={`${
                    transform.cropMode === "fit"
                      ? "bg-gray-600 border-transparent text-white shadow-lg"
                      : "bg-[#1a1a1a] border-[#3a3a3a] text-white hover:bg-gray-700 hover:border-gray-500"
                  } flex flex-col items-center p-6 h-20 transition-all duration-300`}
                  onClick={() => updateTransform({ cropMode: "fit" })}
                >
                  <Maximize2 className="h-6 w-6 mb-2" />
                  <span className="font-semibold">Fit</span>
                </Button>
                <Button
                  variant={transform.cropMode === "crop" ? "default" : "outline"}
                  className={`${
                    transform.cropMode === "crop"
                      ? "bg-gray-600 border-transparent text-white shadow-lg"
                      : "bg-[#1a1a1a] border-[#3a3a3a] text-white hover:bg-gray-700 hover:border-gray-500"
                  } flex flex-col items-center p-6 h-20 transition-all duration-300`}
                  onClick={() => updateTransform({ cropMode: "crop" })}
                >
                  <Crop className="h-6 w-6 mb-2" />
                  <span className="font-semibold">Crop</span>
                </Button>
              </div>
            </div>

            {/* Flip & Rotate Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gray-600 rounded-md flex items-center justify-center">
                  <RotateCw className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Flip & Rotate</h3>
              </div>
              <div className="flex gap-3 items-center flex-wrap">
                <Button
                  variant={transform.flipHorizontal ? "default" : "outline"}
                  className={`${
                    transform.flipHorizontal
                      ? "bg-gray-600 border-transparent text-white shadow-lg"
                      : "bg-[#1a1a1a] border-[#3a3a3a] text-white hover:bg-gray-700 hover:border-gray-500"
                  } p-3 w-12 h-12 transition-all duration-300`}
                  onClick={() => updateTransform({ flipHorizontal: !transform.flipHorizontal })}
                >
                  <FlipHorizontal className="h-5 w-5" />
                </Button>
                <Button
                  variant={transform.flipVertical ? "default" : "outline"}
                  className={`${
                    transform.flipVertical
                      ? "bg-gray-600 border-transparent text-white shadow-lg"
                      : "bg-[#1a1a1a] border-[#3a3a3a] text-white hover:bg-gray-700 hover:border-gray-500"
                  } p-3 w-12 h-12 transition-all duration-300`}
                  onClick={() => updateTransform({ flipVertical: !transform.flipVertical })}
                >
                  <FlipVertical className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  className="bg-[#1a1a1a] border-[#3a3a3a] text-white hover:bg-gray-700 hover:border-gray-500 p-3 w-12 h-12 transition-all duration-300"
                  onClick={() => updateTransform({ rotation: transform.rotation - 90 })}
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  className="bg-[#1a1a1a] border-[#3a3a3a] text-white hover:bg-gray-700 hover:border-gray-500 p-3 w-12 h-12 transition-all duration-300"
                  onClick={() => updateTransform({ rotation: transform.rotation + 90 })}
                >
                  <RotateCw className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#3a3a3a] rounded-md p-3">
                  <Input
                    type="number"
                    value={transform.rotation}
                    onChange={(e) => updateTransform({ rotation: Number(e.target.value) })}
                    className="w-20 h-10 bg-[#0f0f0f] border-[#3a3a3a] text-white text-center font-bold rounded-md"
                    step="1"
                    min="-360"
                    max="360"
                  />
                  <span className="text-white font-semibold">°</span>
                </div>
              </div>
            </div>

            {/* Position Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gray-600 rounded-md flex items-center justify-center">
                  <Move className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Position</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-300">X Axis</Label>
                  <Input
                    type="number"
                    value={transform.position.x}
                    onChange={(e) =>
                      updateTransform({
                        position: { ...transform.position, x: Number(e.target.value) },
                      })
                    }
                    className="h-12 bg-[#1a1a1a] border-[#3a3a3a] text-white text-center font-bold text-lg rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-300">Y Axis</Label>
                  <Input
                    type="number"
                    value={transform.position.y}
                    onChange={(e) =>
                      updateTransform({
                        position: { ...transform.position, y: Number(e.target.value) },
                      })
                    }
                    className="h-12 bg-[#1a1a1a] border-[#3a3a3a] text-white text-center font-bold text-lg rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Scale Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gray-600 rounded-md flex items-center justify-center">
                  <Maximize2 className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Scale</h3>
                <span className="ml-auto text-lg font-semibold text-white">{transform.scale}%</span>
              </div>
              <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-md p-4">
                <Slider
                  value={[transform.scale]}
                  onValueChange={(value) => updateTransform({ scale: value[0] })}
                  min={10}
                  max={200}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Opacity Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gray-600 rounded-md flex items-center justify-center">
                  <Settings className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Opacity</h3>
                <span className="ml-auto text-lg font-semibold text-white">{transform.opacity}%</span>
              </div>
              <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-md p-4">
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

          <TabsContent value="adjust" className="p-6 space-y-10">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gray-600 rounded-md flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Brightness</h3>
                  <span className="ml-auto text-lg font-semibold text-white">{adjustments.brightness[0]}</span>
                </div>
                <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-md p-4">
                  <Slider
                    value={adjustments.brightness}
                    onValueChange={(value) => updateAdjustments("brightness", value)}
                    min={-100}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gray-600 rounded-md flex items-center justify-center">
                    <Settings className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Contrast</h3>
                  <span className="ml-auto text-lg font-semibold text-white">{adjustments.contrast[0]}</span>
                </div>
                <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-md p-4">
                  <Slider
                    value={adjustments.contrast}
                    onValueChange={(value) => updateAdjustments("contrast", value)}
                    min={-100}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gray-600 rounded-md flex items-center justify-center">
                    <Palette className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Saturation</h3>
                  <span className="ml-auto text-lg font-semibold text-white">{adjustments.saturation[0]}</span>
                </div>
                <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-md p-4">
                  <Slider
                    value={adjustments.saturation}
                    onValueChange={(value) => updateAdjustments("saturation", value)}
                    min={-100}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gray-600 rounded-md flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Hue</h3>
                  <span className="ml-auto text-lg font-semibold text-white">{adjustments.hue[0]}°</span>
                </div>
                <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-md p-4">
                  <Slider
                    value={adjustments.hue}
                    onValueChange={(value) => updateAdjustments("hue", value)}
                    min={-180}
                    max={180}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="speed" className="p-6 space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gray-600 rounded-md flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Playback Speed</h3>
                <span className="ml-auto text-lg font-semibold text-white">{speed[0]}%</span>
              </div>
              
              <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-md p-6">
                <Slider 
                  value={speed} 
                  onValueChange={updateSpeed} 
                  min={25} 
                  max={400} 
                  step={5} 
                  className="w-full mb-6" 
                />
                
                <div className="grid grid-cols-4 gap-3">
                  {[25, 50, 100, 200].map((speedValue) => (
                    <Button
                      key={speedValue}
                      variant={speed[0] === speedValue ? "default" : "outline"}
                      className={`${
                        speed[0] === speedValue
                          ? "bg-gray-600 border-transparent text-white shadow-lg"
                          : "bg-[#0f0f0f] border-[#3a3a3a] text-white hover:bg-gray-700 hover:border-gray-500"
                      } p-4 h-16 font-bold text-lg transition-all duration-300`}
                      onClick={() => updateSpeed([speedValue])}
                    >
                      {speedValue}%
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="time" className="p-6 space-y-10">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gray-600 rounded-md flex items-center justify-center">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Start Time</h3>
                  <span className="ml-auto text-lg font-semibold text-white">{timeSettings.startTime[0]}%</span>
                </div>
                <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-md p-4">
                  <Slider
                    value={timeSettings.startTime}
                    onValueChange={(value) => updateTimeSettings("startTime", value)}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gray-600 rounded-md flex items-center justify-center">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">End Time</h3>
                  <span className="ml-auto text-lg font-semibold text-white">{timeSettings.endTime[0]}%</span>
                </div>
                <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-md p-4">
                  <Slider
                    value={timeSettings.endTime}
                    onValueChange={(value) => updateTimeSettings("endTime", value)}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gray-600 rounded-md flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Fade In</h3>
                  <span className="ml-auto text-lg font-semibold text-white">{timeSettings.fadeIn[0]}s</span>
                </div>
                <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-md p-4">
                  <Slider
                    value={timeSettings.fadeIn}
                    onValueChange={(value) => updateTimeSettings("fadeIn", value)}
                    min={0}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gray-600 rounded-md flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Fade Out</h3>
                  <span className="ml-auto text-lg font-semibold text-white">{timeSettings.fadeOut[0]}s</span>
                </div>
                <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-md p-4">
                  <Slider
                    value={timeSettings.fadeOut}
                    onValueChange={(value) => updateTimeSettings("fadeOut", value)}
                    min={0}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  )
}
