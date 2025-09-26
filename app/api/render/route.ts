// app/api/render/route.ts
import { type NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectData, quality = "medium" } = body;

    // Dynamically import Remotion only at runtime (not during build)
    const { bundle } = await import("@remotion/bundler");
    const { renderMedia, selectComposition } = await import("@remotion/renderer");

    // Unique render ID
    const renderId = Math.random().toString(36).slice(2);

    // Bundle the Remotion project
    const bundleLocation = await bundle({
      entryPoint: path.resolve("./components/remotion-composition.tsx"),
    });

    // Select the composition
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "VideoEditor", // must match your <Composition id="VideoEditor" ... />
      inputProps: projectData,
    });

    // Quality presets
    const qualitySettings = {
      low: { crf: 28 },
      medium: { crf: 23 },
      high: { crf: 18 },
    };
    const settings = qualitySettings[quality as keyof typeof qualitySettings] ?? qualitySettings.medium;

    // Output path
    const outputPath = path.resolve(`./public/renders/${renderId}.mp4`);

    // Render video
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: outputPath,
      inputProps: projectData,
      crf: settings.crf,
    });

    return NextResponse.json({
      success: true,
      renderId,
      downloadUrl: `/renders/${renderId}.mp4`,
      status: "completed",
    });
  } catch (error) {
    console.error("Render error:", error);
    return NextResponse.json({ success: false, error: "Render failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const renderId = searchParams.get("id");

  if (!renderId) {
    return NextResponse.json({ error: "Render ID required" }, { status: 400 });
  }

  const outputPath = path.resolve(`./public/renders/${renderId}.mp4`);

  try {
    const fs = await import("fs");
    if (fs.existsSync(outputPath)) {
      return NextResponse.json({
        status: "completed",
        downloadUrl: `/renders/${renderId}.mp4`,
      });
    } else {
      return NextResponse.json({ status: "processing" });
    }
  } catch (error) {
    return NextResponse.json({ status: "failed", error: "Render check failed" });
  }
}
