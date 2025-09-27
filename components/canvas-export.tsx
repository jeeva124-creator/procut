"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, CheckCircle, AlertCircle } from "lucide-react";

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

interface CanvasExportProps {
  videoClip: Clip;
  audioClip: Clip;
}

export function CanvasExport({ videoClip, audioClip }: CanvasExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const exportWithCanvas = async () => {
    setIsExporting(true);
    setError('');

    try {
      // Create video element
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.muted = true; // Mute original audio
      
      // Create audio element
      const audio = document.createElement('audio');
      audio.crossOrigin = 'anonymous';

      // Load video
      const videoPromise = new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = reject;
        video.src = videoClip.url || URL.createObjectURL(videoClip.file!);
      });

      // Load audio
      const audioPromise = new Promise<void>((resolve, reject) => {
        audio.onloadedmetadata = () => resolve();
        audio.onerror = reject;
        audio.src = audioClip.url || URL.createObjectURL(audioClip.file!);
      });

      await Promise.all([videoPromise, audioPromise]);

      // Set up canvas
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Create MediaRecorder for recording
      const stream = canvas.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      const recordingPromise = new Promise<Blob>((resolve) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          resolve(blob);
        };
      });

      // Start recording
      mediaRecorder.start();

      // Play video and audio simultaneously
      video.currentTime = videoClip.trimStart || 0;
      audio.currentTime = audioClip.trimStart || 0;
      
      video.play();
      audio.play();

      // Draw video frames to canvas
      const drawFrame = () => {
        if (video.currentTime < (videoClip.trimEnd || video.duration)) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(drawFrame);
        } else {
          // Stop recording when video ends
          mediaRecorder.stop();
        }
      };

      drawFrame();

      // Wait for recording to complete
      const recordedBlob = await recordingPromise;

      // Download the result
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exported_video_${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={exportWithCanvas}
        disabled={isExporting}
        className="w-full"
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        {isExporting ? 'Exporting...' : 'Export with Canvas'}
      </Button>

      {error && (
        <div className="text-red-500 text-sm bg-red-900/20 p-2 rounded">
          {error}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
      <video ref={videoRef} className="hidden" />
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
