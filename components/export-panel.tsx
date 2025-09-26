"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Settings, Video, FileText, Clock, HardDrive, Zap, CheckCircle, AlertCircle, X } from "lucide-react"

interface ExportJob {
  id: string
  name: string
  status: "queued" | "processing" | "completed" | "failed"
  progress: number
  quality: string
  format: string
  size?: string
  duration?: string
  createdAt: Date
  downloadUrl?: string
  blob?: Blob // Added blob for client-side download
}

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

interface ExportPanelProps {
  clips: any[]
  currentClip: any
  transform: any
  textLayers: any[]
  elements?: Element[]
}

export function ExportPanel({ clips, currentClip, transform, textLayers, elements = [] }: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [quality, setQuality] = useState("1080p")
  const [format, setFormat] = useState("mp4")
  const [codec, setCodec] = useState("h264")
  const [bitrate, setBitrate] = useState("5000")
  const [framerate, setFramerate] = useState("30")
  const [fileName, setFileName] = useState("my-video")
  const [includeAudio, setIncludeAudio] = useState(true)
  const [includeTextLayers, setIncludeTextLayers] = useState(true)
  const [includeElements, setIncludeElements] = useState(true)
  const [useExternalAudio, setUseExternalAudio] = useState(false)
  const [externalAudioUrl, setExternalAudioUrl] = useState<string | null>(null)
  const [videoAudioVolume, setVideoAudioVolume] = useState(100)
  const [externalAudioVolume, setExternalAudioVolume] = useState(100)
  const [externalAudioOffset, setExternalAudioOffset] = useState(0) // seconds, can be negative
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([])
  const [playbackBlocked, setPlaybackBlocked] = useState(false)
  let currentFrame = 0 // Declare currentFrame variable
  const frameDuration = 1 / Number.parseInt(framerate) // Declare frameDuration variable

  const renderElement = (
    ctx: CanvasRenderingContext2D,
    element: Element,
    canvasWidth: number,
    canvasHeight: number,
  ) => {
    ctx.save()

    // Scale element position and size to canvas dimensions
    const x = (element.x / 1920) * canvasWidth
    const y = (element.y / 1080) * canvasHeight
    const width = (element.width / 1920) * canvasWidth
    const height = (element.height / 1080) * canvasHeight

    if (element.type === "overlay") {
      // Render overlay covering entire canvas
      ctx.globalAlpha = element.opacity / 100
      ctx.fillStyle = element.color
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    } else if (element.type === "shape") {
      // Render shape at specific position
      ctx.translate(x, y)
      ctx.rotate((element.rotation * Math.PI) / 180)
      ctx.globalAlpha = element.opacity / 100
      ctx.fillStyle = element.color

      // Draw different shapes
      switch (element.name) {
        case "Rectangle":
          ctx.fillRect(-width / 2, -height / 2, width, height)
          break
        case "Circle":
          ctx.beginPath()
          ctx.arc(0, 0, width / 2, 0, Math.PI * 2)
          ctx.fill()
          break
        case "Triangle":
          ctx.beginPath()
          ctx.moveTo(0, -height / 2)
          ctx.lineTo(-width / 2, height / 2)
          ctx.lineTo(width / 2, height / 2)
          ctx.closePath()
          ctx.fill()
          break
        case "Star":
          ctx.beginPath()
          for (let i = 0; i < 10; i++) {
            const radius = i % 2 === 0 ? width / 2 : width / 4
            const angle = (i * Math.PI) / 5
            const starX = Math.cos(angle) * radius
            const starY = Math.sin(angle) * radius
            if (i === 0) ctx.moveTo(starX, starY)
            else ctx.lineTo(starX, starY)
          }
          ctx.closePath()
          ctx.fill()
          break
        case "Heart":
          ctx.beginPath()
          ctx.moveTo(0, height / 4)
          ctx.bezierCurveTo(-width / 2, -height / 4, -width, -height / 4, -width / 2, 0)
          ctx.bezierCurveTo(-width / 2, -height / 2, 0, -height / 2, 0, height / 4)
          ctx.bezierCurveTo(0, -height / 2, width / 2, -height / 2, width / 2, 0)
          ctx.bezierCurveTo(width, -height / 4, width / 2, -height / 4, 0, height / 4)
          ctx.fill()
          break
        case "Lightning":
          ctx.beginPath()
          ctx.moveTo(-width / 4, -height / 2)
          ctx.lineTo(width / 4, -height / 4)
          ctx.lineTo(-width / 8, 0)
          ctx.lineTo(width / 4, height / 2)
          ctx.lineTo(-width / 4, height / 4)
          ctx.lineTo(width / 8, 0)
          ctx.closePath()
          ctx.fill()
          break
      }
    }

    ctx.restore()
  }

  const handleExport = async () => {
    if (!currentClip) {
      console.error("[v0] No clip selected for export")
      return
    }

    console.log("[v0] Starting video export...")
    setIsExporting(true)
    setExportProgress(0)

    const newJob: ExportJob = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${fileName}.${format}`,
      status: "processing",
      progress: 0,
      quality,
      format,
      createdAt: new Date(),
    }

    setExportJobs((prev) => [newJob, ...prev])

    try {
      // Create canvas for rendering
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!

      // Set canvas dimensions based on quality
      const dimensions = getQualitySettings(quality)
      const [width, height] = dimensions.resolution.split("x").map(Number)
      canvas.width = width
      canvas.height = height

      // Create video element for source
      const video = document.createElement("video")
      video.crossOrigin = "anonymous"
      video.muted = true

      // Load the current clip
      const videoUrl = currentClip.url || currentClip.src
      if (!videoUrl) {
        throw new Error("No video URL available")
      }

      video.src = videoUrl

      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve
        video.onerror = reject
      })

      console.log(`[v0] Video loaded, duration: ${video.duration}`)

      const videoDuration = video.duration

      let selectedMimeType: string = ""
      let fileExtension: string = ""

      // Prefer WebAudio for capturing audio (works even if <video> is muted)
      const fps = Number.parseInt(framerate)
      const canvasStream = canvas.captureStream(fps)

      // Attempt WebAudio first, and optionally mix external audio
      let audioTracks: MediaStreamTrack[] = []
      let audioContext: AudioContext | null = null
      try {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const destination = audioContext.createMediaStreamDestination()

        // Primary video audio
        const videoSource = audioContext.createMediaElementSource(video)
        const videoGain = audioContext.createGain()
        videoGain.gain.value = Math.max(0, Math.min(1, videoAudioVolume / 100))
        video.muted = false
        video.volume = 0 // avoid double playback to speakers
        videoSource.connect(videoGain).connect(destination)

        // Optional external audio
        if (includeAudio && useExternalAudio && externalAudioUrl) {
          const extAudio = new Audio()
          extAudio.crossOrigin = "anonymous"
          extAudio.src = externalAudioUrl
          extAudio.preload = "auto"
          // Offset handling: start the external element at offset when we start playing
          // We'll set currentTime after metadata
          await new Promise((resolve) => {
            extAudio.onloadedmetadata = resolve
            extAudio.onerror = resolve
          })
          try {
            const targetTime = Math.max(0, externalAudioOffset)
            if (!isNaN(targetTime)) {
              extAudio.currentTime = targetTime
            }
          } catch {}
          const extSource = audioContext.createMediaElementSource(extAudio)
          const extGain = audioContext.createGain()
          extGain.gain.value = Math.max(0, Math.min(1, externalAudioVolume / 100))
          extSource.connect(extGain).connect(destination)
          // Play external in sync once we start main playback
          setTimeout(() => {
            extAudio.play().catch(() => {})
          }, 0)
        }

        audioTracks = destination.stream.getAudioTracks()
      } catch (e) {
        audioTracks = []
      }

      // Fallback to <video>.captureStream() audio if WebAudio failed
      if (audioTracks.length === 0) {
        try {
          const elementCapture: any = (video as any).captureStream?.() || (video as any).mozCaptureStream?.()
          if (elementCapture && typeof elementCapture.getAudioTracks === "function") {
            // Ensure audio not silenced by element mute when using element capture
            video.muted = false
            video.volume = 0 // keep silent to user while preserving audio in track
            audioTracks = elementCapture.getAudioTracks()
          }
        } catch (e) {
          // leave audioTracks empty
        }
      }

      const hasAudio = includeAudio && audioTracks.length > 0

      // Decide MIME type now that we know if audio is available
      if (format === "mp4") {
        const mp4AudioOptions = [
          "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
          "video/mp4;codecs=avc1.64001E,mp4a.40.2",
          "video/mp4;codecs=h264,aac",
          "video/mp4", // may or may not include audio
        ]
        const mp4VideoOnlyOptions = [
          "video/mp4;codecs=h264",
          "video/mp4",
        ]
        const candidates = hasAudio ? mp4AudioOptions : mp4VideoOnlyOptions
        selectedMimeType = candidates.find((type) => MediaRecorder.isTypeSupported(type)) || ""
        fileExtension = "mp4"

        if (!selectedMimeType) {
          console.warn("[v0] MP4 not supported; falling back to WebM")
          // Prefer audio-capable WebM if we have audio
          const webmAudioPreferred = [
            "video/webm;codecs=vp9,opus",
            "video/webm;codecs=vp8,opus",
            "video/webm", // usually supports audio
          ]
          const webmVideoPreferred = [
            "video/webm;codecs=vp9",
            "video/webm;codecs=vp8",
            "video/webm",
          ]
          const webmCandidates = hasAudio ? webmAudioPreferred : webmVideoPreferred
          selectedMimeType = webmCandidates.find((type) => MediaRecorder.isTypeSupported(type)) || "video/webm"
          fileExtension = "webm"
        }
      } else {
        // WebM default
        const webmAudioPreferred = [
          "video/webm;codecs=vp9,opus",
          "video/webm;codecs=vp8,opus",
          "video/webm", // usually supports audio
        ]
        const webmVideoPreferred = [
          "video/webm;codecs=vp9",
          "video/webm;codecs=vp8",
          "video/webm",
        ]
        const webmCandidates = hasAudio ? webmAudioPreferred : webmVideoPreferred
        selectedMimeType = webmCandidates.find((type) => MediaRecorder.isTypeSupported(type)) || "video/webm"
        fileExtension = "webm"
      }

      console.log(`[v0] Using MIME type: ${selectedMimeType} (audio: ${hasAudio})`)

      // Merge canvas video track with audio track(s) if available
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...(includeAudio ? audioTracks : []),
      ])

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: selectedMimeType,
      })

      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: selectedMimeType })
        const actualFileName = `${fileName}.${fileExtension}`

        // Update job as completed
        setExportJobs((jobs) =>
          jobs.map((job) =>
            job.id === newJob.id
              ? {
                  ...job,
                  name: actualFileName, // Update with actual file extension
                  status: "completed" as const,
                  progress: 100,
                  size: `${(blob.size / (1024 * 1024)).toFixed(1)} MB`,
                  duration: `${Math.floor(videoDuration / 60)}:${Math.floor(videoDuration % 60)
                    .toString()
                    .padStart(2, "0")}`,
                  blob,
                }
              : job,
          ),
        )

        setIsExporting(false)
        setExportProgress(100)
        console.log(`[v0] Export completed successfully as ${fileExtension.toUpperCase()}`)
      }

      // Start recording
      if (audioContext && includeAudio) {
        await audioContext.resume()
      }
      mediaRecorder.start()
      video.currentTime = 0
      try {
        await video.play()
        setPlaybackBlocked(false)
      } catch (e) {
        console.warn("[v0] Playback was blocked by the browser. Click anywhere and try again.")
        setPlaybackBlocked(true)
        // Fallback: attempt muted play to advance frames (audio may be missing until interaction)
        try {
          video.muted = true
          await video.play()
        } catch {}
      }

      // Render frames with transforms applied based on real-time playback so audio stays in sync
      console.log(`[v0] Export settings - Duration: ${videoDuration}s, FPS: ${fps}`)

      const renderFrame = () => {
        // Clear canvas
        ctx.fillStyle = "#000000"
        ctx.fillRect(0, 0, width, height)

        if (includeElements) {
          elements
            .filter((el) => el.type === "overlay")
            .forEach((element) => {
              renderElement(ctx, element, width, height)
            })
        }

        // Apply transforms and draw video
        ctx.save()

        // Move to center for transforms
        ctx.translate(width / 2, height / 2)

        // Apply transforms
        if (transform.rotation) {
          ctx.rotate((transform.rotation * Math.PI) / 180)
        }

        const scale = transform.scale / 100
        ctx.scale(scale * (transform.flipHorizontal ? -1 : 1), scale * (transform.flipVertical ? -1 : 1))

        // Calculate video dimensions based on crop mode
        let drawWidth = width
        let drawHeight = height

        if (transform.cropMode === "fit") {
          const videoAspect = video.videoWidth / video.videoHeight
          const canvasAspect = width / height

          if (videoAspect > canvasAspect) {
            drawWidth = width
            drawHeight = width / videoAspect
          } else {
            drawHeight = height
            drawWidth = height * videoAspect
          }
        } else if (transform.cropMode === "fill") {
          const videoAspect = video.videoWidth / video.videoHeight
          const canvasAspect = width / height

          if (videoAspect > canvasAspect) {
            drawHeight = height
            drawWidth = height * videoAspect
          } else {
            drawWidth = width
            drawHeight = width / videoAspect
          }
        }

        // Draw video centered
        ctx.drawImage(
          video,
          -drawWidth / 2 + transform.position.x,
          -drawHeight / 2 + transform.position.y,
          drawWidth,
          drawHeight,
        )

        ctx.restore()

        if (includeElements) {
          elements
            .filter((el) => el.type === "shape")
            .forEach((element) => {
              renderElement(ctx, element, width, height)
            })
        }

        // Draw text layers with styling
        if (includeTextLayers) {
          textLayers.forEach((textLayer) => {
          const bold = (textLayer as any).bold ? "bold " : ""
          const italic = (textLayer as any).italic ? "italic " : ""
          const fontSize = textLayer.fontSize
          const fontFamily = textLayer.fontFamily
          ctx.font = `${italic}${bold}${fontSize}px ${fontFamily}`

          // Background box
          const bgColor = (textLayer as any).backgroundBoxColor as string | undefined
          const bgPadding = Number((textLayer as any).backgroundBoxPadding ?? 6)

          // Opacity
          const textOpacity = Number((textLayer as any).opacity ?? 100)
          const prevAlpha = ctx.globalAlpha
          ctx.globalAlpha = Math.max(0, Math.min(1, textOpacity / 100))

          // Shadow
          const shadowColor = (textLayer as any).shadowColor as string | undefined
          const shadowBlur = Number((textLayer as any).shadowBlur ?? 0)
          if (shadowColor && shadowBlur > 0) {
            ctx.shadowColor = shadowColor
            ctx.shadowBlur = shadowBlur
          } else {
            ctx.shadowColor = "transparent"
            ctx.shadowBlur = 0
          }

          const metrics = ctx.measureText(textLayer.text)
          const textWidth = metrics.width
          const textHeight = fontSize

          const drawX = textLayer.x
          const drawY = textLayer.y

          if (bgColor) {
            ctx.save()
            ctx.shadowColor = "transparent"
            ctx.fillStyle = bgColor
            ctx.fillRect(
              drawX - bgPadding,
              drawY - textHeight - bgPadding,
              textWidth + bgPadding * 2,
              textHeight + bgPadding * 2,
            )
            ctx.restore()
          }

          // Stroke
          const strokeColor = (textLayer as any).strokeColor as string | undefined
          const strokeWidth = Number((textLayer as any).strokeWidth ?? 0)
          if (strokeColor && strokeWidth > 0) {
            ctx.strokeStyle = strokeColor
            ctx.lineWidth = strokeWidth
            ctx.strokeText(textLayer.text, drawX, drawY)
          }

          // Fill
          ctx.fillStyle = textLayer.color
          ctx.fillText(textLayer.text, drawX, drawY)

          // Reset alpha
          ctx.globalAlpha = prevAlpha
        })
        }

        // Update progress using current playback time
        const progress = (video.currentTime / videoDuration) * 100
        setExportProgress(progress)
        setExportJobs((jobs) => jobs.map((job) => (job.id === newJob.id ? { ...job, progress } : job)))

        if (video.ended || video.currentTime >= videoDuration - 0.05) {
          console.log(`[v0] Rendering complete - realtime playback reached end`)
          mediaRecorder.stop()
          video.pause()
          return
        }

        requestAnimationFrame(renderFrame)
      }

      // Wait a tick, then start rendering loop
      setTimeout(() => {
        console.log(`[v0] Starting frame rendering...`)
        requestAnimationFrame(renderFrame)
      }, 100)
    } catch (error) {
      console.error("[v0] Export error:", error)
      setIsExporting(false)
      setExportJobs((jobs) => jobs.map((job) => (job.id === newJob.id ? { ...job, status: "failed" } : job)))
    }
  }

  const getQualitySettings = (quality: string) => {
    const settings = {
      "480p": { resolution: "854x480", bitrate: "1500", size: "~15 MB" },
      "720p": { resolution: "1280x720", bitrate: "3000", size: "~30 MB" },
      "1080p": { resolution: "1920x1080", bitrate: "5000", size: "~50 MB" },
      "4K": { resolution: "3840x2160", bitrate: "15000", size: "~150 MB" },
    }
    return settings[quality as keyof typeof settings] || settings["1080p"]
  }

  const currentSettings = getQualitySettings(quality)

  const getStatusIcon = (status: ExportJob["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "processing":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const removeJob = (jobId: string) => {
    setExportJobs((prev) => prev.filter((job) => job.id !== jobId))
  }

  const downloadJob = (job: ExportJob) => {
    if (job.blob) {
      const url = URL.createObjectURL(job.blob)
      const a = document.createElement("a")
      a.href = url
      a.download = job.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      console.log("[v0] Downloaded:", job.name)
    }
  }

  const getVideoDuration = () => {
    if (!currentClip) return "0:00"

    // Try to get duration from a video element if available
    const videoElements = document.querySelectorAll("video")
    for (const video of videoElements) {
      if (video.src && video.duration && !isNaN(video.duration)) {
        const duration = video.duration
        return `${Math.floor(duration / 60)}:${Math.floor(duration % 60)
          .toString()
          .padStart(2, "0")}`
      }
    }

    return "Auto"
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4" />
          Export Video
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Export & Render
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings">Export Settings</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="queue">Export Queue</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            {/* Basic Settings */}
            <Card className="p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Basic Settings
              </h4>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="filename">File Name</Label>
                  <Input
                    id="filename"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Enter filename"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quality">Quality</Label>
                    <Select value={quality} onValueChange={setQuality}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="480p">480p SD</SelectItem>
                        <SelectItem value="720p">720p HD</SelectItem>
                        <SelectItem value="1080p">1080p Full HD</SelectItem>
                        <SelectItem value="4K">4K Ultra HD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="format">Format</Label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="webm">WebM (Recommended)</SelectItem>
                        <SelectItem value="mp4">MP4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    id="include-audio"
                    type="checkbox"
                    checked={includeAudio}
                    onChange={(e) => setIncludeAudio(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="include-audio">Include Audio</Label>
                </div>
                <div className="text-xs text-muted-foreground">
                  {includeAudio ? "Audio from the clip will be embedded." : "Exporting without audio."}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    id="include-elements"
                    type="checkbox"
                    checked={includeElements}
                    onChange={(e) => setIncludeElements(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="include-elements">Include Shapes/Overlays</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="include-text"
                    type="checkbox"
                    checked={includeTextLayers}
                    onChange={(e) => setIncludeTextLayers(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="include-text">Include Text Layers</Label>
                </div>
              </div>

              {includeAudio && (
                <div className="space-y-4 mt-2">
                  <div className="flex items-center gap-2">
                    <input
                      id="use-external-audio"
                      type="checkbox"
                      checked={useExternalAudio}
                      onChange={(e) => setUseExternalAudio(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="use-external-audio">Use External Audio</Label>
                  </div>

                  {useExternalAudio && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="external-audio">Audio File</Label>
                        <input
                          id="external-audio"
                          type="file"
                          accept="audio/*"
                          className="mt-1"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              if (externalAudioUrl) URL.revokeObjectURL(externalAudioUrl)
                              const url = URL.createObjectURL(file)
                              setExternalAudioUrl(url)
                            } else {
                              if (externalAudioUrl) URL.revokeObjectURL(externalAudioUrl)
                              setExternalAudioUrl(null)
                            }
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Video Audio Volume</Label>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={videoAudioVolume}
                            onChange={(e) => setVideoAudioVolume(parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <Label>External Audio Volume</Label>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={externalAudioVolume}
                            onChange={(e) => setExternalAudioVolume(parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>External Audio Offset (sec)</Label>
                        <input
                          type="number"
                          step="0.1"
                          value={externalAudioOffset}
                          onChange={(e) => setExternalAudioOffset(Number(e.target.value))}
                          className="mt-1 w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Export Duration:</span>
                    <span className="text-muted-foreground">{getVideoDuration()} (matches uploaded video)</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Export will use the full duration of your uploaded video
                  </p>
                  {elements.length > 0 && includeElements && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Including {elements.length} element{elements.length !== 1 ? "s" : ""} (shapes and overlays)
                    </p>
                  )}
                  {!includeElements && (
                    <p className="text-xs text-muted-foreground mt-1">Shapes and overlays are disabled.</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Preview Settings */}
            <Card className="p-4">
              <h4 className="font-medium mb-3">Export Preview</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="font-medium">{currentSettings.resolution}</div>
                    <div className="text-muted-foreground">Resolution</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <div>
                    <div className="font-medium">{framerate} fps</div>
                    <div className="text-muted-foreground">Frame Rate</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <div>
                    
                    <div className="font-medium">{getVideoDuration()}</div>
                    <div className="text-muted-foreground">Duration</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="font-medium">{currentSettings.size}</div>
                    <div className="text-muted-foreground">Est. Size</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Export Progress */}
            {isExporting && (
              <Card className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Exporting Video...</span>
                    <Badge variant="outline">{exportProgress.toFixed(0)}%</Badge>
                  </div>
                  <Progress value={exportProgress} className="w-full" />
                  <div className="text-sm text-muted-foreground">
                    Rendering frames with transforms{elements.length > 0 ? ", elements," : ""} and text layers
                    applied...
                  </div>
                </div>
              </Card>
            )}

            {/* Export Button */}
            <div className="flex gap-2">
              <Button
                onClick={handleExport}
                disabled={isExporting || !fileName.trim() || !currentClip}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isExporting ? "Exporting..." : "Start Export"}
              </Button>
              {playbackBlocked && (
                <div className="text-xs text-red-500 self-center">
                  Click anywhere in the page, then try export again (audio blocked).
                </div>
              )}
            </div>

            {!currentClip && (
              <p className="text-sm text-muted-foreground text-center">Please select a video clip to export</p>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <Card className="p-4">
              <h4 className="font-medium mb-3">Advanced Settings</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Codec</Label>
                    <Select value={codec} onValueChange={setCodec}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vp9">VP9 (Recommended)</SelectItem>
                        <SelectItem value="h264">H.264</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Frame Rate</Label>
                    <Select value={framerate} onValueChange={setFramerate}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24">24 fps (Cinema)</SelectItem>
                        <SelectItem value="30">30 fps (Standard)</SelectItem>
                        <SelectItem value="60">60 fps (Smooth)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="queue" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Export Queue</h4>
              <Badge variant="outline">{exportJobs.length} jobs</Badge>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {exportJobs.map((job) => (
                <Card key={job.id} className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                      <span className="font-medium text-sm">{job.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {job.quality}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeJob(job.id)} className="h-6 w-6 p-0">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  {job.status === "processing" && (
                    <div className="mb-2">
                      <Progress value={job.progress} className="w-full h-2" />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span>{job.status}</span>
                      {job.size && <span>{job.size}</span>}
                      {job.duration && <span>{job.duration}</span>}
                    </div>
                    <span>{job.createdAt.toLocaleTimeString()}</span>
                  </div>

                  {job.status === "completed" && (
                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => downloadJob(job)}
                      >
                        <Download className="h-3 w-3 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}
                </Card>
              ))}

              {exportJobs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No export jobs yet</p>
                  <p className="text-xs">Start an export to see it here</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
