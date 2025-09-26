"use client";

import { useState, useEffect } from "react";
import { VerticalSidebar } from "@/components/vertical-sidebar";
import { MediaPanel } from "@/components/media-panel";
import { PreviewWindow } from "@/components/preview-window";
import { BottomTimeline } from "@/components/bottom-timeline";
import { CanvasPanel } from "@/components/canvas-panel";
import { TextPanel } from "@/components/text-panel";
import { AudioPanel } from "@/components/audio-panel";
import { VideosPanel } from "@/components/videos-panel";
// import { ImagesPanel } from "@/components/images-panel";
import { ElementsPanel } from "@/components/elements-panel";
import { ExportPanel } from "@/components/export-panel"; 

export interface Clip {
  id: string;
  name: string;
  duration: number;
  startTime: number;
  type: "video" | "audio" | "image";
  thumbnail?: string;
  file?: File;
  url?: string;
  // Trim properties - these define the playable portion of the clip
  trimStart: number; // Start time within the original video (in seconds)
  trimEnd: number;   // End time within the original video (in seconds)
}

export interface VideoTransform {
  position: { x: number; y: number }
  scale: number
  rotation: number
  opacity: number
  flipHorizontal: boolean
  flipVertical: boolean
  cropMode: "fill" | "fit" | "crop"   
}


export interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
}

export interface Element {
  id: string;
  type: "shape" | "overlay";
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
  rotation: number;
  animation?: string;
}

export type PanelType =
  | "media"
  | "canvas"
  | "text"
  | "audio"
  | "elements";

export default function VideoEditor() {
  const [activePanel, setActivePanel] = useState<PanelType>("media");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(10); // Default to 10 seconds, will be updated by video
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [currentClip, setCurrentClip] = useState<Clip | null>(null);
  const [usingTrimmedDuration, setUsingTrimmedDuration] = useState(false);
  const [volume, setVolume] = useState(80); // Default volume at 80%

  // Listen for video trim end events
  useEffect(() => {
    const handleVideoTrimEnd = () => {
      console.log("[v0] Video trim end event received, stopping playback")
      setIsPlaying(false)
    }

    window.addEventListener('videoTrimEnd', handleVideoTrimEnd)
    return () => {
      window.removeEventListener('videoTrimEnd', handleVideoTrimEnd)
    }
  }, [])

  const [clips, setClips] = useState<Clip[]>([
    {
      id: "1",
      name: "04-1.webm",
      duration: 2,
      startTime: 0,
      type: "video",
      thumbnail: "/sample-video-clip.jpg",
      trimStart: 0,
      trimEnd: 2,
    },
  ]);

  const [transform, setTransform] = useState<VideoTransform>({
    position: { x: 0, y: 0 },
    scale: 100,
    rotation: 0,
    opacity: 100,
    flipHorizontal: false,
    flipVertical: false,
    cropMode: "fit",
  });

  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [elements, setElements] = useState<Element[]>([]);
  const [videoAdjustments, setVideoAdjustments] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
  });
  const [playbackSpeed, setPlaybackSpeed] = useState(100);
  const [timeSettings, setTimeSettings] = useState({
    startTime: 0,
    endTime: 100,
    fadeIn: 0,
    fadeOut: 0,
  });

  const handleClipSelect = (clip: Clip) => {
    console.log("[v0] Setting current clip:", clip.name, "Trim:", clip.trimStart, "-", clip.trimEnd);
    setCurrentClip(clip);
    setSelectedClip(clip.id);
    setCurrentTime(0); // Reset time when switching clips
    
    // Set duration to the trimmed duration for timeline display
    if (clip.trimEnd > clip.trimStart) {
      const trimmedDuration = clip.trimEnd - clip.trimStart;
      setDuration(trimmedDuration);
      setUsingTrimmedDuration(true);
      console.log("[v0] Setting duration to trimmed length:", trimmedDuration);
    } else {
      // Fallback to full duration if trim values aren't set
      setDuration(clip.duration);
      setUsingTrimmedDuration(false);
      console.log("[v0] Using full clip duration:", clip.duration);
    }
  };

  const handleTextLayerAdd = (textLayer: TextLayer) => {
    setTextLayers((prev) => [...prev, textLayer]);
  };

  const handleElementAdd = (element: Element) => {
    setElements((prev) => [...prev, element]);
  };

  const handleElementUpdate = (id: string, updates: Partial<Element>) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const handleElementDelete = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
  };

  const handleTextLayerRemove = (id: string) => {
    setTextLayers((prev) => prev.filter((layer) => layer.id !== id));
  };

  const handleClipRemove = (id: string) => {
    setClips((prev) => {
      const updatedClips = prev.filter((clip) => clip.id !== id);
      // If the removed clip was selected, clear the selection
      if (selectedClip === id) {
        setSelectedClip(null);
        setCurrentClip(null);
      }
      return updatedClips;
    });
  };

  const handleAdjustmentsChange = (adjustments: any) => {
    setVideoAdjustments(adjustments);
    console.log("[v0] Video adjustments updated in main app:", adjustments);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    console.log("[v0] Playback speed updated in main app:", speed);
  };

  const handleTimeSettingsChange = (settings: any) => {
    setTimeSettings(settings);
    console.log("[v0] Time settings updated in main app:", settings);
  };

  const renderSidePanel = () => {
    switch (activePanel) {
      case "media":
        return (
          <MediaPanel
            clips={clips}
            setClips={setClips}
            onClipSelect={handleClipSelect}
            onClipRemove={handleClipRemove}
            onPlayPause={() => {
              console.log("[v0] Media panel play/pause clicked, current state:", isPlaying)
              setIsPlaying(!isPlaying)
            }}
            isPlaying={isPlaying}
          />
        );

      case "canvas":
        return (
          <CanvasPanel
            selectedClip={selectedClip}
            onTransformChange={setTransform}
            onAdjustmentsChange={handleAdjustmentsChange}
            onSpeedChange={handleSpeedChange}
            onTimeSettingsChange={handleTimeSettingsChange}
          />
        );
      case "text":
        return (
          <TextPanel
            selectedClip={selectedClip}
            onTextLayerAdd={handleTextLayerAdd}
            onTextLayerRemove={handleTextLayerRemove}
            textLayers={textLayers}
          />
        );
      case "audio":
        return <AudioPanel selectedClip={selectedClip} />;
      // case "images":
      //   return <ImagesPanel clips={clips} setClips={setClips} />;
      case "elements":
        return (
          <ElementsPanel
            selectedClip={selectedClip}
            onElementAdd={handleElementAdd}
            elements={elements}
            onElementUpdate={handleElementUpdate}
            onElementDelete={handleElementDelete}
          />
        );
      default:
        return (
          <MediaPanel
            clips={clips}
            setClips={setClips}
            onClipSelect={handleClipSelect}
            onClipRemove={handleClipRemove}
            onPlayPause={() => {
              console.log("[v0] Media panel play/pause clicked, current state:", isPlaying)
              setIsPlaying(!isPlaying)
            }}
            isPlaying={isPlaying}
          />
        );
    }
  };

  return (
    <div className="h-screen bg-[#1a1a1a] text-white flex overflow-hidden">
      {/* Vertical Sidebar */}
      <VerticalSidebar
        activePanel={activePanel}
        setActivePanel={setActivePanel}
      />

      {/* Left Panel */}
      <div className="w-[440px] bg-[#2a2a2a] border-r border-[#3a3a3a] flex flex-col">
        {renderSidePanel()}
      </div>

     
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top Bar with Export */}
        <div className="h-12 bg-[#2a2a2a] border-b border-[#3a3a3a] flex items-center justify-end px-4 flex-shrink-0">
          <ExportPanel
            clips={clips}
            currentClip={currentClip}
            transform={transform}
            textLayers={textLayers}
            elements={elements}
          />
        </div>

        {/* Preview Window */}
        <div className="flex-1 bg-[#1a1a1a] p-4 min-h-0 overflow-hidden">
          <PreviewWindow
            isPlaying={isPlaying}
            currentTime={currentTime}
            onTimeUpdate={setCurrentTime}
            onDurationUpdate={(newDuration) => {
              // Only update duration if we're not using a trimmed duration
              if (!usingTrimmedDuration) {
                console.log("[v0] Updating duration from video metadata:", newDuration);
                setDuration(newDuration);
              } else {
                console.log("[v0] Ignoring duration update - using trimmed duration");
              }
            }}
            clips={clips}
            selectedClip={selectedClip}
            currentClip={currentClip}
            transform={transform}
            textLayers={textLayers}
            elements={elements}
            onElementUpdate={handleElementUpdate}
            videoAdjustments={videoAdjustments}
            playbackSpeed={playbackSpeed}
            volume={volume}
          />
        </div>

        {/* Bottom Timeline */}
        <div className="h-72 bg-[#2a2a2a] border-t border-[#3a3a3a] flex-shrink-0 overflow-hidden">
          <BottomTimeline
            clips={clips}
            duration={duration}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onTimeChange={setCurrentTime}
            onPlayPause={() => {
              console.log("[v0] Play/Pause button clicked, current state:", isPlaying)
              setIsPlaying(!isPlaying)
            }}
            selectedClip={selectedClip}
            onClipSelect={(clipId) => {
              setSelectedClip(clipId);
              const clip = clips.find((c) => c.id === clipId) || null;
              setCurrentClip(clip);
              if (clip) {
                const trimmedDuration = clip.trimEnd - clip.trimStart;
                setDuration(trimmedDuration);
                setUsingTrimmedDuration(true);
                console.log("[v0] Clip selected from timeline:", clip.name, "Trimmed duration:", trimmedDuration);
              }
            }}
            setClips={setClips}
            onTrimChange={(clipId, trimStart, trimEnd) => {
              if (clipId === selectedClip) {
                const trimmedDuration = trimEnd - trimStart;
                setDuration(trimmedDuration);
                setUsingTrimmedDuration(true);
                console.log("[v0] Updated duration due to trim change:", trimmedDuration)
              }
            }}
            onVolumeChange={(newVolume) => {
              setVolume(newVolume)
              console.log("[v0] Volume changed to:", newVolume)
            }}
          />
        </div>
      </div>
    </div>
  );
}
