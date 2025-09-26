"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Square, Circle, Triangle, Star, Heart, Zap, Sparkles, Trash2, Shapes } from "lucide-react"

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
    { icon: Square, name: "Rectangle", color: "text-white", defaultColor: "#6b7280" },
    { icon: Circle, name: "Circle", color: "text-white", defaultColor: "#6b7280" },
    { icon: Triangle, name: "Triangle", color: "text-white", defaultColor: "#6b7280" },
    { icon: Star, name: "Star", color: "text-white", defaultColor: "#6b7280" },
    { icon: Heart, name: "Heart", color: "text-white", defaultColor: "#6b7280" },
    { icon: Zap, name: "Lightning", color: "text-white", defaultColor: "#6b7280" },
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
    <div className="h-full flex flex-col bg-[#1a1a1a]">
      {/* Header */}
      <div className="p-4 border-b border-[#3a3a3a] bg-[#2a2a2a]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
            <Shapes className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Elements Studio</h2>
            <p className="text-xs text-gray-400">Add shapes, overlays and animations</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-8">
          {/* Shapes */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-gray-600 rounded-md flex items-center justify-center">
                <Square className="h-3 w-3 text-white" />
              </div>
              <h3 className="text-sm font-bold text-white">Shapes</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {shapes.map((shape) => (
                <Button
                  key={shape.name}
                  variant="outline"
                  className="aspect-square bg-[#0f0f0f] border-[#3a3a3a] hover:bg-blue-600 hover:border-blue-600 flex flex-col items-center justify-center gap-2 transition-all h-20"
                  onClick={() => handleShapeAdd(shape)}
                >
                  <shape.icon className={`h-7 w-7 ${shape.color}`} />
                  <span className="text-xs text-gray-300 font-medium">{shape.name}</span>
                </Button>
              ))}
            </div>
          </div>

          <Separator className="bg-[#3a3a3a]" />

          {/* Overlays */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-gray-600 rounded-md flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded opacity-50"></div>
              </div>
              <h3 className="text-sm font-bold text-white">Overlays</h3>
            </div>
            <div className="space-y-3">
              {overlays.map((overlay) => (
                <Button
                  key={overlay.name}
                  variant="outline"
                  className="w-full justify-start bg-[#0f0f0f] border-[#3a3a3a] text-white hover:bg-blue-600 hover:border-blue-600 transition-all h-12 font-medium"
                  onClick={() => handleOverlayAdd(overlay)}
                >
                  <div
                    className="w-5 h-5 mr-3 rounded"
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
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-gray-600 rounded-md flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <h3 className="text-sm font-bold text-white">Added Elements</h3>
              {elements.length > 0 && (
                <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {elements.length}
                </div>
              )}
            </div>
            <div className="space-y-3">
              {elements.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-[#2a2a2a] rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-400 font-medium">No elements added yet</p>
                  <p className="text-xs text-gray-500 mt-1">Add shapes or overlays to get started</p>
                </div>
              )}
              {elements.map((element) => (
                <div
                  key={element.id}
                  className={`p-4 rounded-lg border cursor-pointer flex items-center justify-between transition-colors group ${
                    selectedElement === element.id
                      ? "bg-[#2a2a2a] border-blue-500"
                      : "bg-[#0f0f0f] border-[#3a3a3a] hover:bg-[#2a2a2a] hover:border-[#4a4a4a]"
                  }`}
                  onClick={() => setSelectedElement(element.id)}
                >
                  <div className="flex-1">
                    <span className="text-sm font-medium text-white">{element.name}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-[#2a2a2a] px-2 py-1 rounded text-gray-300 capitalize">
                        {element.type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {element.width}×{element.height}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      onElementDelete(element.id)
                      if (selectedElement === element.id) {
                        setSelectedElement(null)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
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
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 bg-gray-600 rounded-md flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded"></div>
                  </div>
                  <h3 className="text-sm font-bold text-white">Properties</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-300">Opacity</Label>
                      <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
                        {selectedElementData.opacity}%
                      </div>
                    </div>
                    <Slider
                      value={[selectedElementData.opacity]}
                      onValueChange={([value]) => onElementUpdate(selectedElement!, { opacity: value })}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-300">Rotation</Label>
                      <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
                        {selectedElementData.rotation}°
                      </div>
                    </div>
                    <Slider
                      value={[selectedElementData.rotation]}
                      onValueChange={([value]) => onElementUpdate(selectedElement!, { rotation: value })}
                      min={-180}
                      max={180}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {selectedElementData.type === "shape" && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-300">Color</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="color"
                          value={selectedElementData.color}
                          onChange={(e) => onElementUpdate(selectedElement!, { color: e.target.value })}
                          className="w-16 h-10 rounded-lg border-[#3a3a3a] bg-[#0f0f0f] cursor-pointer"
                        />
                        <div className="flex-1 text-sm text-gray-400 font-mono bg-[#0f0f0f] border border-[#3a3a3a] rounded-lg px-3 py-2">
                          {selectedElementData.color}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator className="bg-[#3a3a3a]" />

          {/* Animations */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-gray-600 rounded-md flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <h3 className="text-sm font-bold text-white">Animations</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {animations.map((animation) => (
                <Button
                  key={animation}
                  variant="outline"
                  size="sm"
                  className={`bg-[#0f0f0f] border-[#3a3a3a] text-white transition-all gap-2 h-12 font-medium ${
                    selectedElement 
                      ? "hover:bg-blue-600 hover:border-blue-600" 
                      : "opacity-50 cursor-not-allowed"
                  }`}
                  onClick={() => handleAnimationApply(animation)}
                  disabled={!selectedElement}
                >
                  <Sparkles className="h-4 w-4 text-white" />
                  {animation}
                </Button>
              ))}
            </div>
            {!selectedElement && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-400 font-medium">Select an element first</p>
                <p className="text-xs text-gray-500 mt-1">Choose an element to apply animations</p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
