"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Square, Circle, Triangle, Star, Heart, Zap, Sparkles, Trash2 } from "lucide-react"

interface Element {
  id: string
  type: "shape" | "overlay"
  name: string
  x: number
  y: number
  width: number
  height: number
  color: string
  opacity: number
  rotation: number
  animation?: string
}

interface ElementsPanelProps {
  selectedClip: string | null
  onElementAdd: (element: Element) => void
  elements: Element[]
  onElementUpdate: (id: string, updates: Partial<Element>) => void
  onElementDelete: (id: string) => void
}

export function ElementsPanel({
  selectedClip,
  onElementAdd,
  elements,
  onElementUpdate,
  onElementDelete,
}: ElementsPanelProps) {
  const [selectedElement, setSelectedElement] = useState<string | null>(null)

  const shapes = [
    { icon: Square, name: "Rectangle", color: "text-blue-400", defaultColor: "#3b82f6" },
    { icon: Circle, name: "Circle", color: "text-green-400", defaultColor: "#10b981" },
    { icon: Triangle, name: "Triangle", color: "text-red-400", defaultColor: "#ef4444" },
    { icon: Star, name: "Star", color: "text-yellow-400", defaultColor: "#f59e0b" },
    { icon: Heart, name: "Heart", color: "text-pink-400", defaultColor: "#ec4899" },
    { icon: Zap, name: "Lightning", color: "text-purple-400", defaultColor: "#8b5cf6" },
  ]

  const animations = ["Fade In", "Slide In", "Zoom In", "Bounce", "Rotate", "Pulse"]

  const overlays = [
    { name: "Gradient Overlay", type: "gradient", color: "linear-gradient(45deg, rgba(0,0,0,0.5), transparent)" },
    { name: "Dark Overlay", type: "solid", color: "rgba(0,0,0,0.5)" },
    { name: "Light Overlay", type: "solid", color: "rgba(255,255,255,0.2)" },
  ]

  const handleShapeAdd = (shape: any) => {
    const newElement: Element = {
      id: `element-${Date.now()}`,
      type: "shape",
      name: shape.name,
      x: 960, // Center of 1920px canvas
      y: 540, // Center of 1080px canvas
      width: 100,
      height: 100,
      color: shape.defaultColor,
      opacity: 100,
      rotation: 0,
    }
    onElementAdd(newElement)
  }

  const handleOverlayAdd = (overlay: any) => {
    const newElement: Element = {
      id: `element-${Date.now()}`,
      type: "overlay",
      name: overlay.name,
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,
      color: overlay.color,
      opacity: 50,
      rotation: 0,
    }
    onElementAdd(newElement)
  }

  const handleAnimationApply = (animation: string) => {
    if (selectedElement) {
      onElementUpdate(selectedElement, { animation })
    }
  }

  const selectedElementData = elements.find((el) => el.id === selectedElement)

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-[#3a3a3a]">
        <h2 className="text-lg font-semibold text-white mb-3">Elements</h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Shapes */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white">Shapes</h3>
            <div className="grid grid-cols-3 gap-2">
              {shapes.map((shape) => (
                <Button
                  key={shape.name}
                  variant="outline"
                  className="aspect-square bg-[#1a1a1a] border-[#3a3a3a] hover:bg-[#2a2a2a] flex flex-col items-center justify-center gap-1"
                  onClick={() => handleShapeAdd(shape)}
                >
                  <shape.icon className={`h-6 w-6 ${shape.color}`} />
                  <span className="text-xs text-gray-400">{shape.name}</span>
                </Button>
              ))}
            </div>
          </div>

          <Separator className="bg-[#3a3a3a]" />

          {/* Overlays */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white">Overlays</h3>
            <div className="space-y-2">
              {overlays.map((overlay) => (
                <Button
                  key={overlay.name}
                  variant="outline"
                  className="w-full justify-start bg-[#1a1a1a] border-[#3a3a3a] text-white hover:bg-[#2a2a2a]"
                  onClick={() => handleOverlayAdd(overlay)}
                >
                  <div
                    className="w-4 h-4 mr-2"
                    style={{
                      background: overlay.color,
                    }}
                  />
                  {overlay.name}
                </Button>
              ))}
            </div>
          </div>

          <Separator className="bg-[#3a3a3a]" />

          {/* Element List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white">Added Elements</h3>
            <div className="space-y-2">
              {elements.map((element) => (
                <div
                  key={element.id}
                  className={`p-2 rounded border cursor-pointer flex items-center justify-between ${
                    selectedElement === element.id
                      ? "bg-[#2a2a2a] border-blue-500"
                      : "bg-[#1a1a1a] border-[#3a3a3a] hover:bg-[#2a2a2a]"
                  }`}
                  onClick={() => setSelectedElement(element.id)}
                >
                  <span className="text-sm text-white">{element.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                    onClick={(e) => {
                      e.stopPropagation()
                      onElementDelete(element.id)
                      if (selectedElement === element.id) {
                        setSelectedElement(null)
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Element Properties */}
          {selectedElementData && (
            <>
              <Separator className="bg-[#3a3a3a]" />
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-white">Properties</h3>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-400">Opacity</Label>
                    <Slider
                      value={[selectedElementData.opacity]}
                      onValueChange={([value]) => onElementUpdate(selectedElement!, { opacity: value })}
                      max={100}
                      step={1}
                      className="mt-1"
                    />
                    <span className="text-xs text-gray-400">{selectedElementData.opacity}%</span>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-400">Rotation</Label>
                    <Slider
                      value={[selectedElementData.rotation]}
                      onValueChange={([value]) => onElementUpdate(selectedElement!, { rotation: value })}
                      min={-180}
                      max={180}
                      step={1}
                      className="mt-1"
                    />
                    <span className="text-xs text-gray-400">{selectedElementData.rotation}°</span>
                  </div>

                  {selectedElementData.type === "shape" && (
                    <div>
                      <Label className="text-xs text-gray-400">Color</Label>
                      <Input
                        type="color"
                        value={selectedElementData.color}
                        onChange={(e) => onElementUpdate(selectedElement!, { color: e.target.value })}
                        className="mt-1 h-8 bg-[#1a1a1a] border-[#3a3a3a]"
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator className="bg-[#3a3a3a]" />

          {/* Animations */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white">Animations</h3>
            <div className="grid grid-cols-2 gap-2">
              {animations.map((animation) => (
                <Button
                  key={animation}
                  variant="outline"
                  size="sm"
                  className="bg-[#1a1a1a] border-[#3a3a3a] text-white hover:bg-[#2a2a2a]"
                  onClick={() => handleAnimationApply(animation)}
                  disabled={!selectedElement}
                >
                  <Sparkles className="h-4 w-4 mr-1 text-purple-400" />
                  {animation}
                </Button>
              ))}
            </div>
            {!selectedElement && <p className="text-xs text-gray-500">Select an element to apply animations</p>}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
