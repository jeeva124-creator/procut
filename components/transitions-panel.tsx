"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Transition {
  id: string
  type: "crossfade" | "slide" | "fade" | "wipe"
  duration: number
  position: number
}

interface TransitionsPanelProps {
  transitions: Transition[]
  onAddTransition: (transition: Omit<Transition, "id">) => void
  onUpdateTransition: (id: string, updates: Partial<Transition>) => void
  onRemoveTransition: (id: string) => void
  selectedTransition?: string
}

export function TransitionsPanel({
  transitions,
  onAddTransition,
  onUpdateTransition,
  onRemoveTransition,
  selectedTransition,
}: TransitionsPanelProps) {
  const [newTransitionType, setNewTransitionType] = useState<"crossfade" | "slide" | "fade" | "wipe">("crossfade")
  const [newTransitionDuration, setNewTransitionDuration] = useState([1])

  const handleAddTransition = () => {
    onAddTransition({
      type: newTransitionType,
      duration: newTransitionDuration[0],
      position: 0, // Will be set based on timeline position
    })
  }

  const transitionTypes = [
    { value: "crossfade", label: "Crossfade", description: "Smooth blend between clips" },
    { value: "slide", label: "Slide", description: "Slide transition effect" },
    { value: "fade", label: "Fade", description: "Fade to black transition" },
    { value: "wipe", label: "Wipe", description: "Wipe transition effect" },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-200">Transitions</h3>
        <Button size="sm" onClick={handleAddTransition} className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg hover:shadow-xl">
          Add Transition
        </Button>
      </div>

      {/* Add New Transition */}
      <Card className="p-4 bg-gray-800 border-gray-700">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Transition Type</label>
            <Select value={newTransitionType} onValueChange={(value: any) => setNewTransitionType(value)}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {transitionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-white hover:bg-gray-700">
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-gray-400">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-2 block">Duration: {newTransitionDuration[0]}s</label>
            <Slider
              value={newTransitionDuration}
              onValueChange={setNewTransitionDuration}
              min={0.1}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* Existing Transitions */}
      <div className="space-y-2">
        {transitions.map((transition) => (
          <Card
            key={transition.id}
            className={`p-3 border cursor-pointer transition-colors ${
              selectedTransition === transition.id
                ? "bg-blue-900/30 border-blue-500"
                : "bg-gray-800 border-gray-700 hover:bg-gray-750"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span className="text-sm font-medium text-white capitalize">{transition.type}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemoveTransition(transition.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Duration: {transition.duration}s</label>
                <Slider
                  value={[transition.duration]}
                  onValueChange={(value) => onUpdateTransition(transition.id, { duration: value[0] })}
                  min={0.1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="text-xs text-gray-400">Position: {transition.position.toFixed(1)}s</div>
            </div>
          </Card>
        ))}
      </div>

      {transitions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-sm">No transitions added</div>
          <div className="text-xs mt-1">Add transitions between clips for smooth video flow</div>
        </div>
      )}
    </div>
  )
}
