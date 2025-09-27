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

interface CloudinaryExportProps {
  videoClip: Clip;
  audioClip: Clip;
}

export function CloudinaryExport({ videoClip, audioClip }: CloudinaryExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string>('');

  const exportWithCloudinary = async () => {
    setIsExporting(true);
    setError('');

    try {
      // Upload video to Cloudinary
      const videoFormData = new FormData();
      videoFormData.append('file', videoClip.file!);
      videoFormData.append('upload_preset', 'your_upload_preset');
      videoFormData.append('resource_type', 'video');

      const videoResponse = await fetch('https://api.cloudinary.com/v1_1/your_cloud_name/video/upload', {
        method: 'POST',
        body: videoFormData
      });

      const videoData = await videoResponse.json();

      // Upload audio to Cloudinary
      const audioFormData = new FormData();
      audioFormData.append('file', audioClip.file!);
      audioFormData.append('upload_preset', 'your_upload_preset');
      audioFormData.append('resource_type', 'video');

      const audioResponse = await fetch('https://api.cloudinary.com/v1_1/your_cloud_name/video/upload', {
        method: 'POST',
        body: audioFormData
      });

      const audioData = await audioResponse.json();

      // Create transformation URL for video with new audio
      const transformationUrl = `https://res.cloudinary.com/your_cloud_name/video/upload/fl_replace_audio:${audioData.public_id}/${videoData.public_id}.mp4`;

      // Download the result
      const response = await fetch(transformationUrl);
      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exported_video_${Date.now()}.mp4`;
      a.click();
      URL.revokeObjectURL(url);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-400">
        Requires Cloudinary account setup
      </div>
      
      <Button
        onClick={exportWithCloudinary}
        disabled={isExporting}
        className="w-full"
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        {isExporting ? 'Exporting...' : 'Export with Cloudinary'}
      </Button>

      {error && (
        <div className="text-red-500 text-sm bg-red-900/20 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
