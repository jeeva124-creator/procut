# ProCut - Video Editor Application

## Overview
ProCut is a web-based video editing application built with Next.js 15 and React 18. It provides a comprehensive video editing interface with timeline management, media handling, text overlays, and multiple export options.

## Tech Stack

### Core Framework
- **Next.js 15.2.4** - React framework with App Router
- **React 18.3.1** - UI library
- **TypeScript 5.9.2** - Type safety and development experience

### UI & Styling
- **Tailwind CSS 4.1.9** - Utility-first CSS framework
- **Radix UI** - Headless UI components (accordion, dialog, dropdown, etc.)
- **Lucide React** - Icon library
- **Geist Font** - Typography (Sans & Mono)
- **next-themes** - Theme management

### Video Processing
- **Remotion** - Video rendering and composition
- **@ffmpeg/ffmpeg** - Client-side video processing
- **WebCodecs API** - Modern browser video encoding
- **Canvas API** - Custom video export functionality

### State Management & Forms
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **@hookform/resolvers** - Form validation integration

### Additional Libraries
- **date-fns** - Date manipulation
- **recharts** - Data visualization
- **sonner** - Toast notifications
- **@vercel/analytics** - Analytics tracking

## File Structure & Responsibilities

### `/app/` - Next.js App Router
- `layout.tsx` - Root layout with font configuration and analytics
- `page.tsx` - Main video editor application component
- `globals.css` - Global styles and CSS variables
- `api/export/route.ts` - Server-side export endpoint (placeholder)
- `api/render/route.ts` - Remotion-based video rendering API

### `/components/` - React Components

#### Core UI Components (`/ui/`)
- Complete set of reusable UI components built on Radix UI
- Includes: buttons, dialogs, forms, inputs, toggles, tooltips, etc.
- Located in `components/ui/` directory

#### Main Application Components
- `vertical-sidebar.tsx` - Left navigation panel
- `preview-window.tsx` - Main video preview and playback area
- `bottom-timeline.tsx` - Timeline interface for clip management
- `media-panel.tsx` - Media library and file management
- `canvas-panel.tsx` - Video transformation controls
- `text-panel.tsx` - Text overlay management
- `audio-panel.tsx` - Audio editing and mixing
- `elements-panel.tsx` - Visual elements and overlays
- `export-panel.tsx` - Export options and controls

#### Export Components
- `canvas-export.tsx` - Canvas-based video export
- `webcodecs-export.tsx` - WebCodecs API export
- `cloudinary-export.tsx` - Cloudinary integration export
- `remotion-composition.tsx` - Remotion video composition

### `/lib/` - Utilities
- `utils.ts` - Utility functions (likely includes cn for class merging)

### `/hooks/` - Custom React Hooks
- `use-mobile.ts` - Mobile device detection
- `use-toast.ts` - Toast notification management

### `/public/` - Static Assets
- Placeholder images and sample media files
- Rendered video outputs (in `/renders/` subdirectory)

## Key Features

### Video Editing
- **Timeline Management**: Multi-track timeline with drag-and-drop functionality
- **Media Library**: Support for video, audio, and image files
- **Trim Controls**: Precise video and audio trimming
- **Transform Controls**: Position, scale, rotation, opacity adjustments
- **Video Effects**: Brightness, contrast, saturation, hue adjustments
- **Playback Speed**: Variable speed control
- **Volume Control**: Audio level management

### Text & Graphics
- **Text Overlays**: Customizable text layers with positioning
- **Visual Elements**: Shapes and overlays with animation support
- **Font Management**: Multiple font family options
- **Color Customization**: Text and element color controls

### Export Options
1. **Canvas Export**: Client-side rendering using HTML5 Canvas
2. **WebCodecs Export**: Modern browser video encoding
3. **Remotion Export**: Server-side rendering with Remotion
4. **Cloudinary Export**: Cloud-based processing (placeholder)

### User Interface
- **Responsive Design**: Mobile-friendly interface
- **Dark Theme**: Professional dark UI theme
- **Panel System**: Modular sidebar panels for different editing functions
- **Real-time Preview**: Live preview of edits and transformations

## API Endpoints

### `/api/export` (POST)
- Handles server-side video export
- Currently returns error (FFmpeg not available)
- Intended for server-side video processing

### `/api/render` (POST/GET)
- **POST**: Initiates Remotion-based video rendering
- **GET**: Checks render status and provides download URL
- Supports quality presets (low, medium, high)
- Outputs MP4 files to `/public/renders/`

## Configuration Files

### `next.config.mjs`
- Webpack configuration for Remotion compatibility
- Prevents Remotion bundling during build
- Standalone output configuration

### `tsconfig.json`
- TypeScript configuration with Next.js plugin
- Path mapping for `@/*` imports
- Strict type checking enabled

### `package.json`
- Project dependencies and scripts
- Development and production build commands
- Package manager: npm/pnpm support

## Development Setup

### Prerequisites
- Node.js (version compatible with Next.js 15)
- npm or pnpm package manager

### Installation
```bash
npm install
# or
pnpm install
```

### Development
```bash
npm run dev
# or
pnpm dev
```

### Build
```bash
npm run build
# or
pnpm build
```

## Browser Compatibility
- Modern browsers with WebCodecs API support
- Canvas API support for export functionality
- File API support for media uploads
- WebRTC support for video processing

## Performance Considerations
- Client-side video processing for immediate feedback
- Lazy loading of heavy components
- Optimized bundle splitting with Next.js
- Efficient state management to prevent unnecessary re-renders
