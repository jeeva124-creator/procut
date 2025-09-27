"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, AlertCircle } from "lucide-react";

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

interface WebCodecsExportProps {
  videoClip: Clip;
  audioClip: Clip;
}

export function WebCodecsExport({ videoClip, audioClip }: WebCodecsExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string>('');
  const [isSupported, setIsSupported] = useState(false);

  // Check WebCodecs support
  useState(() => {
    setIsSupported('VideoEncoder' in window && 'AudioEncoder' in window);
  });

  const exportWithWebCodecs = async () => {
    if (!isSupported) {
      setError('WebCodecs API not supported in this browser');
      return;
    }

    setIsExporting(true);
    setError('');

    try {
      // This is a simplified example - WebCodecs API is complex
      // and requires more implementation for full video/audio merging
      
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = videoClip.url || URL.createObjectURL(videoClip.file!);
      
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = reject;
      });

      // Create a canvas to capture video frames
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d')!;

      // Use MediaRecorder as a simpler approach
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      const recordingPromise = new Promise<Blob>((resolve) => {
        mediaRecorder.onstop = () => {
          resolve(new Blob(chunks, { type: 'video/webm' }));
        };
      });

      mediaRecorder.start();
      
      // Play video and draw frames
      video.play();
      const drawFrame = () => {
        if (!video.paused && !video.ended) {
          ctx.drawImage(video, 0, 0);
          requestAnimationFrame(drawFrame);
        } else {
          mediaRecorder.stop();
        }
      };
      drawFrame();

      const blob = await recordingPromise;
      
      // Download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exported_video_${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="text-yellow-500 text-sm bg-yellow-900/20 p-2 rounded">
        WebCodecs API not supported in this browser
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={exportWithWebCodecs}
        disabled={isExporting}
        className="w-full"
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        {isExporting ? 'Exporting...' : 'Export with WebCodecs'}
      </Button>

      {error && (
        <div className="text-red-500 text-sm bg-red-900/20 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
