"use client"

import type React from "react"
import { useCallback } from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2, Minus, Plus, Scissors } from "lucide-react"

interface Clip {
  id: string
  name: string
  duration: number
  startTime: number
  type: "video" | "audio" | "image"
  thumbnail?: string
  file?: File
  url?: string
  trimStart: number
  trimEnd: number
}

interface BottomTimelineProps {
  clips: Clip[]
  duration: number
  currentTime: number
  isPlaying: boolean
  onTimeChange: (time: number) => void
  onPlayPause: () => void
  selectedClip: string | null
  onClipSelect: (clipId: string | null) => void
  setClips: React.Dispatch<React.SetStateAction<Clip[]>>
  onTrimChange?: (clipId: string, trimStart: number, trimEnd: number) => void
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
    id: string; 
    side: "left" | "right"; 
    startClientX: number; 
    startStart: number; 
    startDuration: number;
    startTrimStart: number;
    startTrimEnd: number;
    originalDuration: number;
  } | null>(null)

  // Generate time markers
  const timeMarkers = []
  const step = 0.02
  for (let i = 0; i <= duration; i += step) {
    timeMarkers.push(i)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    const milliseconds = Math.floor((time % 1) * 100)
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`
  }

  const handleTimelineClick = (event: React.MouseEvent) => {
    if (!timelineRef.current) return
    const rect = timelineRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const percentage = x / rect.width
    const newTime = percentage * duration
    onTimeChange(Math.max(0, Math.min(duration, newTime)))
  }

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      try {
        const clipData = JSON.parse(event.dataTransfer.getData("application/json"))
        const rect = timelineRef.current?.getBoundingClientRect()
        if (!rect) return
        const x = event.clientX - rect.left
        const percentage = x / rect.width
        const dropTime = percentage * duration
        const newClip = {
          ...clipData,
          startTime: dropTime,
          id: `timeline-${Date.now()}`,
          trimStart: clipData.trimStart || 0,
          trimEnd: clipData.trimEnd || clipData.duration || 10,
        }
        setClips((prevClips) => [...prevClips, newClip])
        console.log("[v0] Clip dropped on timeline:", newClip.name, "Type:", newClip.type, "Duration:", newClip.duration)
      } catch (error) {
        console.error("Error dropping clip:", error)
      }
    },
    [duration, setClips],
  )

  const onClipMouseDown = useCallback(
    (e: React.MouseEvent, clipId: string) => {
      e.stopPropagation()
      if (!timelineRef.current) return
      const rect = timelineRef.current.getBoundingClientRect()
      const pixelsToSeconds = duration / rect.width
      const clip = clips.find((c) => c.id === clipId)
      if (!clip) return
      const clickX = e.clientX - rect.left
      const clipLeftPx = (clip.startTime / duration) * rect.width
      const offsetPx = clickX - clipLeftPx
      const offsetSec = offsetPx * pixelsToSeconds
      draggingRef.current = { id: clipId, offsetSec }
      window.addEventListener("mousemove", onWindowMouseMove)
      window.addEventListener("mouseup", onWindowMouseUp)
    },
    [clips, duration],
  )

  const onWindowMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!timelineRef.current) return
      if (!draggingRef.current && !resizingRef.current) return
      const rect = timelineRef.current.getBoundingClientRect()
      const x = Math.min(Math.max(e.clientX, rect.left), rect.right) - rect.left
      const pixelsToSeconds = duration / rect.width

      if (draggingRef.current) {
        const { id, offsetSec } = draggingRef.current
        const newStart = Math.max(0, x * pixelsToSeconds - offsetSec)
        setClips((prev) => prev.map((c) => (c.id === id ? { ...c, startTime: Math.min(newStart, Math.max(0, duration - c.duration)) } : c)))
      }

      if (resizingRef.current) {
        const { id, side, startClientX, startTrimStart, startTrimEnd, originalDuration } = resizingRef.current
        const deltaPx = e.clientX - startClientX
        const deltaSec = deltaPx * pixelsToSeconds
        const minTrimDuration = 0.1
        setClips((prev) => prev.map((clip) => {
          if (clip.id !== id) return clip
          let updatedClip = clip
          if (side === "left") {
            const newTrimStart = Math.max(0, Math.min(startTrimStart + deltaSec, startTrimEnd - minTrimDuration))
            updatedClip = { ...clip, trimStart: newTrimStart }
          } else {
            const newTrimEnd = Math.min(originalDuration, Math.max(startTrimStart + minTrimDuration, startTrimEnd + deltaSec))
            updatedClip = { ...clip, trimEnd: newTrimEnd }
          }
          if (onTrimChange) onTrimChange(updatedClip.id, updatedClip.trimStart, updatedClip.trimEnd)
          return updatedClip
        }))
      }
    },
    [duration, setClips, onTrimChange],
  )

  const onWindowMouseUp = useCallback(() => {
    draggingRef.current = null
    resizingRef.current = null
    window.removeEventListener("mousemove", onWindowMouseMove)
    window.removeEventListener("mouseup", onWindowMouseUp)
  }, [onWindowMouseMove])

  const onResizeHandleMouseDown = useCallback(
    (e: React.MouseEvent, clipId: string, side: "left" | "right") => {
      e.stopPropagation()
      const clip = clips.find((c) => c.id === clipId)
      if (!clip) return
      resizingRef.current = {
        id: clipId,
        side,
        startClientX: e.clientX,
        startStart: clip.startTime,
        startDuration: clip.duration,
        startTrimStart: clip.trimStart,
        startTrimEnd: clip.trimEnd,
        originalDuration: clip.duration,
      }
      window.addEventListener("mousemove", onWindowMouseMove)
      window.addEventListener("mouseup", onWindowMouseUp)
    },
    [clips, onWindowMouseMove, onWindowMouseUp],
  )

  const splitClipAtPlayhead = useCallback(
    (clipId: string) => {
      const clip = clips.find((c) => c.id === clipId)
      if (!clip) return
      const splitTime = currentTime - clip.startTime
      if (splitTime <= 0 || splitTime >= clip.duration) return
      const first = { ...clip, duration: splitTime }
      const second = { ...clip, id: `${clip.id}-b-${Date.now()}`, startTime: clip.startTime + splitTime, duration: clip.duration - splitTime }
      setClips((prev) => prev.flatMap((c) => (c.id === clipId ? [first, second] : [c])))
      onClipSelect(second.id)
    },
    [clips, currentTime, setClips, onClipSelect],
  )

  return (
  <div className="h-full flex flex-col bg-[#2a2a2a]">
    <div className="flex items-center justify-between p-4 border-b border-[#3a3a3a]">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white hover:bg-[#3a3a3a]"
          onClick={() => onTimeChange(Math.max(0, currentTime - 0.1))}
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-[#3a3a3a] w-10 h-10"
          onClick={onPlayPause}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white hover:bg-[#3a3a3a]"
          onClick={() => onTimeChange(Math.min(duration, currentTime + 0.1))}
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
          <div className="w-20">
            <Slider
              value={[volume]}
              onValueChange={(newVolumeArray: number[]) => {
                const newVolume = newVolumeArray[0];
                setVolume(newVolume);
                if (onVolumeChange) onVolumeChange(newVolume);
              }}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-[#3a3a3a] w-8 h-8"
            onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-[#3a3a3a] w-8 h-8"
            onClick={() => setZoom(zoom + 0.1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-[#3a3a3a] w-8 h-8"
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>

    <div className="flex-1 relative w-full min-w-0">
      <div className="h-8 bg-[#1a1a1a] border-b border-[#3a3a3a] relative overflow-hidden">
        {timeMarkers.map((time, index) => {
          const isSecond = time % 1 === 0;
          const position = (time / duration) * 100;
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
              {!isSecond && time % 0.1 === 0 && <div className="w-px h-2 bg-[#3a3a3a]" />}
            </div>
          );
        })}
      </div>

      <div
        ref={timelineRef}
        className="flex-1 bg-[#2a2a2a] relative cursor-pointer min-h-[120px] w-full overflow-hidden"
        onClick={handleTimelineClick}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <div
          className="absolute top-0 bottom-0 w-1 bg-red-500 z-30 pointer-events-none shadow-lg"
          style={{ left: `${Math.min(100, Math.max(0, (currentTime / duration) * 100))}%` }}
        >
          <div className="absolute -top-3 -left-2 w-5 h-5 bg-red-500 rounded-full border-2 border-white shadow-lg" />
          <div className="absolute -bottom-3 -left-2 w-5 h-5 bg-red-500 rounded-full border-2 border-white shadow-lg" />
        </div>

        <div className="absolute top-4 left-0 right-0 h-16 bg-[#1a1a1a] border border-[#3a3a3a] mx-4 rounded">
          <div className="flex items-center justify-center h-full">
            <div className="w-16 h-12 bg-[#2a2a2a] rounded flex items-center justify-center">
              <img
                src="/sample-video-clip.jpg"
                alt="Video clip"
                className="w-full h-full object-cover rounded"
              />
            </div>
          </div>
        </div>

        {clips.map((clip) => {
          const trimmedDuration = clip.trimEnd - clip.trimStart;
          const clipWidth = (trimmedDuration / duration) * 100;
          const clipLeft = (clip.startTime / duration) * 100;
          return (
            <div
              key={clip.id}
              className={`absolute ${
                clip.type === "audio" ? "top-8" : "top-20"
              } h-12 ${
                clip.type === "audio" ? "bg-green-600" : "bg-blue-600"
              } rounded border-2 ${
                selectedClip === clip.id ? "border-white" : "border-transparent"
              } group relative overflow-hidden cursor-pointer`}
              style={{ left: `${clipLeft}%`, width: `${clipWidth}%`, minWidth: "60px" }}
              onClick={(e) => {
                e.stopPropagation();
                onClipSelect(clip.id);
              }}
              onMouseDown={(e) => onClipMouseDown(e, clip.id)}
            >
              <div className="p-2 text-xs text-white truncate select-none">{clip.name}</div>

              <div
                className="absolute left-0 top-0 h-full w-4 bg-yellow-400 cursor-col-resize hover:bg-yellow-300 transition-all z-20 border border-yellow-600"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onResizeHandleMouseDown(e, clip.id, "left");
                }}
                title="Drag to trim start"
                style={{ minWidth: "16px" }}
              >
                <div className="absolute left-1 top-1/2 transform -translate-y-1/2 w-2 h-8 bg-yellow-600 rounded opacity-80"></div>
              </div>

              <div
                className="absolute right-0 top-0 h-full w-4 bg-yellow-400 cursor-col-resize hover:bg-yellow-300 transition-all z-20 border border-yellow-600"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onResizeHandleMouseDown(e, clip.id, "right");
                }}
                title="Drag to trim end"
                style={{ minWidth: "16px" }}
              >
                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-2 h-8 bg-yellow-600 rounded opacity-80"></div>
              </div>

              <button
                className="absolute -top-3 -right-3 bg-black/60 hover:bg-black text-white rounded-full p-1"
                title="Split at playhead"
                onClick={(e) => {
                  e.stopPropagation();
                  splitClipAtPlayhead(clip.id);
                }}
              >
                <Scissors className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  </div>
)}
