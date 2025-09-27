"use client"

import type { PanelType } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, FolderOpen, Layers, Type, Volume2, Video, ImageIcon, Shapes, Circle, Mic } from "lucide-react"

interface VerticalSidebarProps {
  activePanel: PanelType
  setActivePanel: (panel: PanelType) => void
}

export function VerticalSidebar({ activePanel, setActivePanel }: VerticalSidebarProps) {
  const tools = [
    { id: "media" as PanelType, icon: FolderOpen, label: "Media", color: "text-white" },
    { id: "canvas" as PanelType, icon: Layers, label: "Studio", color: "text-white" },
    { id: "text" as PanelType, icon: Type, label: "Text", color: "text-white" },
    { id: "audio" as PanelType, icon: Volume2, label: "Audio", color: "text-white" },
    // { id: "videos" as PanelType, icon: Video, label: "Videos", color: "text-white" },
    // { id: "images" as PanelType, icon: ImageIcon, label: "Images", color: "text-white" },
    { id: "elements" as PanelType, icon: Shapes, label: "Elements", color: "text-white" },
  ]

  return (
    <div className="w-16 bg-[#1a1a1a] border-r border-[#3a3a3a] flex flex-col items-center py-4 gap-2">
     
    

      <div className="w-8 h-px bg-[#3a3a3a] my-2" />

      {/* Tool Icons */}
      {tools.map((tool) => (
        <TooltipProvider key={tool.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`w-12 h-12 rounded-md ${
                  activePanel === tool.id
                    ? "bg-[#3a3a3a] text-white"
                    : "hover:bg-[#2a2a2a] text-gray-400 hover:text-white"
                }`}
                onClick={() => setActivePanel(tool.id)}
              >
                <tool.icon className={`h-5 w-5 ${tool.color}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{tool.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  )
}
