"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import type { VideoTransform } from "./canvas-panel"

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

interface TextLayer {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  color: string
  fontFamily: string
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

interface PreviewWindowProps {
  isPlaying: boolean
  currentTime: number
  onTimeUpdate: (time: number) => void
  clips: Clip[]
  selectedClip: string | null
  currentClip?: Clip | null
  transform?: VideoTransform
  textLayers?: TextLayer[]
  elements?: Element[]
  onElementUpdate?: (id: string, updates: Partial<Element>) => void
}

export function PreviewWindow({
  isPlaying,
  currentTime,
  onTimeUpdate,
  clips,
  selectedClip,
  currentClip,
  transform,
  textLayers = [],
  elements = [],
  onElementUpdate,
}: PreviewWindowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const animationIdRef = useRef<number | undefined>(undefined)

  const [showVideo, setShowVideo] = useState(false)

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas with black background
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const time = Date.now() * 0.001

    // Render overlays first (behind everything)
    elements
      .filter((el) => el.type === "overlay")
      .forEach((element) => {
        ctx.save()
        ctx.globalAlpha = element.opacity / 100
        ctx.fillStyle = element.color
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.restore()
      })

    ctx.save()

    // Handle crop modes for canvas
    if (transform?.cropMode === "fill") {
      ctx.scale(canvas.width / 1920, canvas.height / 1080)
    } else if (transform?.cropMode === "crop") {
      const scaleX = canvas.width / 1920
      const scaleY = canvas.height / 1080
      const scale = Math.max(scaleX, scaleY)
      ctx.scale(scale, scale)
      ctx.translate((1920 - canvas.width / scale) / -2, (1080 - canvas.height / scale) / -2)
    }

    // Create the green star-shaped 3D object from screenshot
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const rotation = time * 0.5

    ctx.save()
    if (transform) {
      ctx.translate(centerX, centerY)
      ctx.translate(transform.position.x, transform.position.y)
      ctx.scale(transform.scale / 100, transform.scale / 100)
      ctx.rotate((transform.rotation * Math.PI) / 180)
      if (transform.flipHorizontal) ctx.scale(-1, 1)
      if (transform.flipVertical) ctx.scale(1, -1)
      ctx.globalAlpha = transform.opacity / 100
    } else {
      ctx.translate(centerX, centerY)
    }

    // Draw the green metallic star shape
    const spikes = 6
    const outerRadius = 120
    const innerRadius = 60

    ctx.rotate(rotation)
    ctx.beginPath()

    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const angle = (i * Math.PI) / spikes
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()

    // Create metallic green gradient
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, outerRadius)
    gradient.addColorStop(0, "#90EE90")
    gradient.addColorStop(0.3, "#32CD32")
    gradient.addColorStop(0.7, "#228B22")
    gradient.addColorStop(1, "#006400")

    ctx.fillStyle = gradient
    ctx.fill()

    // Add metallic shine effect
    ctx.beginPath()
    for (let i = 0; i < spikes * 2; i++) {
      const radius = (i % 2 === 0 ? outerRadius : innerRadius) * 0.7
      const angle = (i * Math.PI) / spikes - 0.5
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()

    const shineGradient = ctx.createLinearGradient(-outerRadius, -outerRadius, outerRadius, outerRadius)
    shineGradient.addColorStop(0, "rgba(255, 255, 255, 0.3)")
    shineGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.1)")
    shineGradient.addColorStop(1, "rgba(255, 255, 255, 0)")

    ctx.fillStyle = shineGradient
    ctx.fill()

    ctx.restore()

    elements
      .filter((el) => el.type === "shape")
      .forEach((element) => {
        ctx.save()
        ctx.translate(element.x * (canvas.width / 1920), element.y * (canvas.height / 1080))
        ctx.rotate((element.rotation * Math.PI) / 180)
        ctx.globalAlpha = element.opacity / 100

        const width = element.width * (canvas.width / 1920)
        const height = element.height * (canvas.height / 1080)

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
              const x = Math.cos(angle) * radius
              const y = Math.sin(angle) * radius
              if (i === 0) ctx.moveTo(x, y)
              else ctx.lineTo(x, y)
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

        ctx.restore()
      })

    ctx.restore()

    // Render text layers
    textLayers.forEach((textLayer) => {
      ctx.save()
      ctx.font = `${textLayer.fontSize}px ${textLayer.fontFamily}`
      ctx.fillStyle = textLayer.color
      ctx.textAlign = "center"
      ctx.fillText(textLayer.text, textLayer.x, textLayer.y)
      ctx.restore()
    })

    if (isPlaying) {
      animationIdRef.current = requestAnimationFrame(animate)
    }
  }, [isPlaying, transform, textLayers, elements])

  useEffect(() => {
    if (isPlaying) {
      animate()
    } else if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current)
    }

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
    }
  }, [isPlaying, animate])

  useEffect(() => {
    if (currentClip && currentClip.type === "video" && currentClip.url) {
      setShowVideo(true)
      console.log("[v0] Loading video:", currentClip.name)
    } else {
      setShowVideo(false)
    }
  }, [currentClip])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !showVideo) return

    const handleTimeUpdate = () => {
      onTimeUpdate(video.currentTime)
    }

    const handleLoadedMetadata = () => {
      console.log("[v0] Video loaded, duration:", video.duration)
    }

    const handleError = (e: Event) => {
      console.error("[v0] Video error:", e)
      setShowVideo(false) // Fall back to canvas animation
    }

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("error", handleError)

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("error", handleError)
    }
  }, [showVideo, onTimeUpdate])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !showVideo) return

    if (isPlaying) {
      video.play().catch(console.error)
    } else {
      video.pause()
    }
  }, [isPlaying, showVideo])

  const getVideoStyle = () => {
    if (!transform) return {}

    const transformString = [
      `translate(${transform.position.x}px, ${transform.position.y}px)`,
      `scale(${transform.scale / 100})`,
      `rotate(${transform.rotation}deg)`,
      transform.flipHorizontal ? "scaleX(-1)" : "",
      transform.flipVertical ? "scaleY(-1)" : "",
    ]
      .filter(Boolean)
      .join(" ")

    // Handle crop modes properly
    let objectFit: "contain" | "cover" | "fill" = "contain"
    switch (transform.cropMode) {
      case "fill":
        objectFit = "fill" // Stretches to fill entire container
        break
      case "fit":
        objectFit = "contain" // Fits entire video within container
        break
      case "crop":
        objectFit = "cover" // Crops video to fill container
        break
    }

    return {
      transform: transformString,
      opacity: transform.opacity / 100,
      objectFit: objectFit,
      transition: "all 0.2s ease-out",
    }
  }

  return (
    <div className="h-full flex items-center justify-center bg-[#1a1a1a]">
      <div className="relative w-full max-w-4xl h-[340px] bg-black rounded-lg overflow-hidden">
        {showVideo && currentClip?.url ? (
          <video
            ref={videoRef}
            src={currentClip.url}
            className="w-full h-full object-contain transition-all duration-200"
            style={getVideoStyle()}
            controls={false}
            muted={false}
          />
        ) : (
          <canvas ref={canvasRef} width={1920} height={1080} className="w-full h-full object-contain" />
        )}

        {showVideo && elements.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {elements
              .filter((el) => el.type === "overlay")
              .map((element) => (
                <div
                  key={element.id}
                  className="absolute inset-0"
                  style={{
                    background: element.color,
                    opacity: element.opacity / 100,
                  }}
                />
              ))}
            {elements
              .filter((el) => el.type === "shape")
              .map((element) => (
                <div
                  key={element.id}
                  className="absolute"
                  style={{
                    left: `${(element.x / 1920) * 100}%`,
                    top: `${(element.y / 1080) * 100}%`,
                    width: `${(element.width / 1920) * 100}%`,
                    height: `${(element.height / 1080) * 100}%`,
                    backgroundColor: element.color,
                    opacity: element.opacity / 100,
                    transform: `translate(-50%, -50%) rotate(${element.rotation}deg)`,
                  }}
                />
              ))}
          </div>
        )}

        {textLayers.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {textLayers.map((textLayer) => (
              <div
                key={textLayer.id}
                className="absolute"
                style={{
                  left: `${(textLayer.x / 1920) * 100}%`,
                  top: `${(textLayer.y / 1080) * 100}%`,
                  fontSize: textLayer.fontSize,
                  color: textLayer.color,
                  fontFamily: textLayer.fontFamily,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {textLayer.text}
              </div>
            ))}
          </div>
        )}

        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded px-3 py-1">
          <span className="text-white text-sm font-medium">
            1920x1080 • {isPlaying ? "Playing" : "Paused"}
            {currentClip && ` • ${currentClip.name}`}
            {elements.length > 0 && ` • ${elements.length} elements`}
            {transform && (
              <>
                {` • ${transform.cropMode.toUpperCase()}`}
                {` • Scale: ${transform.scale}%`}
                {transform.rotation !== 0 && ` • Rotate: ${transform.rotation}°`}
                {(transform.flipHorizontal || transform.flipVertical) &&
                  ` • Flip: ${transform.flipHorizontal ? "H" : ""}${transform.flipVertical ? "V" : ""}`}
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
