"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Upload, Search, Play, Clock, FileVideo } from "lucide-react"

interface Clip {
  id: string
  name: string
  duration: number
  startTime: number
  type: "video" | "audio" | "image"
  thumbnail?: string
  file?: File
  url?: string
}

interface MediaPanelProps {
  clips: Clip[]
  setClips: (clips: Clip[]) => void
  onClipSelect?: (clip: Clip) => void
}

export function MediaPanel({ clips, setClips, onClipSelect }: MediaPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (!files) return

      const newClips: Clip[] = []

      Array.from(files).forEach((file, index) => {
        const url = URL.createObjectURL(file)
        const newClip: Clip = {
          id: `clip-${Date.now()}-${index}`,
          name: file.name,
          duration: Math.random() * 10 + 1, // Will be updated when media loads
          startTime: 0,
          type: file.type.startsWith("video/") ? "video" : file.type.startsWith("audio/") ? "audio" : "image",
          thumbnail: file.type.startsWith("video/") ? url : undefined,
          file,
          url,
        }
        newClips.push(newClip)
      })

      setClips((prevClips) => [...prevClips, ...newClips])

      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    [setClips],
  )

  const handleClipClick = useCallback(
    (clip: Clip) => {
      console.log("[v0] Clip selected:", clip.name)
      if (onClipSelect) {
        onClipSelect(clip)
      }
    },
    [onClipSelect],
  )

  const filteredClips = clips.filter((clip) => clip.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#3a3a3a]">
        <h2 className="text-lg font-semibold text-white mb-3">Media</h2>

        {/* Upload Button */}
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-3"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Media
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/*,audio/*,image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search media..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#1a1a1a] border-[#3a3a3a] text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Media List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {filteredClips.map((clip) => (
            <div
              key={clip.id}
              className="group relative bg-[#1a1a1a] rounded-lg p-3 hover:bg-[#2a2a2a] cursor-pointer border border-[#3a3a3a] hover:border-[#4a4a4a] transition-colors"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("application/json", JSON.stringify(clip))
              }}
              onClick={() => handleClipClick(clip)}
            >
              {/* Thumbnail */}
              <div className="flex items-start gap-3">
                <div className="w-16 h-12 bg-[#2a2a2a] rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {clip.thumbnail ? (
                    <img
                      src={clip.thumbnail || "/placeholder.svg"}
                      alt={clip.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileVideo className="h-6 w-6 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{clip.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {Math.floor(clip.duration / 60)}:{(clip.duration % 60).toFixed(0).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 capitalize mt-1">{clip.type}</p>
                </div>
              </div>

              {/* Play Button Overlay */}
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 bg-black/50 hover:bg-black/70"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClipClick(clip)
                }}
              >
                <Play className="h-4 w-4 text-white" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
