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
import { Type, AlignLeft, AlignCenter, AlignRight, X } from "lucide-react";

interface TextPanelProps {
  selectedClip: string | null;
  onTextLayerAdd?: (textLayer: TextLayer) => void;
  onTextLayerRemove?: (id: string) => void;
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
  bold?: boolean;
  italic?: boolean;
  opacity?: number; // 0-100
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  backgroundBoxColor?: string;
  backgroundBoxPadding?: number;
}

export function TextPanel({ 
  selectedClip, 
  onTextLayerAdd, 
  onTextLayerRemove, 
  textLayers = [] 
}: TextPanelProps) {

  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState([32]);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textColor, setTextColor] = useState("#f51515ff");
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [alignment, setAlignment] = useState("center");
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [opacity, setOpacity] = useState([100]);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState([0]);
  const [shadowColor, setShadowColor] = useState("#000000");
  const [shadowBlur, setShadowBlur] = useState([0]);
  const [backgroundBoxColor, setBackgroundBoxColor] = useState<string | undefined>(undefined);
  const [backgroundBoxPadding, setBackgroundBoxPadding] = useState([6]);

  const fontOptions = [
    "Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana",
    "Courier New", "Impact", "Comic Sans MS", "Trebuchet MS",
  ];

  const addTextLayer = () => {
    if (!text.trim()) return;
    const newTextLayer: TextLayer = {
      id: `text-${Date.now()}`,
      text,
      x: 300,
      y: 200,
      fontSize: fontSize[0],
      color: textColor,
      fontFamily,
      bold,
      italic,
      opacity: opacity[0],
      strokeColor,
      strokeWidth: strokeWidth[0],
      shadowColor,
      shadowBlur: shadowBlur[0],
      backgroundBoxColor,
      backgroundBoxPadding: backgroundBoxPadding[0],
    };
    onTextLayerAdd?.(newTextLayer); // ✅ send to parent
    setText(""); // clear input
  };

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a]">
      {/* Header */}
      <div className="p-4 border-b border-[#3a3a3a] bg-[#2a2a2a]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
            <Type className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Text Editor</h2>
            <p className="text-xs text-gray-400">Create and customize text layers</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-8">

          {/* Text Input Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-gray-600 rounded-md flex items-center justify-center">
                <Type className="h-3 w-3 text-white" />
              </div>
              <h3 className="text-sm font-bold text-white">Content</h3>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-300">Text Content</Label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text here..."
                className="min-h-[100px] bg-[#0f0f0f] border-[#3a3a3a] text-white placeholder-gray-500 rounded-lg focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

         


          {/* Text Layers Section */}
          {textLayers.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 bg-gray-600 rounded-md flex items-center justify-center">
                  <Type className="h-3 w-3 text-white" />
                </div>
                <h3 className="text-sm font-bold text-white">Active Layers</h3>
                <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {textLayers.length}
                </div>
              </div>
              <div className="space-y-3">
                {textLayers.map((layer) => (
                  <div
                    key={layer.id}
                    className="relative p-4 bg-[#0f0f0f] border border-[#3a3a3a] rounded-lg hover:border-[#4a4a4a] transition-colors group"
                  >
                    <button
                      onClick={() => {
                        onTextLayerRemove?.(layer.id)
                      }
                      }
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="text-white text-sm font-medium truncate pr-8">{layer.text}</div>
                    <div className="text-gray-400 text-xs mt-2 flex items-center gap-2">
                      <span className="bg-[#2a2a2a] px-2 py-1 rounded text-xs">{layer.fontSize}px</span>
                      <span className="bg-[#2a2a2a] px-2 py-1 rounded text-xs">{layer.fontFamily}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Font Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-gray-600 rounded-md flex items-center justify-center">
                <Type className="h-3 w-3 text-white" />
              </div>
              <h3 className="text-sm font-bold text-white">Typography</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-300">Font Family</Label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger className="bg-[#0f0f0f] border-[#3a3a3a] text-white rounded-lg focus:border-blue-500 transition-colors">
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

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-300">Font Size</Label>
                  <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
                    {fontSize[0]}px
                  </div>
                </div>
                <Slider 
                  value={fontSize} 
                  onValueChange={setFontSize} 
                  min={12} 
                  max={120} 
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Weight / Style */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setBold(!bold)}
                  className={`${bold ? 'bg-blue-600 border-blue-600 text-white' : 'bg-[#0f0f0f] border-[#3a3a3a] text-white hover:bg-[#2a2a2a]'}`}
                >
                  Bold
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setItalic(!italic)}
                  className={`${italic ? 'bg-blue-600 border-blue-600 text-white' : 'bg-[#0f0f0f] border-[#3a3a3a] text-white hover:bg-[#2a2a2a]'}`}
                >
                  Italic
                </Button>
              </div>

              {/* Alignment */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-300">Text Alignment</Label>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setAlignment("left")}
                    className={`flex-1 ${alignment === 'left' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-[#0f0f0f] border-[#3a3a3a] text-white hover:bg-[#2a2a2a]'}`}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setAlignment("center")}
                    className={`flex-1 ${alignment === 'center' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-[#0f0f0f] border-[#3a3a3a] text-white hover:bg-[#2a2a2a]'}`}
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setAlignment("right")}
                    className={`flex-1 ${alignment === 'right' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-[#0f0f0f] border-[#3a3a3a] text-white hover:bg-[#2a2a2a]'}`}
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-[#3a3a3a]" />

          {/* Color Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-gray-600 rounded-md flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <h3 className="text-sm font-bold text-white">Colors</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-300">Text Color</Label>
                <div className="flex items-center gap-3">
                  <Input 
                    type="color" 
                    value={textColor} 
                    onChange={(e) => setTextColor(e.target.value)} 
                    className="w-16 h-10 rounded-lg border-[#3a3a3a] bg-[#0f0f0f] cursor-pointer"
                  />
                  <div className="flex-1 text-sm text-gray-400 font-mono bg-[#0f0f0f] border border-[#3a3a3a] rounded-lg px-3 py-2">
                    {textColor}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-300">Background Color</Label>
                <div className="flex items-center gap-3">
                  <Input 
                    type="color" 
                    value={backgroundColor} 
                    onChange={(e) => setBackgroundColor(e.target.value)} 
                    className="w-16 h-10 rounded-lg border-[#3a3a3a] bg-[#0f0f0f] cursor-pointer"
                  />
                  <div className="flex-1 text-sm text-gray-400 font-mono bg-[#0f0f0f] border border-[#3a3a3a] rounded-lg px-3 py-2">
                    {backgroundColor}
                  </div>
                </div>
              </div>

              {/* Opacity */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-300">Opacity</Label>
                  <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
                    {opacity[0]}%
                  </div>
                </div>
                <Slider 
                  value={opacity}
                  onValueChange={setOpacity}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Stroke */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-300">Stroke</Label>
                <div className="flex items-center gap-3">
                  <Input 
                    type="color" 
                    value={strokeColor} 
                    onChange={(e) => setStrokeColor(e.target.value)} 
                    className="w-16 h-10 rounded-lg border-[#3a3a3a] bg-[#0f0f0f] cursor-pointer"
                  />
                  <div className="flex-1">
                    <Slider 
                      value={strokeWidth}
                      onValueChange={setStrokeWidth}
                      min={0}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Shadow */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-300">Shadow</Label>
                <div className="flex items-center gap-3">
                  <Input 
                    type="color" 
                    value={shadowColor} 
                    onChange={(e) => setShadowColor(e.target.value)} 
                    className="w-16 h-10 rounded-lg border-[#3a3a3a] bg-[#0f0f0f] cursor-pointer"
                  />
                  <div className="flex-1">
                    <Slider 
                      value={shadowBlur}
                      onValueChange={setShadowBlur}
                      min={0}
                      max={30}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Text Background Box */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-300">Text Background Box</Label>
                <div className="flex items-center gap-3">
                  <Input 
                    type="color" 
                    value={backgroundBoxColor ?? '#000000'} 
                    onChange={(e) => setBackgroundBoxColor(e.target.value)} 
                    className="w-16 h-10 rounded-lg border-[#3a3a3a] bg-[#0f0f0f] cursor-pointer"
                  />
                  <div className="flex-1">
                    <Slider 
                      value={backgroundBoxPadding}
                      onValueChange={setBackgroundBoxPadding}
                      min={0}
                      max={32}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
      
      {/* Add Button at Bottom */}
      <div className="p-4 border-t border-[#3a3a3a]">
        <Button
          onClick={addTextLayer}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Type className="h-4 w-4 mr-2" />
          Add Text Layer
        </Button>
      </div>
    </div>
  );
}
