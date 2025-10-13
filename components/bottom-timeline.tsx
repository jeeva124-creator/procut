"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize2,
  Minus,
  Plus,
  Scissors,
} from "lucide-react"

// ✅ Define types
interface Clip {
  id: string
  name: string
  startTime: number
  duration: number
  trimStart: number
  trimEnd: number
  type: "video" | "audio" | "image"
}

interface BottomTimelineProps {
  clips: Clip[]
  duration: number
  currentTime: number
  isPlaying: boolean
  onTimeChange: (time: number) => void
  onPlayPause: () => void
  selectedClip: string | null
  onClipSelect: (id: string) => void
  setClips: React.Dispatch<React.SetStateAction<Clip[]>>
  onTrimChange?: (id: string, start: number, end: number) => void
  onVolumeChange?: (volume: number) => void
}

export function BottomTimeline({
  clips,
  duration,
  currentTime,
  isPlaying,
  onTimeChange,
  onPlayPause,
  selectedClip,
  onClipSelect,
  setClips,
  onTrimChange,
  onVolumeChange,
}: BottomTimelineProps) {
  const [zoom, setZoom] = useState(1)
  const [volume, setVolume] = useState(80)
  const timelineRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef<{ id: string; offsetSec: number } | null>(null)
  const resizingRef = useRef<{
    id: string
    side: "left" | "right"
    startClientX: number
    startTrimStart: number
    startTrimEnd: number
    originalDuration: number
  } | null>(null)

  // ✅ Trimming logic
  const onWindowMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!timelineRef.current) return
      const rect = timelineRef.current.getBoundingClientRect()
      const pixelsToSeconds = duration / rect.width

      if (resizingRef.current) {
        const { id, side, startClientX, startTrimStart, startTrimEnd, originalDuration } =
          resizingRef.current
        const deltaPx = e.clientX - startClientX
        const deltaSec = deltaPx * pixelsToSeconds
        const minTrimDuration = 0.1

        setClips((prev) =>
          prev.map((clip) => {
            if (clip.id !== id) return clip
            let newTrimStart = clip.trimStart
            let newTrimEnd = clip.trimEnd

            if (side === "left") {
              newTrimStart = Math.max(
                0,
                Math.min(startTrimStart + deltaSec, startTrimEnd - minTrimDuration),
              )
            } else {
              newTrimEnd = Math.min(
                originalDuration,
                Math.max(startTrimStart + minTrimDuration, startTrimEnd + deltaSec),
              )
            }

            const updatedClip = { ...clip, trimStart: newTrimStart, trimEnd: newTrimEnd }
            if (onTrimChange) onTrimChange(updatedClip.id, newTrimStart, newTrimEnd)
            return updatedClip
          }),
        )
      }
    },
    [duration, setClips, onTrimChange],
  )

  // ✅ Attach listeners for trimming
  useEffect(() => {
    const handleMouseUp = () => {
      resizingRef.current = null
      draggingRef.current = null
    }
    window.addEventListener("mousemove", onWindowMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    return () => {
      window.removeEventListener("mousemove", onWindowMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [onWindowMouseMove])

  // ✅ Resize start
  const onResizeHandleMouseDown = (
    e: React.MouseEvent,
    clipId: string,
    side: "left" | "right",
  ) => {
    e.stopPropagation()
    const clip = clips.find((c) => c.id === clipId)
    if (!clip) return
    resizingRef.current = {
      id: clipId,
      side,
      startClientX: e.clientX,
      startTrimStart: clip.trimStart,
      startTrimEnd: clip.trimEnd,
      originalDuration: clip.duration,
    }
  }

  // ✅ Split clip
  const splitClipAtPlayhead = useCallback(
    (clipId: string) => {
      const clip = clips.find((c) => c.id === clipId)
      if (!clip) return
      const splitTime = currentTime - clip.startTime
      if (splitTime <= 0 || splitTime >= clip.duration) return
      const first = { ...clip, duration: splitTime, trimEnd: splitTime }
      const second = {
        ...clip,
        id: `${clip.id}-b-${Date.now()}`,
        startTime: clip.startTime + splitTime,
        duration: clip.duration - splitTime,
        trimStart: 0,
        trimEnd: clip.duration - splitTime,
      }
      setClips((prev) => prev.flatMap((c) => (c.id === clipId ? [first, second] : [c])))
      onClipSelect(second.id)
    },
    [clips, currentTime, setClips, onClipSelect],
  )

  // ✅ Helper functions
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = (time % 60).toFixed(1).padStart(4, "0")
    return `${minutes}:${seconds}`
  }

  const timeMarkers = Array.from({ length: Math.ceil(duration * 10) }, (_, i) => i / 10)

  const onClipMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    onClipSelect(id)
  }

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return
    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pixelsToSeconds = duration / rect.width
    const newTime = x * pixelsToSeconds
    onTimeChange(newTime)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    // custom logic for dropped clips if needed
  }

  // ✅ Full JSX UI
  return (
    <div className="h-full flex flex-col bg-[#2a2a2a]">
      {/* --- Controls --- */}
      <div className="flex items-center justify-between p-4 border-b border-[#3a3a3a]">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onTimeChange(Math.max(0, currentTime - 0.1))}
            className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50"
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            variant="default"
            size="icon"
            onClick={onPlayPause}
            className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onTimeChange(Math.min(duration, currentTime + 0.1))}
            className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-sm text-gray-300 font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-gray-400" />
            <Slider
              value={[volume]}
              onValueChange={(newVal) => {
                const newVolume = newVal[0]
                setVolume(newVolume)
                if (onVolumeChange) onVolumeChange(newVolume)
              }}
              max={100}
              step={1}
              className="w-20"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
              className="bg-gray-800/50 border-gray-600 text-gray-300"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(zoom + 0.1)}
              className="bg-gray-800/50 border-gray-600 text-gray-300"
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-gray-800/50 border-gray-600 text-gray-300"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* --- Timeline --- */}
      <div className="flex-1 relative w-full min-w-0">
        <div className="h-8 bg-[#1a1a1a] border-b border-[#3a3a3a] relative overflow-hidden">
          {timeMarkers.map((time, index) => {
            const isSecond = time % 1 === 0
            const position = (time / duration) * 100
            return (
              <div key={index} className="absolute top-0 h-full" style={{ left: `${position}%` }}>
                {isSecond && (
                  <>
                    <div className="w-px h-full bg-[#4a4a4a]" />
                    <div className="absolute top-1 left-1 text-xs text-gray-400 font-mono">
                      {formatTime(time)}
                    </div>
                  </>
                )}
                {!isSecond && time % 0.1 === 0 && (
                  <div className="w-px h-2 bg-[#3a3a3a]" />
                )}
              </div>
            )
          })}
        </div>

        <div
          ref={timelineRef}
          className="flex-1 bg-[#2a2a2a] relative cursor-pointer min-h-[160px] w-full overflow-hidden"
          onClick={handleTimelineClick}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-red-500 z-30 pointer-events-none"
            style={{ left: `${Math.min(100, Math.max(0, (currentTime / duration) * 100))}%` }}
          >
            <div className="absolute -top-3 -left-2 w-5 h-5 bg-red-500 rounded-full border-2 border-white" />
            <div className="absolute -bottom-3 -left-2 w-5 h-5 bg-red-500 rounded-full border-2 border-white" />
          </div>

          {/* Video Track */}
          <Track
            label="V"
            color="bg-blue-600"
            clips={clips.filter((c) => c.type !== "audio")}
            duration={duration}
            selectedClip={selectedClip}
            onClipSelect={onClipSelect}
            onClipMouseDown={onClipMouseDown}
            onResizeHandleMouseDown={onResizeHandleMouseDown}
            splitClipAtPlayhead={splitClipAtPlayhead}
          />

          {/* Audio Track */}
          <Track
            label="A"
            color="bg-green-600"
            clips={clips.filter((c) => c.type === "audio")}
            duration={duration}
            selectedClip={selectedClip}
            onClipSelect={onClipSelect}
            onClipMouseDown={onClipMouseDown}
            onResizeHandleMouseDown={onResizeHandleMouseDown}
            splitClipAtPlayhead={splitClipAtPlayhead}
          />
        </div>
      </div>
    </div>
  )
}

function Track({
  label,
  color,
  clips,
  duration,
  selectedClip,
  onClipSelect,
  onClipMouseDown,
  onResizeHandleMouseDown,
  splitClipAtPlayhead,
}: {
  label: string
  color: string
  clips: Clip[]
  duration: number
  selectedClip: string | null
  onClipSelect: (id: string) => void
  onClipMouseDown: (e: React.MouseEvent, id: string) => void
  onResizeHandleMouseDown: (e: React.MouseEvent, id: string, side: "left" | "right") => void
  splitClipAtPlayhead: (id: string) => void
}) {
  return (
    <div className="relative mt-2 mx-4 h-16 bg-[#1a1a1a] border border-[#3a3a3a] rounded">
      <div className="flex items-center px-2 h-full">
        <div className="w-12 h-8 bg-[#2a2a2a] rounded flex items-center justify-center mr-2">
          <span className="text-xs text-gray-400">{label}</span>
        </div>
        <div className="flex-1 h-full relative">
          {clips.map((clip) => {
            const trimmedDuration = clip.trimEnd - clip.trimStart
            const clipWidth = (trimmedDuration / duration) * 100
            const clipLeft = (clip.startTime / duration) * 100
            return (
              <div
                key={clip.id}
                className={`absolute top-1 h-10 ${color} rounded border-2 ${
                  selectedClip === clip.id ? "border-white" : "border-transparent"
                } overflow-hidden cursor-pointer`}
                style={{ left: `${clipLeft}%`, width: `${clipWidth}%`, minWidth: "60px" }}
                onClick={(e) => {
                  e.stopPropagation()
                  onClipSelect(clip.id)
                }}
                onMouseDown={(e) => onClipMouseDown(e, clip.id)}
              >
                <div className="p-2 text-xs text-white truncate">{clip.name}</div>

                {/* Trim Left */}
                <div
                  className="absolute left-0 top-0 h-full w-4 bg-yellow-400 cursor-col-resize border border-yellow-600"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    onResizeHandleMouseDown(e, clip.id, "left")
                  }}
                />

                {/* Trim Right */}
                <div
                  className="absolute right-0 top-0 h-full w-4 bg-yellow-400 cursor-col-resize border border-yellow-600"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    onResizeHandleMouseDown(e, clip.id, "right")
                  }}
                />

                {/* Split Button */}
                <button
                  className="absolute -top-3 -right-3 bg-black/60 hover:bg-black text-white rounded-full p-1"
                  title="Split at playhead"
                  onClick={(e) => {
                    e.stopPropagation()
                    splitClipAtPlayhead(clip.id)
                  }}
                >
                  <Scissors className="h-3 w-3" />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
