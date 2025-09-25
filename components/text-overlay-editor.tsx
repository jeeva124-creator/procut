// "use client"

// import { useState } from "react"
// import { Card } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Slider } from "@/components/ui/slider"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Badge } from "@/components/ui/badge"
// import { Type, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Plus, Trash2 } from "lucide-react"

// interface TextOverlay {
//   id: string
//   text: string
//   fontSize: number
//   fontFamily: string
//   color: string
//   backgroundColor: string
//   position: { x: number; y: number }
//   rotation: number
//   opacity: number
//   bold: boolean
//   italic: boolean
//   underline: boolean
//   align: "left" | "center" | "right"
//   startTime: number
//   duration: number
//   animation: string
// }

// export function TextOverlayEditor() {
//   const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([])
//   const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null)
//   const [newText, setNewText] = useState("")

//   const addTextOverlay = () => {
//     if (!newText.trim()) return

//     const newOverlay: TextOverlay = {
//       id: Math.random().toString(36).substr(2, 9),
//       text: newText,
//       fontSize: 24,
//       fontFamily: "Arial",
//       color: "#ffffff",
//       backgroundColor: "transparent",
//       position: { x: 50, y: 50 },
//       rotation: 0,
//       opacity: 100,
//       bold: false,
//       italic: false,
//       underline: false,
//       align: "center",
//       startTime: 0,
//       duration: 5,
//       animation: "none",
//     }

//     setTextOverlays((prev) => [...prev, newOverlay])
//     setSelectedOverlay(newOverlay.id)
//     setNewText("")
//   }

//   const updateOverlay = (id: string, updates: Partial<TextOverlay>) => {
//     setTextOverlays((prev) => prev.map((overlay) => (overlay.id === id ? { ...overlay, ...updates } : overlay)))
//   }

//   const deleteOverlay = (id: string) => {
//     setTextOverlays((prev) => prev.filter((overlay) => overlay.id !== id))
//     if (selectedOverlay === id) setSelectedOverlay(null)
//   }

//   const selectedOverlayData = textOverlays.find((overlay) => overlay.id === selectedOverlay)

//   return (
//     <Card className="p-4">
//       <div className="flex items-center justify-between mb-4">
//         <h4 className="font-medium flex items-center gap-2">
//           <Type className="h-4 w-4" />
//           Text Overlays
//         </h4>
//         <Badge variant="outline">{textOverlays.length} overlays</Badge>
//       </div>

//       {/* Add New Text */}
//       <div className="space-y-3 mb-4">
//         <div className="flex gap-2">
//           <Input
//             placeholder="Enter text..."
//             value={newText}
//             onChange={(e) => setNewText(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && addTextOverlay()}
//             className="flex-1"
//           />
//           <Button onClick={addTextOverlay} disabled={!newText.trim()}>
//             <Plus className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>

//       {/* Text Overlay List */}
//       {textOverlays.length > 0 && (
//         <div className="space-y-2 mb-4">
//           <Label>Existing Overlays</Label>
//           {textOverlays.map((overlay) => (
//             <div
//               key={overlay.id}
//               className={`p-3 rounded-md border cursor-pointer transition-colors ${
//                 selectedOverlay === overlay.id ? "border-primary bg-primary/10" : "border-border hover:bg-accent/50"
//               }`}
//               onClick={() => setSelectedOverlay(overlay.id)}
//             >
//               <div className="flex items-center justify-between">
//                 <div className="flex-1">
//                   <p className="font-medium truncate">{overlay.text}</p>
//                   <p className="text-sm text-muted-foreground">
//                     {overlay.startTime}s - {overlay.startTime + overlay.duration}s
//                   </p>
//                 </div>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={(e) => {
//                     e.stopPropagation()
//                     deleteOverlay(overlay.id)
//                   }}
//                 >
//                   <Trash2 className="h-4 w-4" />
//                 </Button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Text Editor */}
//       {selectedOverlayData && (
//         <Tabs defaultValue="style" className="w-full">
//           <TabsList className="grid w-full grid-cols-3">
//             <TabsTrigger value="style">Style</TabsTrigger>
//             <TabsTrigger value="position">Position</TabsTrigger>
//             <TabsTrigger value="timing">Timing</TabsTrigger>
//           </TabsList>

//           <TabsContent value="style" className="space-y-4">
//             <div>
//               <Label>Text Content</Label>
//               <Input
//                 value={selectedOverlayData.text}
//                 onChange={(e) => updateOverlay(selectedOverlayData.id, { text: e.target.value })}
//                 className="mt-2"
//               />
//             </div>

//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <Label>Font Family</Label>
//                 <Select
//                   value={selectedOverlayData.fontFamily}
//                   onValueChange={(value) => updateOverlay(selectedOverlayData.id, { fontFamily: value })}
//                 >
//                   <SelectTrigger className="mt-2">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Arial">Arial</SelectItem>
//                     <SelectItem value="Helvetica">Helvetica</SelectItem>
//                     <SelectItem value="Times New Roman">Times New Roman</SelectItem>
//                     <SelectItem value="Georgia">Georgia</SelectItem>
//                     <SelectItem value="Verdana">Verdana</SelectItem>
//                     <SelectItem value="Impact">Impact</SelectItem>
//                     <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <Label>Font Size</Label>
//                 <Slider
//                   value={[selectedOverlayData.fontSize]}
//                   onValueChange={(value) => updateOverlay(selectedOverlayData.id, { fontSize: value[0] })}
//                   min={12}
//                   max={72}
//                   step={1}
//                   className="mt-2"
//                 />
//                 <span className="text-sm text-muted-foreground">{selectedOverlayData.fontSize}px</span>
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <Label>Text Color</Label>
//                 <div className="flex gap-2 mt-2">
//                   <Input
//                     type="color"
//                     value={selectedOverlayData.color}
//                     onChange={(e) => updateOverlay(selectedOverlayData.id, { color: e.target.value })}
//                     className="w-12 h-10 p-1 border rounded"
//                   />
//                   <Input
//                     value={selectedOverlayData.color}
//                     onChange={(e) => updateOverlay(selectedOverlayData.id, { color: e.target.value })}
//                     className="flex-1"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <Label>Background</Label>
//                 <div className="flex gap-2 mt-2">
//                   <Input
//                     type="color"
//                     value={
//                       selectedOverlayData.backgroundColor === "transparent"
//                         ? "#000000"
//                         : selectedOverlayData.backgroundColor
//                     }
//                     onChange={(e) => updateOverlay(selectedOverlayData.id, { backgroundColor: e.target.value })}
//                     className="w-12 h-10 p-1 border rounded"
//                   />
//                   <Select
//                     value={selectedOverlayData.backgroundColor}
//                     onValueChange={(value) => updateOverlay(selectedOverlayData.id, { backgroundColor: value })}
//                   >
//                     <SelectTrigger className="flex-1">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="transparent">Transparent</SelectItem>
//                       <SelectItem value="#000000">Black</SelectItem>
//                       <SelectItem value="#ffffff">White</SelectItem>
//                       <SelectItem value="#ff0000">Red</SelectItem>
//                       <SelectItem value="#00ff00">Green</SelectItem>
//                       <SelectItem value="#0000ff">Blue</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//             </div>

//             <div className="flex gap-2">
//               <Button
//                 variant={selectedOverlayData.bold ? "default" : "outline"}
//                 size="sm"
//                 onClick={() => updateOverlay(selectedOverlayData.id, { bold: !selectedOverlayData.bold })}
//                 className="bg-transparent"
//               >
//                 <Bold className="h-4 w-4" />
//               </Button>
//               <Button
//                 variant={selectedOverlayData.italic ? "default" : "outline"}
//                 size="sm"
//                 onClick={() => updateOverlay(selectedOverlayData.id, { italic: !selectedOverlayData.italic })}
//                 className="bg-transparent"
//               >
//                 <Italic className="h-4 w-4" />
//               </Button>
//               <Button
//                 variant={selectedOverlayData.underline ? "default" : "outline"}
//                 size="sm"
//                 onClick={() => updateOverlay(selectedOverlayData.id, { underline: !selectedOverlayData.underline })}
//                 className="bg-transparent"
//               >
//                 <Underline className="h-4 w-4" />
//               </Button>
//             </div>

//             <div className="flex gap-2">
//               <Button
//                 variant={selectedOverlayData.align === "left" ? "default" : "outline"}
//                 size="sm"
//                 onClick={() => updateOverlay(selectedOverlayData.id, { align: "left" })}
//                 className="bg-transparent"
//               >
//                 <AlignLeft className="h-4 w-4" />
//               </Button>
//               <Button
//                 variant={selectedOverlayData.align === "center" ? "default" : "outline"}
//                 size="sm"
//                 onClick={() => updateOverlay(selectedOverlayData.id, { align: "center" })}
//                 className="bg-transparent"
//               >
//                 <AlignCenter className="h-4 w-4" />
//               </Button>
//               <Button
//                 variant={selectedOverlayData.align === "right" ? "default" : "outline"}
//                 size="sm"
//                 onClick={() => updateOverlay(selectedOverlayData.id, { align: "right" })}
//                 className="bg-transparent"
//               >
//                 <AlignRight className="h-4 w-4" />
//               </Button>
//             </div>
//           </TabsContent>

//           <TabsContent value="position" className="space-y-4">
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <Label>X Position</Label>
//                 <Slider
//                   value={[selectedOverlayData.position.x]}
//                   onValueChange={(value) =>
//                     updateOverlay(selectedOverlayData.id, {
//                       position: { ...selectedOverlayData.position, x: value[0] },
//                     })
//                   }
//                   min={0}
//                   max={100}
//                   step={1}
//                   className="mt-2"
//                 />
//                 <span className="text-sm text-muted-foreground">{selectedOverlayData.position.x}%</span>
//               </div>

//               <div>
//                 <Label>Y Position</Label>
//                 <Slider
//                   value={[selectedOverlayData.position.y]}
//                   onValueChange={(value) =>
//                     updateOverlay(selectedOverlayData.id, {
//                       position: { ...selectedOverlayData.position, y: value[0] },
//                     })
//                   }
//                   min={0}
//                   max={100}
//                   step={1}
//                   className="mt-2"
//                 />
//                 <span className="text-sm text-muted-foreground">{selectedOverlayData.position.y}%</span>
//               </div>
//             </div>

//             <div>
//               <Label>Rotation</Label>
//               <Slider
//                 value={[selectedOverlayData.rotation]}
//                 onValueChange={(value) => updateOverlay(selectedOverlayData.id, { rotation: value[0] })}
//                 min={-180}
//                 max={180}
//                 step={1}
//                 className="mt-2"
//               />
//               <span className="text-sm text-muted-foreground">{selectedOverlayData.rotation}°</span>
//             </div>

//             <div>
//               <Label>Opacity</Label>
//               <Slider
//                 value={[selectedOverlayData.opacity]}
//                 onValueChange={(value) => updateOverlay(selectedOverlayData.id, { opacity: value[0] })}
//                 min={0}
//                 max={100}
//                 step={1}
//                 className="mt-2"
//               />
//               <span className="text-sm text-muted-foreground">{selectedOverlayData.opacity}%</span>
//             </div>
//           </TabsContent>

//           <TabsContent value="timing" className="space-y-4">
//             <div>
//               <Label>Start Time</Label>
//               <Input
//                 type="number"
//                 value={selectedOverlayData.startTime}
//                 onChange={(e) =>
//                   updateOverlay(selectedOverlayData.id, { startTime: Number.parseFloat(e.target.value) || 0 })
//                 }
//                 step="0.1"
//                 min="0"
//                 className="mt-2"
//               />
//             </div>

//             <div>
//               <Label>Duration</Label>
//               <Input
//                 type="number"
//                 value={selectedOverlayData.duration}
//                 onChange={(e) =>
//                   updateOverlay(selectedOverlayData.id, { duration: Number.parseFloat(e.target.value) || 1 })
//                 }
//                 step="0.1"
//                 min="0.1"
//                 className="mt-2"
//               />
//             </div>

//             <div>
//               <Label>Animation</Label>
//               <Select
//                 value={selectedOverlayData.animation}
//                 onValueChange={(value) => updateOverlay(selectedOverlayData.id, { animation: value })}
//               >
//                 <SelectTrigger className="mt-2">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="none">None</SelectItem>
//                   <SelectItem value="fadeIn">Fade In</SelectItem>
//                   <SelectItem value="fadeOut">Fade Out</SelectItem>
//                   <SelectItem value="slideLeft">Slide Left</SelectItem>
//                   <SelectItem value="slideRight">Slide Right</SelectItem>
//                   <SelectItem value="slideUp">Slide Up</SelectItem>
//                   <SelectItem value="slideDown">Slide Down</SelectItem>
//                   <SelectItem value="zoom">Zoom</SelectItem>
//                   <SelectItem value="typewriter">Typewriter</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </TabsContent>
//         </Tabs>
//       )}
//     </Card>
//   )
// }
