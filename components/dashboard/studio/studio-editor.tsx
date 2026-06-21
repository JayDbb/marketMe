'use client'

import React, { useState } from 'react'
import { CanvasData, CanvasNode, TextNode, RectNode, ImageNode } from '@/types/canvas'
import { CanvasEditor } from './canvas-editor'
import { ChevronUp, ChevronDown, Trash2, Plus, Type, Square, Image as ImageIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface StudioEditorProps {
  initialData: CanvasData;
}

export function StudioEditor({ initialData }: StudioEditorProps) {
  const [canvasData, setCanvasData] = useState<CanvasData>(initialData)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const selectedLayer = canvasData.layers.find(l => l.id === selectedId)

  // ─── Actions ─────────────────────────────────────────────────────────────────
  const updateLayer = (updatedLayer: CanvasNode) => {
    setCanvasData(prev => ({
      ...prev,
      layers: prev.layers.map(l => l.id === updatedLayer.id ? updatedLayer : l)
    }))
  }

  const deleteLayer = (id: string) => {
    setCanvasData(prev => ({
      ...prev,
      layers: prev.layers.filter(l => l.id !== id)
    }))
    if (selectedId === id) setSelectedId(null)
  }

  const moveLayer = (id: string, direction: 'up' | 'down') => {
    setCanvasData(prev => {
      const layers = [...prev.layers].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
      const idx = layers.findIndex(l => l.id === id)
      if (idx < 0) return prev
      if (direction === 'up' && idx < layers.length - 1) {
        // Swap zIndex with next layer
        const temp = layers[idx].zIndex
        layers[idx].zIndex = layers[idx + 1].zIndex
        layers[idx + 1].zIndex = temp
      } else if (direction === 'down' && idx > 0) {
        // Swap zIndex with prev layer
        const temp = layers[idx].zIndex
        layers[idx].zIndex = layers[idx - 1].zIndex
        layers[idx - 1].zIndex = temp
      }
      return { ...prev, layers }
    })
  }

  const addTextLayer = () => {
    const newLayer: TextNode = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'New Text',
      x: 50,
      y: 50,
      fontSize: 48,
      fontFamily: 'Inter',
      fill: '#ffffff',
      zIndex: canvasData.layers.length + 1
    }
    setCanvasData(prev => ({ ...prev, layers: [...prev.layers, newLayer] }))
    setSelectedId(newLayer.id)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const src = event.target?.result as string
      // Load image to get dimensions
      const img = new Image()
      img.onload = () => {
        // Calculate scale to fit within canvas (max width 500)
        let w = img.width
        let h = img.height
        if (w > 500) {
          h = h * (500 / w)
          w = 500
        }
        
        const newLayer: ImageNode = {
          id: `img-${Date.now()}`,
          type: 'image',
          src: src,
          x: 50,
          y: 50,
          width: w,
          height: h,
          zIndex: canvasData.layers.length + 1
        }
        setCanvasData(prev => ({ ...prev, layers: [...prev.layers, newLayer] }))
        setSelectedId(newLayer.id)
      }
      img.src = src
    }
    reader.readAsDataURL(file)
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ─── Render Helpers ────────────────────────────────────────────────────────
  const renderProperties = () => {
    if (!selectedLayer) {
      return (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white mb-4">Canvas Settings</h4>
          <div className="space-y-2">
            <Label className="text-xs text-white/50 uppercase tracking-wider">Background Color</Label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={canvasData.canvas.backgroundColor} 
                onChange={e => setCanvasData(prev => ({ ...prev, canvas: { ...prev.canvas, backgroundColor: e.target.value } }))}
                className="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer"
              />
              <Input 
                value={canvasData.canvas.backgroundColor} 
                onChange={e => setCanvasData(prev => ({ ...prev, canvas: { ...prev.canvas, backgroundColor: e.target.value } }))}
                className="bg-white/5 border-white/10 text-white font-mono uppercase"
              />
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <h4 className="text-sm font-bold text-white mb-4 capitalize">{selectedLayer.type} Properties</h4>
        
        {selectedLayer.type === 'text' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-white/50 uppercase tracking-wider">Text Content</Label>
              <textarea 
                value={(selectedLayer as TextNode).content}
                onChange={e => updateLayer({ ...selectedLayer, content: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white p-3 rounded-xl min-h-[100px] resize-y text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-white/50 uppercase tracking-wider">Font Size</Label>
                <Input 
                  type="number"
                  value={(selectedLayer as TextNode).fontSize}
                  onChange={e => updateLayer({ ...selectedLayer, fontSize: Number(e.target.value) })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-white/50 uppercase tracking-wider">Color</Label>
                <div className="flex gap-2 h-10">
                  <input 
                    type="color" 
                    value={(selectedLayer as TextNode).fill as string} 
                    onChange={e => updateLayer({ ...selectedLayer, fill: e.target.value })}
                    className="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer shrink-0"
                  />
                  <Input 
                    value={(selectedLayer as TextNode).fill as string} 
                    onChange={e => updateLayer({ ...selectedLayer, fill: e.target.value })}
                    className="bg-white/5 border-white/10 text-white font-mono uppercase h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedLayer.type === 'rect' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-white/50 uppercase tracking-wider">Fill Color</Label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={(selectedLayer as RectNode).fill as string} 
                  onChange={e => updateLayer({ ...selectedLayer, fill: e.target.value })}
                  className="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer"
                />
                <Input 
                  value={(selectedLayer as RectNode).fill as string} 
                  onChange={e => updateLayer({ ...selectedLayer, fill: e.target.value })}
                  className="bg-white/5 border-white/10 text-white font-mono uppercase"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-white/50 uppercase tracking-wider">Border Radius</Label>
              <Input 
                type="number"
                value={(selectedLayer as RectNode).cornerRadius as number || 0}
                onChange={e => updateLayer({ ...selectedLayer, cornerRadius: Number(e.target.value) })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
        )}
        
        {/* Opacity slider common for all */}
        <div className="space-y-2 pt-4 border-t border-white/5">
          <div className="flex justify-between">
             <Label className="text-xs text-white/50 uppercase tracking-wider">Opacity</Label>
             <span className="text-xs text-white/50">{Math.round((selectedLayer.opacity ?? 1) * 100)}%</span>
          </div>
          <input 
            type="range" min="0" max="1" step="0.05"
            value={selectedLayer.opacity ?? 1}
            onChange={e => updateLayer({ ...selectedLayer, opacity: Number(e.target.value) })}
            className="w-full accent-blue-500"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full min-h-[600px] flex gap-4">
      {/* Left Sidebar: Layers */}
      <div className="w-64 shrink-0 flex flex-col bg-[#0c0c18]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/2">
          <h3 className="text-sm font-bold text-white">Layers</h3>
          <div className="flex gap-1">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              title="Add Image"
              className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center hover:bg-purple-500 hover:text-white transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={addTextLayer} 
              title="Add Text"
              className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors"
            >
              <Type className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {[...canvasData.layers].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0)).map((layer) => (
            <div 
              key={layer.id}
              onClick={() => setSelectedId(layer.id)}
              className={`flex items-center justify-between p-2 rounded-xl cursor-pointer border transition-colors ${
                selectedId === layer.id ? 'bg-white/10 border-white/20' : 'bg-transparent border-transparent hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {layer.type === 'text' && <Type className="w-4 h-4 text-white/50 shrink-0" />}
                {layer.type === 'image' && <ImageIcon className="w-4 h-4 text-white/50 shrink-0" />}
                {layer.type === 'rect' && <Square className="w-4 h-4 text-white/50 shrink-0" />}
                <span className="text-xs text-white truncate">
                  {layer.type === 'text' ? (layer as TextNode).content : layer.id}
                </span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity">
                <div className="flex flex-col">
                  <button onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 'up') }} className="hover:text-white text-white/40"><ChevronUp className="w-3 h-3" /></button>
                  <button onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 'down') }} className="hover:text-white text-white/40"><ChevronDown className="w-3 h-3" /></button>
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id) }} className="w-6 h-6 flex items-center justify-center text-red-400 hover:bg-red-500/20 rounded-md">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center: Canvas Area */}
      <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl overflow-hidden p-8 flex items-center justify-center relative">
        <CanvasEditor 
          canvasData={canvasData} 
          onChange={setCanvasData}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      {/* Right Sidebar: Properties */}
      <div className="w-72 shrink-0 bg-[#0c0c18]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 overflow-y-auto custom-scrollbar shadow-xl">
        {renderProperties()}
      </div>
    </div>
  )
}
