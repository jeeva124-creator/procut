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
  Volume2,
  VolumeX,
  AudioWaveform as Waveform,
  Music,
  Mic,
} from "lucide-react"

interface AudioPanelProps {
  selectedClip: string | null
}

interface AudioTrack {
  id: string
  name: string
  duration: number
  type: "music" | "voice" | "sfx"
  url: string
}

export function AudioPanel({ selectedClip }: AudioPanelProps) {
  const [volume, setVolume] = useState([80])
  const [isMuted, setIsMuted] = useState(false)
  const [fadeIn, setFadeIn] = useState([0])
  const [fadeOut, setFadeOut] = useState([0])
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const uploadedTracks: AudioTrack[] = []
    Array.from(files).forEach((file, index) => {
      const url = URL.createObjectURL(file)

      // Get duration using <audio>
      const audio = document.createElement("audio")
      audio.src = url
      audio.addEventListener("loadedmetadata", () => {
        const duration = Math.floor(audio.duration)
        const type: AudioTrack["type"] =
          file.name.toLowerCase().includes("voice") ? "voice" :
          file.name.toLowerCase().includes("sfx") ? "sfx" : "music"

        setAudioTracks((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${index}`,
            name: file.name,
            duration,
            type,
            url,
          },
        ])
      })
    })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-[#3a3a3a]">
        <h2 className="text-lg font-semibold text-white mb-3">Audio Library</h2>
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Audio
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Audio Controls */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white">Audio Controls</h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-gray-400">Volume</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={1}
                className="w-full"
                disabled={isMuted}
              />
              <div className="text-xs text-gray-500 text-right">{volume[0]}%</div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-400">Fade In ({fadeIn[0]}s)</Label>
              <Slider value={fadeIn} onValueChange={setFadeIn} max={10} step={0.1} className="w-full" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-400">Fade Out ({fadeOut[0]}s)</Label>
              <Slider value={fadeOut} onValueChange={setFadeOut} max={10} step={0.1} className="w-full" />
            </div>
          </div>

          <Separator className="bg-[#3a3a3a]" />

          {/* Audio Library */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white">Audio Library</h3>
            <div className="space-y-2">
              {audioTracks.length === 0 && (
                <p className="text-xs text-gray-500">No audio uploaded yet</p>
              )}
             {audioTracks.map((track) => (
  <div
    key={track.id}
    className="bg-[#1a1a1a] rounded-lg p-3 border border-[#3a3a3a] 
               hover:border-[#4a4a4a] cursor-pointer 
               flex items-center gap-3 h-14"   // 👈 fixed height
    draggable
  >
    <div className="w-8 h-8 bg-[#2a2a2a] rounded flex items-center justify-center flex-shrink-0">
      {track.type === "music" && <Music className="h-4 w-4 text-blue-400" />}
      {track.type === "voice" && <Mic className="h-4 w-4 text-green-400" />}
      {track.type === "sfx" && <Waveform className="h-4 w-4 text-purple-400" />}
    </div>

    {/* File Info */}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-white truncate max-w-[180px]">
        {track.name}
      </p>
      <p className="text-xs text-gray-400">
        {Math.floor(track.duration / 60)}:
        {(track.duration % 60).toString().padStart(2, "0")}
      </p>
    </div>
<Button
  variant="ghost"
  size="sm"
  className="h-8 w-8 p-0 text-gray-400 hover:text-white flex-shrink-0"
  onClick={(e) => {
    e.stopPropagation(); // prevent parent click
    const existing = document.getElementById(track.id) as HTMLAudioElement | null;

    if (existing) {
      if (!existing.paused) {
        existing.pause();
        existing.currentTime = 0; // reset to start
        existing.remove(); // cleanup
      } else {
        existing.play();
      }
    } 
    else {
      const audio = new Audio(track.url);
      audio.id = track.id; // unique per track
      audio.volume = isMuted ? 0 : volume[0] / 100;

      // auto cleanup when finished
      audio.addEventListener("ended", () => {
        audio.remove();
      });

      audio.play();
      document.body.appendChild(audio); // keep reference in DOM
    }
  }}
>
  <Play className="h-4 w-4" />
</Button>

  </div>
))}
         </div>
          </div>

          <Separator className="bg-[#3a3a3a]" />

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white">Effects</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="bg-[#1a1a1a] border-[#3a3a3a] text-white hover:bg-[#2a2a2a]">
                Normalize
              </Button>
              <Button variant="outline" size="sm" className="bg-[#1a1a1a] border-[#3a3a3a] text-white hover:bg-[#2a2a2a]">
                Compressor
              </Button>
              <Button variant="outline" size="sm" className="bg-[#1a1a1a] border-[#3a3a3a] text-white hover:bg-[#2a2a2a]">
                EQ
              </Button>
              <Button variant="outline" size="sm" className="bg-[#1a1a1a] border-[#3a3a3a] text-white hover:bg-[#2a2a2a]">
                Reverb
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
