"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { ZoomIn, ZoomOut, Scissors, Copy, Trash2, Volume2, VolumeX, Lock, Unlock, Eye, EyeOff } from "lucide-react"

interface TimelineClip {
  id: string
  name: string
  startTime: number
  duration: number
  type: "video" | "image" | "audio"
  track: number
  url: string
  thumbnail?: string
  volume: number
  locked: boolean
  visible: boolean
  trimStart: number
  trimEnd: number
}

interface TimelineTrack {
  id: string
  name: string
  type: "video" | "audio"
  height: number
  locked: boolean
  visible: boolean
  muted: boolean
}

interface TimelineProps {
  duration: number
  currentTime: number
  onTimeChange: (time: number) => void
  selectedClip: string | null
  onClipSelect: (clipId: string | null) => void
}

export function Timeline({ duration, currentTime, onTimeChange, selectedClip, onClipSelect }: TimelineProps) {
  const [clips, setClips] = useState<TimelineClip[]>([])
  const [tracks, setTracks] = useState<TimelineTrack[]>([
  ])
  const [zoom, setZoom] = useState([1])
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [resizing, setResizing] = useState<{ clipId: string; side: "left" | "right" } | null>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const [snapToGrid, setSnapToGrid] = useState(true)

  const pixelsPerSecond = 50 * zoom[0]
  const timelineWidth = duration * pixelsPerSecond
  const snapInterval = 0.5 // Snap to half-second intervals

  const snapTime = useCallback(
    (time: number) => {
      if (!snapToGrid) return time
      return Math.round(time / snapInterval) * snapInterval
    },
    [snapToGrid, snapInterval],
  )

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const data = event.dataTransfer.getData("application/json")
      if (!data) return

      try {
        const mediaItem = JSON.parse(data)
        const rect = timelineRef.current?.getBoundingClientRect()
        if (!rect) return

        const x = event.clientX - rect.left
        const startTime = snapTime(x / pixelsPerSecond)

        // Find appropriate track
        const y = event.clientY - rect.top
        const trackIndex = Math.floor(y / 100) // Approximate track height
        const availableTrack = tracks.find((track, index) => {
          if (mediaItem.type === "audio" && track.type === "audio") return true
          if (mediaItem.type !== "audio" && track.type === "video") return true
          return false
        })

        if (!availableTrack) return

        const newClip: TimelineClip = {
          id: Math.random().toString(36).substr(2, 9),
          name: mediaItem.name,
          startTime: Math.max(0, startTime),
          duration: mediaItem.duration || (mediaItem.type === "image" ? 3 : 5),
          type: mediaItem.type,
          track: tracks.indexOf(availableTrack),
          url: mediaItem.url,
          thumbnail: mediaItem.thumbnail,
          volume: 100,
          locked: false,
          visible: true,
          trimStart: 0,
          trimEnd: 0,
        }

        setClips((prev) => [...prev, newClip])
      } catch (error) {
        console.error("Error parsing dropped data:", error)
      }
    },
    [pixelsPerSecond, snapTime, tracks],
  )

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleTimelineClick = (event: React.MouseEvent) => {
    if (isDragging || resizing) return

    const rect = timelineRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = event.clientX - rect.left
    const time = snapTime(x / pixelsPerSecond)
    onTimeChange(Math.max(0, Math.min(duration, time)))
  }

  const handleClipMouseDown = (event: React.MouseEvent, clipId: string) => {
    event.stopPropagation()
    onClipSelect(clipId)

    const rect = timelineRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = event.clientX - rect.left
    const clip = clips.find((c) => c.id === clipId)
    if (!clip) return

    const clipStartX = clip.startTime * pixelsPerSecond
    setDragOffset(x - clipStartX)
    setIsDragging(true)

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - rect.left - dragOffset
      const newStartTime = snapTime(Math.max(0, newX / pixelsPerSecond))

      setClips((prev) => prev.map((c) => (c.id === clipId ? { ...c, startTime: Math.max(0, newStartTime) } : c)))
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const handleResizeStart = (event: React.MouseEvent, clipId: string, side: "left" | "right") => {
    event.stopPropagation()
    setResizing({ clipId, side })

    const handleMouseMove = (e: MouseEvent) => {
      const rect = timelineRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = e.clientX - rect.left
      const time = snapTime(x / pixelsPerSecond)

      setClips((prev) =>
        prev.map((clip) => {
          if (clip.id !== clipId) return clip

          if (side === "left") {
            const maxStart = clip.startTime + clip.duration - 0.1
            const newStart = Math.max(0, Math.min(time, maxStart))
            const newDuration = clip.duration + (clip.startTime - newStart)
            return { ...clip, startTime: newStart, duration: newDuration }
          } else {
            const minEnd = clip.startTime + 0.1
            const newEnd = Math.max(minEnd, time)
            const newDuration = newEnd - clip.startTime
            return { ...clip, duration: newDuration }
          }
        }),
      )
    }

    const handleMouseUp = () => {
      setResizing(null)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const getClipStyle = (clip: TimelineClip) => {
    const left = clip.startTime * pixelsPerSecond
    const width = clip.duration * pixelsPerSecond
    const track = tracks[clip.track]
    const top = tracks.slice(0, clip.track).reduce((acc, t) => acc + t.height + 4, 0)

    return {
      left: `${left}px`,
      width: `${width}px`,
      top: `${top}px`,
      height: `${track?.height || 80}px`,
    }
  }

  const handleClipAction = (action: string, clipId: string) => {
    switch (action) {
      case "copy":
        const clipToCopy = clips.find((c) => c.id === clipId)
        if (clipToCopy) {
          const newClip = {
            ...clipToCopy,
            id: Math.random().toString(36).substr(2, 9),
            startTime: clipToCopy.startTime + clipToCopy.duration,
          }
          setClips((prev) => [...prev, newClip])
        }
        break
      case "delete":
        setClips((prev) => prev.filter((c) => c.id !== clipId))
        if (selectedClip === clipId) onClipSelect(null)
        break
      case "split":
        const clipToSplit = clips.find((c) => c.id === clipId)
        if (clipToSplit) {
          const splitTime = currentTime - clipToSplit.startTime
          if (splitTime > 0 && splitTime < clipToSplit.duration) {
            const firstPart = { ...clipToSplit, duration: splitTime }
            const secondPart = {
              ...clipToSplit,
              id: Math.random().toString(36).substr(2, 9),
              startTime: clipToSplit.startTime + splitTime,
              duration: clipToSplit.duration - splitTime,
            }

            setClips((prev) => prev.filter((c) => c.id !== clipId).concat([firstPart, secondPart]))
          }
        }
        break
    }

  }

  const toggleTrackProperty = (trackId: string, property: "locked" | "visible" | "muted") => {
    setTracks((prev) =>
      prev.map((track) => (track.id === trackId ? { ...track, [property]: !track[property] } : track)),
    )

  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const frames = Math.floor((seconds % 1) * 30) // Assuming 30fps
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${frames.toString().padStart(2, "0")}`
  }

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Timeline Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold">Timeline</h3>
          <Badge variant="outline">{formatTime(currentTime)}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={snapToGrid ? "default" : "ghost"}
            size="sm"
            onClick={() => setSnapToGrid(!snapToGrid)}
            className="text-xs"
          >
            Snap
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setZoom([Math.max(0.25, zoom[0] - 0.25)])}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <div className="w-20">
            <Slider value={zoom} onValueChange={setZoom} min={0.25} max={4} step={0.25} />
          </div>
          <Button variant="ghost" size="sm" onClick={() => setZoom([Math.min(4, zoom[0] + 0.25)])}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-12 text-center">{Math.round(zoom[0] * 100)}%</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Track Headers */}
        <div className="w-48 border-r border-border bg-muted/20">
          <div className="h-12 border-b border-border flex items-center px-4">
            <span className="text-sm font-medium">Tracks</span>
          </div>
          {tracks.map((track) => (
            <div
              key={track.id}
              className="border-b border-border flex items-center justify-between px-4"
              style={{ height: `${track.height + 4}px` }}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{track.name}</span>
                <Badge variant="outline" className="text-xs">
                  {track.type}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTrackProperty(track.id, "visible")}
                  className="h-6 w-6 p-0"
                >
                  {track.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTrackProperty(track.id, "muted")}
                  className="h-6 w-6 p-0"
                >
                  {track.muted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTrackProperty(track.id, "locked")}
                  className="h-6 w-6 p-0"
                >
                  {track.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-auto">
          {/* Time Ruler */}
          <div className="h-12 border-b border-border bg-muted/20 relative" style={{ width: `${timelineWidth}px` }}>
            {Array.from({ length: Math.ceil(duration * 2) + 1 }, (_, i) => {
              const time = i * 0.5
              const isSecond = i % 2 === 0
              return (
                <div
                  key={i}
                  className="absolute top-0 text-xs text-muted-foreground"
                  style={{ left: `${time * pixelsPerSecond}px` }}
                >
                  <div className={`w-px bg-border mb-1 ${isSecond ? "h-6" : "h-3"}`}></div>
                  {isSecond && <span className="absolute -translate-x-1/2">{formatTime(time)}</span>}
                </div>
              )
            })}
          </div>

          {/* Timeline Tracks */}
          <div
            ref={timelineRef}
            className="relative bg-muted/10 cursor-pointer"
            style={{
              width: `${timelineWidth}px`,
              height: `${tracks.reduce((acc, track) => acc + track.height + 4, 0)}px`,
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={handleTimelineClick}
          >
            {/* Track Backgrounds */}
            {tracks.map((track, index) => (
              <div
                key={track.id}
                className="absolute border-b border-border/50"
                style={{
                  top: `${tracks.slice(0, index).reduce((acc, t) => acc + t.height + 4, 0)}px`,
                  height: `${track.height}px`,
                  width: "100%",
                  backgroundColor: track.type === "video" ? "rgba(59, 130, 246, 0.05)" : "rgba(34, 197, 94, 0.05)",
                }}
              />
            ))}

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-primary z-20 pointer-events-none"
              style={{ left: `${currentTime * pixelsPerSecond}px` }}
            >
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-primary rounded-full"></div>
            </div>

            {/* Clips */}
            {clips.map((clip) => (
              <ContextMenu key={clip.id}>
                <ContextMenuTrigger>
                  <div
                    className={`absolute rounded-md border-2 cursor-pointer transition-all overflow-hidden ${
                      selectedClip === clip.id
                        ? "border-primary bg-primary/20 shadow-lg"
                        : "border-accent bg-accent hover:bg-accent/80"
                    } ${clip.locked ? "opacity-60" : ""}`}
                    style={getClipStyle(clip)}
                    onMouseDown={(e) => !clip.locked && handleClipMouseDown(e, clip.id)}
                  >
                    {/* Resize Handles */}
                    {!clip.locked && (
                      <>
                        <div
                          className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize bg-primary/20 hover:bg-primary/40"
                          onMouseDown={(e) => handleResizeStart(e, clip.id, "left")}
                        />
                        <div
                          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize bg-primary/20 hover:bg-primary/40"
                          onMouseDown={(e) => handleResizeStart(e, clip.id, "right")}
                        />
                      </>
                    )}

                    {/* Clip Content */}
                    <div className="p-2 h-full flex flex-col justify-between pointer-events-none">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium truncate flex-1">{clip.name}</p>
                        {clip.locked && <Lock className="h-3 w-3 ml-1" />}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{formatTime(clip.duration)}</p>
                        {clip.type === "audio" && (
                          <Volume2 className={`h-3 w-3 ${clip.volume === 0 ? "text-muted-foreground" : ""}`} />
                        )}
                      </div>
                    </div>

                    {/* Thumbnail for video clips */}
                    {clip.thumbnail && clip.type === "video" && (
                      <div
                        className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none"
                        style={{ backgroundImage: `url(${clip.thumbnail})` }}
                      />
                    )}
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => handleClipAction("copy", clip.id)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => handleClipAction("split", clip.id)}>
                    <Scissors className="h-4 w-4 mr-2" />
                    Split at Playhead
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => handleClipAction("delete", clip.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}

            {/* Drop Zone Indicator */}
            {clips.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-muted-foreground text-sm">Drop media files here to add them to the timeline</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
