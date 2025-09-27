"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

interface VideoTransform {
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  opacity: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  cropMode: "fill" | "fit" | "crop";
}

interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
}

interface Element {
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

interface ExportPanelProps {
  clips: Clip[];
  currentClip: Clip | null;
  transform: VideoTransform;
  textLayers: TextLayer[];
  elements: Element[];
  isPlaying: boolean;
  onPlayPause: (playing: boolean) => void;
}

type ExportStatus = 'idle' | 'exporting' | 'success' | 'error';

export function ExportPanel({
  clips,
  currentClip,
  transform,
  textLayers,
  elements,
  isPlaying,
  onPlayPause,
}: ExportPanelProps) {
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Get video and audio clips
  const videoClips = clips.filter(clip => clip.type === "video");
  const audioClips = clips.filter(clip => clip.type === "audio");

  const canExport = videoClips.length > 0 && audioClips.length > 0;

  const handleExport = async () => {
    if (!canExport) {
      setErrorMessage('Please add both a video and an audio file to export');
      setExportStatus('error');
      return;
    }

    setExportStatus('exporting');
    setErrorMessage('');

    try {
      // Get the first video and audio clip
      const videoClip = videoClips[0];
      const audioClip = audioClips[0];

      // Use client-side canvas approach
      await exportWithCanvas(videoClip, audioClip);
      
      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 3000);

    } catch (error) {
      console.error('Export error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Export failed');
      setExportStatus('error');
      
      // Reset status after 5 seconds
      setTimeout(() => {
        setExportStatus('idle');
      }, 5000);
    }
  };

  const exportWithCanvas = async (videoClip: Clip, audioClip: Clip) => {
    return new Promise<void>(async (resolve, reject) => {
      let video: HTMLVideoElement | undefined;
      let audio: HTMLAudioElement | undefined;
      
      try {
        // Create a new video element that will have the audio track
        video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.muted = true; // Mute the video element itself
        video.preload = 'metadata';
        video.style.display = 'none'; // Hide the video element
        video.style.position = 'absolute';
        video.style.left = '-9999px';
        
        // Create audio element
        audio = document.createElement('audio');
        audio.crossOrigin = 'anonymous';
        audio.preload = 'metadata';
        audio.style.display = 'none'; // Hide the audio element
        audio.style.position = 'absolute';
        audio.style.left = '-9999px';

        // Add elements to DOM (hidden) so they can load properly
        document.body.appendChild(video!);
        document.body.appendChild(audio!);

        // Set up video
        video!.src = videoClip.url || URL.createObjectURL(videoClip.file!);
        audio!.src = audioClip.url || URL.createObjectURL(audioClip.file!);

        // Wait for both to load
        await Promise.all([
          new Promise<void>((res, rej) => {
            video!.onloadedmetadata = () => res();
            video!.onerror = rej;
          }),
          new Promise<void>((res, rej) => {
            audio!.onloadedmetadata = () => res();
            audio!.onerror = rej;
          })
        ]);

        console.log('Video loaded:', video!.videoWidth, 'x', video!.videoHeight);
        console.log('Audio loaded, duration:', audio!.duration);

        // Create a canvas to capture video frames
        const canvas = document.createElement('canvas');
        canvas.width = video!.videoWidth;
        canvas.height = video!.videoHeight;
        const ctx = canvas.getContext('2d')!;

        // Create audio context to capture audio
        const audioContext = new AudioContext();
        const audioSource = audioContext.createMediaElementSource(audio!);
        const destination = audioContext.createMediaStreamDestination();
        
        // Connect audio to destination
        audioSource.connect(destination);

        // Get canvas stream and add audio
        const canvasStream = canvas.captureStream(30);
        const audioTracks = destination.stream.getAudioTracks();
        audioTracks.forEach(track => {
          canvasStream.addTrack(track);
        });

        // Create MediaRecorder
        const mediaRecorder = new MediaRecorder(canvasStream, {
          mimeType: 'video/webm;codecs=vp9,opus'
        });

        const chunks: Blob[] = [];
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          
          // Download the result
          const a = document.createElement('a');
          a.href = url;
          a.download = `exported_video_${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          // Clean up
          audioContext.close();
          
          // Remove elements from DOM
          if (video && video.parentNode) {
            video.parentNode.removeChild(video);
          }
          if (audio && audio.parentNode) {
            audio.parentNode.removeChild(audio);
          }
          
          resolve();
        };

        // Start recording
        mediaRecorder.start();

        // Set up video playback
        video!.currentTime = videoClip.trimStart || 0;
        audio!.currentTime = audioClip.trimStart || 0;

        // Start playing both
        await video!.play();
        await audio!.play();
        
        console.log('Export started - video and audio are playing in background for recording');

        // Draw frames and handle timing
        const startTime = Date.now();
        const videoDuration = (videoClip.trimEnd || video!.duration) - (videoClip.trimStart || 0);
        const endTime = startTime + (videoDuration * 1000);

        const drawFrame = () => {
          const currentTime = Date.now();
          
          if (currentTime >= endTime) {
            // Stop recording
            mediaRecorder.stop();
            video!.pause();
            audio!.pause();
            return;
          }

          // Draw video frame to canvas
          ctx.drawImage(video!, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(drawFrame);
        };

        drawFrame();

      } catch (error) {
        console.error('Export error:', error);
        
        // Clean up elements on error
        try {
          if (video && video.parentNode) {
            video.parentNode.removeChild(video);
          }
          if (audio && audio.parentNode) {
            audio.parentNode.removeChild(audio);
          }
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
        
        reject(error);
      }
    });
  };



  const getStatusIcon = () => {
    switch (exportStatus) {
      case 'exporting':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  const getButtonText = () => {
    switch (exportStatus) {
      case 'exporting':
        return 'Exporting...';
      case 'success':
        return 'Exported!';
      case 'error':
        return 'Retry Export';
      default:
        return 'Export Video';
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Status Messages */}
      {exportStatus === 'error' && errorMessage && (
        <Alert className="bg-red-900/20 border-red-500/50 text-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {exportStatus === 'success' && (
        <Alert className="bg-green-900/20 border-green-500/50 text-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Video exported successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Export Button */}
      <Button
        onClick={handleExport}
        disabled={!canExport || exportStatus === 'exporting'}
        className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
          canExport && exportStatus !== 'exporting'
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
      >
        {getStatusIcon()}
        <span className="ml-2">{getButtonText()}</span>
      </Button>

      {/* Requirements Info */}
      {!canExport && (
        <div className="text-xs text-gray-400">
          {videoClips.length === 0 && audioClips.length === 0 && 'Add video and audio files'}
          {videoClips.length === 0 && audioClips.length > 0 && 'Add a video file'}
          {videoClips.length > 0 && audioClips.length === 0 && 'Add an audio file'}
        </div>
      )}
    </div>
  );
}
