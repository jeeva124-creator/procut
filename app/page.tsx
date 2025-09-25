"use client";

import { useState } from "react";
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
  const [duration, setDuration] = useState(1.88);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [currentClip, setCurrentClip] = useState<Clip | null>(null);

  const [clips, setClips] = useState<Clip[]>([
    {
      id: "1",
      name: "04-1.webm",
      duration: 2,
      startTime: 0,
      type: "video",
      thumbnail: "/sample-video-clip.jpg",
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

  const handleClipSelect = (clip: Clip) => {
    console.log("[v0] Setting current clip:", clip.name);
    setCurrentClip(clip);
    setSelectedClip(clip.id);
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

  const renderSidePanel = () => {
    switch (activePanel) {
      case "media":
        return (
          <MediaPanel
            clips={clips}
            setClips={setClips}
            onClipSelect={handleClipSelect}
          />
        );

      case "canvas":
        return (
          <CanvasPanel
            selectedClip={selectedClip}
            onTransformChange={setTransform}   
          />
        );
      case "text":
        return (
          <TextPanel
            selectedClip={selectedClip}
            onTextLayerAdd={handleTextLayerAdd}
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
      <div className="w-80 bg-[#2a2a2a] border-r border-[#3a3a3a] flex flex-col">
        {renderSidePanel()}
      </div>

     
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar with Export */}
        <div className="h-12 bg-[#2a2a2a] border-b border-[#3a3a3a] flex items-center justify-end px-4">
          <ExportPanel
            clips={clips}
            currentClip={currentClip}
            transform={transform}
            textLayers={textLayers}
            elements={elements}
          />
        </div>

        {/* Preview Window */}
        <div className="flex-1 bg-[#1a1a1a] p-4">
          <PreviewWindow
            isPlaying={isPlaying}
            currentTime={currentTime}
            onTimeUpdate={setCurrentTime}
            clips={clips}
            selectedClip={selectedClip}
            currentClip={currentClip}
            transform={transform}
            textLayers={textLayers}
            elements={elements}
            onElementUpdate={handleElementUpdate}
          />
        </div>

        {/* Bottom Timeline */}
        <div className="h-48 bg-[#2a2a2a] border-t border-[#3a3a3a]">
          <BottomTimeline
            clips={clips}
            duration={duration}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onTimeChange={setCurrentTime}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            selectedClip={selectedClip}
            onClipSelect={setSelectedClip}
            setClips={setClips}
          />
        </div>
      </div>
    </div>
  );
}
