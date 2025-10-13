"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import {
  Upload,
  Play,
  Pause,
  Volume2,
  VolumeX,
  AudioWaveform as Waveform,
  Music,
  Mic,
  X,
} from "lucide-react"

// Props for AudioPanel component
interface AudioPanelProps {
  selectedClip: string | null
  clips: any[]
  setClips: React.Dispatch<React.SetStateAction<any[]>>
}

// Audio track interface (music, voice, sfx)
interface AudioTrack {
  id: string
  name: string
  duration: number
  type: "music" | "voice" | "sfx"
  url: string
}

export function AudioPanel({ selectedClip, clips, setClips }: AudioPanelProps) {
  // UI states
  const [volume, setVolume] = useState([80])              // Volume level (0-100)
  const [isMuted, setIsMuted] = useState(false)           // Mute/unmute state
  const [fadeIn, setFadeIn] = useState([0])               // Fade in duration (seconds)
  const [fadeOut, setFadeOut] = useState([0])             // Fade out duration (seconds)
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null) // Currently playing track id
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null) // Audio element reference
  const fileInputRef = useRef<HTMLInputElement>(null)     // File input reference (hidden input)

  // Filter audio clips from main clips array
  const audioTracks = clips.filter(clip => clip.type === "audio")

  // Handle audio file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return;

    Array.from(files).forEach((file, index) => {
      const url = URL.createObjectURL(file) // Create temporary URL for audio

      // Create <audio> element to read duration
      const audio = document.createElement("audio")
      audio.src = url
      audio.addEventListener("loadedmetadata", () => {
        const duration = Math.floor(audio.duration)
        
        // Decide type (music, voice, sfx) based on filename
        // const type: AudioTrack["type"] =
        //   file.name.toLowerCase().includes("voice") ? "voice" :
        //   file.name.toLowerCase().includes("sfx") ? "sfx" : "music"

        // Add uploaded file into clips array
        setClips((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${index}`,
            name: file.name,
            duration,
            type: "audio", // Important: timeline identifies this as audio
            url,
            startTime: 0,
            trimStart: 0,
            trimEnd: duration
          },
        ])
      })
    })
  }

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a] min-h-0">
      {/* 🔹 Header */}
      <div className="p-4 border-b border-[#3a3a3a] bg-[#2a2a2a]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
            <Volume2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Audio Studio</h2>
            <p className="text-xs text-gray-400">Manage audio tracks and effects</p>
          </div>
        </div>
        {/* Hidden file input (triggered by Upload button) */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* 🔹 Scrollable area for audio controls & library */}
      <ScrollArea className="flex-1 p-6 min-h-0 overflow-auto">
        <div className="space-y-8">

          {/* === Audio Controls Section === */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-gray-600 rounded-md flex items-center justify-center">
                <Volume2 className="h-3 w-3 text-white" />
              </div>
              <h3 className="text-sm font-bold text-white">Audio Controls</h3>
            </div>

            {/* Volume, Mute, Fade In/Out Sliders */}
            <div className="space-y-4">
              {/* Volume */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-300">Volume</Label>
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
                      {volume[0]}%
                    </div>
                    {/* Mute/Unmute button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMuted(!isMuted)}
                      className={`h-8 w-8 p-0 rounded-md transition-colors ${isMuted ? 'text-red-400 bg-red-400/10' : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'}`}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="w-full"
                  disabled={isMuted}
                />
              </div>

              {/* Fade In */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-300">Fade In</Label>
                  <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
                    {fadeIn[0]}s
                  </div>
                </div>
                <Slider value={fadeIn} onValueChange={setFadeIn} max={10} step={0.1} className="w-full" />
              </div>

              {/* Fade Out */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-300">Fade Out</Label>
                  <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
                    {fadeOut[0]}s
                  </div>
                </div>
                <Slider value={fadeOut} onValueChange={setFadeOut} max={10} step={0.1} className="w-full" />
              </div>
            </div>
          </div>

          <Separator className="bg-[#3a3a3a]" />

          {/* === Audio Library Section === */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-gray-600 rounded-md flex items-center justify-center">
                <Music className="h-3 w-3 text-white" />
              </div>
              <h3 className="text-sm font-bold text-white">Audio Library</h3>
              {/* Count of audio tracks */}
              {audioTracks.length > 0 && (
                <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {audioTracks.length}
                </div>
              )}
            </div>

            <div className="space-y-3">
              {/* If no audio tracks uploaded yet */}
              {audioTracks.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-[#2a2a2a] rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Music className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-400 font-medium">No audio tracks yet</p>
                  <p className="text-xs text-gray-500 mt-1">Upload audio files to get started</p>
                </div>
              )}

              {/* Render audio tracks */}
              {audioTracks.map((track) => (
                <div
                  key={track.id}
                  className="bg-[#0f0f0f] rounded-lg p-4 border border-[#3a3a3a] hover:border-[#4a4a4a] cursor-pointer flex items-center gap-3 transition-colors group"
                  draggable
                  onDragStart={(e) => {
                    // Attach audio clip data for drag-drop into timeline
                    const audioClipData = {
                      id: track.id,
                      name: track.name,
                      duration: track.duration,
                      startTime: 0,
                      type: "audio",
                      url: track.url,
                      trimStart: 0,
                      trimEnd: track.duration
                    }
                    e.dataTransfer.setData("application/json", JSON.stringify(audioClipData))
                  }}
                >
                  {/* Icon based on track type */}
                  <div className="w-10 h-10 bg-[#2a2a2a] rounded-lg flex items-center justify-center flex-shrink-0">
                    {track.type === "music" && <Music className="h-5 w-5 text-white" />}
                    {track.type === "voice" && <Mic className="h-5 w-5 text-white" />}
                    {track.type === "sfx" && <Waveform className="h-5 w-5 text-white" />}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {track.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {/* Duration */}
                      <span className="text-xs text-gray-400">
                        {Math.floor(track.duration / 60)}:
                        {(track.duration % 60).toString().padStart(2, "0")}
                      </span>
                      {/* Type */}
                      <span className="text-xs bg-[#2a2a2a] px-2 py-1 rounded text-gray-300 capitalize">
                        {track.type}
                      </span>
                    </div>
                  </div>

                  {/* Play / Stop Button */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 text-gray-400 hover:text-white hover:bg-blue-600 flex-shrink-0 rounded-md transition-all group-hover:opacity-100 opacity-80"
                      onClick={(e) => {
                        e.stopPropagation(); // prevent parent click

                        if (playingAudioId === track.id) {
                          // Stop currently playing
                          if (currentAudio) {
                            currentAudio.pause()
                            currentAudio.currentTime = 0
                          }
                          setPlayingAudioId(null)
                          setCurrentAudio(null)
                        } else {
                          // Stop other audio first
                          if (currentAudio) {
                            currentAudio.pause()
                            currentAudio.currentTime = 0
                          }
                          // Play selected audio
                          const audio = new Audio(track.url)
                          audio.volume = isMuted ? 0 : volume[0] / 100

                          audio.addEventListener("ended", () => {
                            setPlayingAudioId(null)
                            setCurrentAudio(null)
                          })

                          audio.play()
                          setPlayingAudioId(track.id)
                          setCurrentAudio(audio)
                        }
                      }}
                    >
                      {playingAudioId === track.id ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </Button>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 text-gray-400 hover:text-white hover:bg-red-600 flex-shrink-0 rounded-md transition-all group-hover:opacity-100 opacity-80"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Stop if currently playing
                        if (playingAudioId === track.id) {
                          if (currentAudio) {
                            currentAudio.pause()
                            currentAudio.currentTime = 0
                          }
                          setPlayingAudioId(null)
                          setCurrentAudio(null)
                        }
                        // Remove from clips
                        setClips(prev => prev.filter(clip => clip.id !== track.id))
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-[#3a3a3a]" />

          {/* === Audio Effects Section === */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-gray-600 rounded-md flex items-center justify-center">
                <Waveform className="h-3 w-3 text-white" />
              </div>
              <h3 className="text-sm font-bold text-white">Audio Effects</h3>
            </div>
            {/* Effect Buttons (currently just UI) */}
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="sm" className="bg-[#0f0f0f] border-[#3a3a3a] text-white hover:bg-blue-600 hover:border-blue-600 transition-all h-12 font-medium">Normalize</Button>
              <Button variant="outline" size="sm" className="bg-[#0f0f0f] border-[#3a3a3a] text-white hover:bg-blue-600 hover:border-blue-600 transition-all h-12 font-medium">Compressor</Button>
              <Button variant="outline" size="sm" className="bg-[#0f0f0f] border-[#3a3a3a] text-white hover:bg-blue-600 hover:border-blue-600 transition-all h-12 font-medium">EQ</Button>
              <Button variant="outline" size="sm" className="bg-[#0f0f0f] border-[#3a3a3a] text-white hover:bg-blue-600 hover:border-blue-600 transition-all h-12 font-medium">Reverb</Button>
            </div>
          </div>
        </div>
      </ScrollArea>
      
      {/* 🔹 Upload Button (bottom) */}
      <div className="p-4 border-t border-[#3a3a3a]">
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Audio
        </Button>
      </div>
    </div>
  )
}
