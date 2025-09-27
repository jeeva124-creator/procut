"use client";

import type React from "react";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Search, Play, Pause, Clock, FileVideo, X } from "lucide-react";

interface Clip {
  id: string;
  name: string;
  duration: number;
  startTime: number;
  type: "video" | "audio" | "image";
  thumbnail?: string;
  file?: File;
  url?: string;
  trimStart: number;
  trimEnd: number;
}

interface MediaPanelProps {
  clips: Clip[]
  setClips: React.Dispatch<React.SetStateAction<Clip[]>>
  onClipSelect?: (clip: Clip) => void
  onClipRemove?: (id: string) => void
  onClipAdd?: (clip: Clip) => void
  onPlayPause?: () => void
  isPlaying?: boolean
}


export function MediaPanel({
  clips,
  setClips,
  onClipSelect,
  onClipRemove,
  onClipAdd,
  onPlayPause,
  isPlaying,
}: MediaPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log("MediaPanel rendered with:", {
    clipsCount: clips.length,
    hasOnClipRemove: !!onClipRemove,
    clips: clips.map((c) => ({ id: c.id, name: c.name })),
  });

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;

      const newClips: Clip[] = [];

      Array.from(files).forEach((file, index) => {
        const url = URL.createObjectURL(file);
        const newClip: Clip = {
          id: `clip-${Date.now()}-${index}`,
          name: file.name,
          duration: 10, // Temporary duration, will be updated when media loads
          startTime: 0,
          type: file.type.startsWith("video/")
            ? "video"
            : file.type.startsWith("audio/")
            ? "audio"
            : "image",
          thumbnail: file.type.startsWith("video/") ? url : undefined,
          file,
          url,
          // Initialize trim to full video duration (no trimming initially)
          trimStart: 0,
          trimEnd: 10, // Temporary, will be updated to actual duration when metadata loads
        };

        // For video files, get the actual duration
        if (file.type.startsWith("video/")) {
          const video = document.createElement("video");
          video.onloadedmetadata = () => {
            const actualDuration = video.duration;
            newClip.duration = actualDuration;
            newClip.trimEnd = actualDuration;

            // Update the clip in state if it's already been added
            setClips((prevClips: Clip[]) =>
              prevClips.map((clip) =>
                clip.id === newClip.id
                  ? {
                      ...clip,
                      duration: actualDuration,
                      trimEnd: actualDuration,
                    }
                  : clip
              )
            );
          };
          video.src = url;
        }

        newClips.push(newClip);
      });

      if (onClipAdd) {
        newClips.forEach((clip) => onClipAdd(clip));
      } else {
        setClips([...clips, ...newClips]);
      }

      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [setClips]
  );

  const handleClipClick = useCallback(
    (clip: Clip) => {
      console.log("[v0] Clip selected:", clip.name);
      if (onClipSelect) {
        onClipSelect(clip);
      }
    },
    [onClipSelect]
  );

  const filteredClips = clips.filter((clip) =>
    clip.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a]">
      {/* Header */}
      <div className="p-4 border-b border-[#3a3a3a] bg-[#2a2a2a]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
            <FileVideo className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Media Library</h2>
            <p className="text-xs text-gray-400">
              Upload and manage your media files
            </p>
          </div>
        </div>

        {/* Upload Button */}
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white mb-4 shadow-lg hover:shadow-xl"
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
            className="pl-10 bg-[#0f0f0f] border-[#3a3a3a] text-white placeholder-gray-400 rounded-lg focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Media List */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {/* Media Stats Header */}
          {filteredClips.length > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-gray-600 rounded-md flex items-center justify-center">
                <FileVideo className="h-3 w-3 text-white" />
              </div>
              <h3 className="text-sm font-bold text-white">Your Media</h3>
              <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                {filteredClips.length}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredClips.length === 0 && !searchTerm && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#2a2a2a] rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileVideo className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-300 mb-2">
                No media files yet
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Upload videos, images, or audio to get started
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg hover:shadow-xl"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload First Media
              </Button>
            </div>
          )}

          {/* No Search Results */}
          {filteredClips.length === 0 && searchTerm && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-[#2a2a2a] rounded-lg flex items-center justify-center mx-auto mb-3">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-400 font-medium">
                No media found
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Try adjusting your search terms
              </p>
            </div>
          )}

          <div className="space-y-3">
            {filteredClips.map((clip, index) => (
              <div
                key={`${clip.id}-${index}-${clip.name}`}
                className="relative"
              >
                <div
                  className="group bg-[#0f0f0f] rounded-lg p-4 hover:bg-[#2a2a2a] cursor-pointer border border-[#3a3a3a] hover:border-[#4a4a4a] transition-colors"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(
                      "application/json",
                      JSON.stringify(clip)
                    );
                  }}
                  onClick={() => handleClipClick(clip)}
                >
                  {/* Thumbnail */}
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-14 bg-[#2a2a2a] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {clip.thumbnail ? (
                        <img
                          src={clip.thumbnail || "/placeholder.svg"}
                          alt={clip.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <FileVideo className="h-7 w-7 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pr-20">
                      <p
                        className="text-sm font-medium text-white mb-2 break-words overflow-hidden"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          wordBreak: "break-word",
                        }}
                      >
                        {clip.name}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span>
                            {Math.floor(clip.duration / 60)}:
                            {(clip.duration % 60).toFixed(0).padStart(2, "0")}
                          </span>
                        </div>
                        <span className="text-xs bg-[#2a2a2a] px-2 py-1 rounded text-gray-300 capitalize flex-shrink-0">
                          {clip.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - OUTSIDE the clip container */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
                  {/* Remove Button - Always visible */}
                  {onClipRemove && (
                    <button
                      className="w-8 h-8 bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 text-white rounded-md flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClipRemove(clip.id);
                      }}
                      title="Remove clip"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}

                  {/* Play Button */}
                  <button
                    className="w-8 h-8 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-md flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
                    onClick={(e) => {
                      e.stopPropagation();
                      // First select the clip
                      handleClipClick(clip);
                      // Then start/pause playback
                      if (onPlayPause) {
                        onPlayPause();
                      }
                    }}
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
