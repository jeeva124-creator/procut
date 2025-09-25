"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, Video, ImageIcon, Music, Search, Folder, Trash2, Eye, Download, Clock } from "lucide-react"

interface MediaItem {
  id: string
  name: string
  type: "video" | "image" | "audio"
  url: string
  duration?: number
  thumbnail?: string
  size: number
  uploadDate: Date
  dimensions?: { width: number; height: number }
}

export function MediaLibrary() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<"all" | "video" | "image" | "audio">("all")
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateThumbnail = useCallback((file: File, type: string): Promise<string> => {
    return new Promise((resolve) => {
      if (type === "image") {
        const url = URL.createObjectURL(file)
        resolve(url)
      } else if (type === "video") {
        const video = document.createElement("video")
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          video.currentTime = 1 // Seek to 1 second for thumbnail
        }

        video.onseeked = () => {
          if (ctx) {
            ctx.drawImage(video, 0, 0)
            const thumbnail = canvas.toDataURL("image/jpeg", 0.7)
            resolve(thumbnail)
          }
        }

        video.src = URL.createObjectURL(file)
      } else {
        // Audio files get a default thumbnail
        resolve("/audio-waveform.png")
      }
    })
  }, [])

  const getMediaDuration = useCallback((file: File, type: string): Promise<number | undefined> => {
    return new Promise((resolve) => {
      if (type === "video") {
        const video = document.createElement("video")
        video.onloadedmetadata = () => {
          resolve(video.duration)
        }
        video.src = URL.createObjectURL(file)
      } else if (type === "audio") {
        const audio = document.createElement("audio")
        audio.onloadedmetadata = () => {
          resolve(audio.duration)
        }
        audio.src = URL.createObjectURL(file)
      } else {
        resolve(undefined)
      }
    })
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const fileArray = Array.from(files)

    for (const file of fileArray) {
      const fileId = Math.random().toString(36).substr(2, 9)
      const type = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : "audio"

      // Simulate upload progress
      setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }))

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const currentProgress = prev[fileId] || 0
          if (currentProgress >= 100) {
            clearInterval(progressInterval)
            return { ...prev, [fileId]: 100 }
          }
          return { ...prev, [fileId]: currentProgress + 20 }
        })
      }, 200)

      try {
        const [thumbnail, duration] = await Promise.all([generateThumbnail(file, type), getMediaDuration(file, type)])

        const newItem: MediaItem = {
          id: fileId,
          name: file.name,
          type,
          url: URL.createObjectURL(file),
          duration,
          thumbnail,
          size: file.size,
          uploadDate: new Date(),
          dimensions: type === "image" ? { width: 1920, height: 1080 } : undefined,
        }

        setTimeout(() => {
          setMediaItems((prev) => [...prev, newItem])
          setUploadProgress((prev) => {
            const { [fileId]: _, ...rest } = prev
            return rest
          })
        }, 1000)
      } catch (error) {
        console.error("Error processing file:", error)
        setUploadProgress((prev) => {
          const { [fileId]: _, ...rest } = prev
          return rest
        })
      }
    }
  }

  const handleDeleteItem = (itemId: string) => {
    setMediaItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const filteredItems = mediaItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.type === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleDragStart = (event: React.DragEvent, item: MediaItem) => {
    event.dataTransfer.setData("application/json", JSON.stringify(item))
  }

  const handlePreview = (item: MediaItem) => {
    setSelectedItem(item)
    setIsPreviewOpen(true)
  }

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-4">
            <Folder className="h-5 w-5" />
            <h2 className="font-semibold">Media Library</h2>
            <Badge variant="secondary" className="ml-auto">
              {mediaItems.length} items
            </Badge>
          </div>

          {/* Upload Button */}
          <Button onClick={() => fileInputRef.current?.click()} className="w-full gap-2 mb-4">
            <Upload className="h-4 w-4" />
            Upload Media
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="video/*,image/*,audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filters */}
          <div className="flex gap-1">
            {[
              { key: "all", label: "All", icon: Folder },
              { key: "video", label: "Video", icon: Video },
              { key: "image", label: "Image", icon: ImageIcon },
              { key: "audio", label: "Audio", icon: Music },
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(key as any)}
                className="flex-1 gap-1"
              >
                <Icon className="h-3 w-3" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="p-4 border-b border-border bg-muted/20">
            <h4 className="text-sm font-medium mb-2">Uploading...</h4>
            {Object.entries(uploadProgress).map(([id, progress]) => (
              <div key={id} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Processing file...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1">
                  <div className="bg-primary h-1 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Media Items */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="p-3 cursor-grab hover:bg-accent/50 transition-colors group"
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
              >
                <div className="aspect-video bg-muted rounded-md mb-2 flex items-center justify-center relative overflow-hidden">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <>
                      {item.type === "video" && <Video className="h-8 w-8 text-muted-foreground" />}
                      {item.type === "image" && <ImageIcon className="h-8 w-8 text-muted-foreground" />}
                      {item.type === "audio" && <Music className="h-8 w-8 text-muted-foreground" />}
                    </>
                  )}

                  {/* Duration Badge */}
                  {item.duration && (
                    <Badge variant="secondary" className="absolute bottom-1 right-1 text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDuration(item.duration)}
                    </Badge>
                  )}

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handlePreview(item)}>
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteItem(item.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium truncate" title={item.name}>
                    {item.name}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="capitalize">{item.type}</span>
                    <span>{formatFileSize(item.size)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && Object.keys(uploadProgress).length === 0 && (
            <div className="text-center py-12">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No media files</p>
              <p className="text-sm text-muted-foreground">Upload videos, images, or audio files to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {selectedItem?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center overflow-hidden">
                {selectedItem.type === "video" && (
                  <video src={selectedItem.url} controls className="w-full h-full object-contain" />
                )}
                {selectedItem.type === "image" && (
                  <img
                    src={selectedItem.url || "/placeholder.svg"}
                    alt={selectedItem.name}
                    className="w-full h-full object-contain"
                  />
                )}
                {selectedItem.type === "audio" && (
                  <div className="w-full p-8">
                    <audio src={selectedItem.url} controls className="w-full" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="ml-2 capitalize">{selectedItem.type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Size:</span>
                  <span className="ml-2">{formatFileSize(selectedItem.size)}</span>
                </div>
                {selectedItem.duration && (
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="ml-2">{formatDuration(selectedItem.duration)}</span>
                  </div>
                )}
                {selectedItem.dimensions && (
                  <div>
                    <span className="text-muted-foreground">Dimensions:</span>
                    <span className="ml-2">
                      {selectedItem.dimensions.width} × {selectedItem.dimensions.height}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button variant="destructive" onClick={() => handleDeleteItem(selectedItem.id)}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
