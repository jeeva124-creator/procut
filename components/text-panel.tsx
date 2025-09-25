"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Type, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, X } from "lucide-react";

interface TextPanelProps {
  selectedClip: string | null;
  onTextLayerAdd?: (textLayer: TextLayer) => void;
  onTextLayerRemove?: (id: string) => void;   // ✅ added
  textLayers?: TextLayer[];
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

export function TextPanel({ selectedClip, onTextLayerAdd, onTextLayerRemove, textLayers = [] }: TextPanelProps) {
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState([32]);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textColor, setTextColor] = useState("#f51515ff");
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [alignment, setAlignment] = useState("center");

  const fontOptions = [
    "Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana",
    "Courier New", "Impact", "Comic Sans MS", "Trebuchet MS",
  ];

  const addTextLayer = () => {
    if (!text.trim()) return;
    const newTextLayer: TextLayer = {
      id: `text-${Date.now()}`,
      text,
      x: 300, // default X position
      y: 200, // default Y position
      fontSize: fontSize[0],
      color: textColor,
      fontFamily,
    };
    onTextLayerAdd?.(newTextLayer);
    setText("");
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-[#3a3a3a]">
        <h2 className="text-lg font-semibold text-white mb-3">Text</h2>
        <Button onClick={addTextLayer} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          <Type className="h-4 w-4 mr-2" />
          Add Text Layer
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {textLayers.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-gray-400">Text Layers</Label>
              <div className="space-y-2">
                {textLayers.map((layer) => (
                  <div
                    key={layer.id}
                    className="relative p-2 bg-[#1a1a1a] border border-[#3a3a3a] rounded"
                  >
                    {/* ✅ Close button */}
                    <button
                      onClick={() => onTextLayerRemove?.(layer.id)}
                      className="absolute top-1 right-1 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <div className="text-white text-sm truncate">{layer.text}</div>
                    <div className="text-gray-400 text-xs">
                      {layer.fontSize}px • {layer.fontFamily}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Text Input */}
          <div className="space-y-2">
            <Label className="text-xs text-gray-400">Text Content</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your text here..."
              className="min-h-[80px] bg-[#1a1a1a] border-[#3a3a3a] text-white placeholder-gray-500"
            />
          </div>

          {/* Font Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white">Font</h3>

            <div className="space-y-2">
              <Label className="text-xs text-gray-400">Font Family</Label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger className="bg-[#1a1a1a] border-[#3a3a3a] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-400">Font Size ({fontSize[0]}px)</Label>
              <Slider value={fontSize} onValueChange={setFontSize} min={12} max={120} step={1} className="w-full" />
            </div>

            {/* Alignment Buttons */}
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => setAlignment("left")}>
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setAlignment("center")}>
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setAlignment("right")}>
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator className="bg-[#3a3a3a]" />

          {/* Color Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white">Colors</h3>
            <div className="space-y-2">
              <Label className="text-xs text-gray-400">Text Color</Label>
              <Input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-400">Background Color</Label>
              <Input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
