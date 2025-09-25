"use client"

import type React from "react"

import { Composition, continueRender, delayRender, Sequence, Audio, Video, Img } from "remotion"
import { useEffect, useState } from "react"

interface VideoClip {
  id: string
  src: string
  startTime: number
  duration: number
  volume: number
  effects: any[]
  type?: "video" | "audio" | "image"
}

interface TextOverlay {
  id: string
  text: string
  fontSize: number
  fontFamily: string
  color: string
  backgroundColor: string
  position: { x: number; y: number }
  rotation: number
  opacity: number
  bold: boolean
  italic: boolean
  underline: boolean
  align: "left" | "center" | "right"
  startTime: number
  duration: number
  animation: string
}

interface Transition {
  id: string
  type: "crossfade" | "slide" | "fade" | "wipe"
  duration: number
  position: number
}

interface VideoTransform {
  position: { x: number; y: number }
  scale: number
  rotation: number
  opacity: number
  flipHorizontal: boolean
  flipVertical: boolean
  cropMode: "fill" | "fit" | "crop"
}

interface VideoCompositionProps {
  clips: VideoClip[]
  textOverlays: TextOverlay[]
  transitions: Transition[]
  transforms?: VideoTransform
  width: number
  height: number
  fps: number
  durationInFrames: number
}

export function VideoComposition({
  clips,
  textOverlays,
  transitions,
  transforms,
  width,
  height,
  fps,
  durationInFrames,
}: VideoCompositionProps) {
  const [handle] = useState(() => delayRender())

  useEffect(() => {
    // Simulate loading assets
    const timer = setTimeout(() => {
      continueRender(handle)
    }, 1000)

    return () => clearTimeout(timer)
  }, [handle])

  const getVideoStyle = (clip: VideoClip): React.CSSProperties => {
    if (!transforms)
      return {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }

    const transformString = [
      `translate(${transforms.position.x}px, ${transforms.position.y}px)`,
      `scale(${transforms.scale / 100})`,
      `rotate(${transforms.rotation}deg)`,
      transforms.flipHorizontal ? "scaleX(-1)" : "",
      transforms.flipVertical ? "scaleY(-1)" : "",
    ]
      .filter(Boolean)
      .join(" ")

    let objectFit: React.CSSProperties["objectFit"] = "contain"
    switch (transforms.cropMode) {
      case "fill":
        objectFit = "fill"
        break
      case "fit":
        objectFit = "contain"
        break
      case "crop":
        objectFit = "cover"
        break
    }

    return {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      objectFit,
      transform: transformString,
      opacity: transforms.opacity / 100,
    }
  }

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: "#000",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Render timeline-aligned visual clips (video or image) */}
      {clips
        .filter((clip) => clip.type !== "audio")
        .map((clip) => {
          const from = Math.max(0, Math.round(clip.startTime * fps))
          const durationInFramesForClip = Math.max(1, Math.round(clip.duration * fps))
          const isImage = clip.type === "image"
          return (
            <Sequence key={`v-${clip.id}`} from={from} durationInFrames={durationInFramesForClip} premountFor={100}>
              {isImage ? (
                <Img src={clip.src} style={getVideoStyle(clip)} />
              ) : (
                <Video src={clip.src} style={getVideoStyle(clip)} muted />
              )}
            </Sequence>
          )
        })}

      {/* Render timeline-aligned audio for both audio-only and video clips */}
      {clips.map((clip) => {
        const from = Math.max(0, Math.round(clip.startTime * fps))
        const durationInFramesForClip = Math.max(1, Math.round(clip.duration * fps))
        const volume = typeof clip.volume === "number" ? clip.volume / 100 : 1
        return (
          <Sequence key={`a-${clip.id}`} from={from} durationInFrames={durationInFramesForClip}>
            <Audio src={clip.src} volume={volume} />
          </Sequence>
        )
      })}

      {/* Render text overlays */}
      {textOverlays.map((overlay) => (
        <div
          key={overlay.id}
          style={{
            position: "absolute",
            left: `${overlay.position.x}%`,
            top: `${overlay.position.y}%`,
            transform: `translate(-50%, -50%) rotate(${overlay.rotation}deg)`,
            fontSize: `${overlay.fontSize}px`,
            fontFamily: overlay.fontFamily,
            color: overlay.color,
            backgroundColor: overlay.backgroundColor === "transparent" ? "transparent" : overlay.backgroundColor,
            fontWeight: overlay.bold ? "bold" : "normal",
            fontStyle: overlay.italic ? "italic" : "normal",
            textDecoration: overlay.underline ? "underline" : "none",
            textAlign: overlay.align,
            opacity: overlay.opacity / 100,
            padding: overlay.backgroundColor !== "transparent" ? "8px 16px" : "0",
            borderRadius: overlay.backgroundColor !== "transparent" ? "4px" : "0",
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          {overlay.text}
        </div>
      ))}

      {/* Render transition effects */}
      {transitions.map((transition) => (
        <div
          key={transition.id}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          {/* Transition effects would be implemented here */}
          {transition.type === "crossfade" && (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(to right, transparent, rgba(0,0,0,0.5), transparent)",
                opacity: 0.3,
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// Remotion composition registration
export const RemotionVideo: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoEditor"
        // Provide a loose component to satisfy Remotion typing when no default props are given
        component={VideoComposition as unknown as React.FC}
        durationInFrames={30} // 30 seconds at 30fps
        fps={30}
        width={1020}
        height={780}

      />
    </>
  )
}
