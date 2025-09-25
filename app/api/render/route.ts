import { type NextRequest, NextResponse } from "next/server"
import { bundle } from "@remotion/bundler"
import { renderMedia, selectComposition } from "@remotion/renderer"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectData, quality = "medium" } = body

    // Create a unique render ID
    const renderId = Math.random().toString(36).substr(2, 9)

    // Bundle the Remotion project
    const bundleLocation = await bundle({
      entryPoint: path.resolve("./components/remotion-composition.tsx"),
      // Add webpack override if needed
    })

    // Select the composition
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "VideoEditor",
      inputProps: projectData,
    })

    // Quality settings
    const qualitySettings = {
      low: { crf: 28, scale: 0.5 },
      medium: { crf: 23, scale: 0.75 },
      high: { crf: 18, scale: 1 },
    }

    const settings = qualitySettings[quality as keyof typeof qualitySettings] || qualitySettings.medium

    // Render the video
    const outputPath = path.resolve(`./public/renders/${renderId}.mp4`)

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: outputPath,
      inputProps: projectData,
      crf: settings.crf,
      // Add additional render options
    })

    return NextResponse.json({
      success: true,
      renderId,
      downloadUrl: `/renders/${renderId}.mp4`,
      status: "completed",
    })
  } catch (error) {
    console.error("Render error:", error)
    return NextResponse.json({ success: false, error: "Render failed" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const renderId = searchParams.get("id")

  if (!renderId) {
    return NextResponse.json({ error: "Render ID required" }, { status: 400 })
  }

  // Check render status (in a real app, you'd check a database or job queue)
  const outputPath = path.resolve(`./public/renders/${renderId}.mp4`)

  try {
    // Simple file existence check (in production, use proper job tracking)
    const fs = require("fs")
    if (fs.existsSync(outputPath)) {
      return NextResponse.json({
        status: "completed",
        downloadUrl: `/renders/${renderId}.mp4`,
      })
    } else {
      return NextResponse.json({
        status: "processing",
      })
    }
  } catch (error) {
    return NextResponse.json({
      status: "failed",
      error: "Render check failed",
    })
  }
}
