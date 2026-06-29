'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Stage, Layer, Text, Rect, Image as KonvaImage, Transformer } from 'react-konva'
import useImage from 'use-image'
import { CanvasData, TextNode, ImageNode, RectNode, CanvasNode as CanvasLayer } from '@/types/canvas'

interface CanvasEditorProps {
  canvasData: CanvasData
  onChange?: (data: CanvasData) => void
  selectedId?: string | null
  onSelect?: (id: string | null) => void
  maxWidth?: number
}

// A helper component to load images via URL for Konva
function URLImage({ imageNode, onSelect, onChange, isSelected }: { imageNode: ImageNode, onSelect?: any, onChange?: any, isSelected?: boolean }) {
  const [img] = useImage(imageNode.src, 'anonymous')
  const shapeRef = useRef<any>(null)

  return (
    <KonvaImage
      id={imageNode.id}
      ref={shapeRef}
      x={imageNode.x}
      y={imageNode.y}
      width={imageNode.width}
      height={imageNode.height}
      rotation={imageNode.rotation || 0}
      scaleX={imageNode.scaleX || 1}
      scaleY={imageNode.scaleY || 1}
      opacity={imageNode.opacity ?? 1}
      image={img}
      cornerRadius={imageNode.cornerRadius as number}
      draggable={!!onChange}
      onClick={() => onSelect?.(imageNode.id)}
      onTap={() => onSelect?.(imageNode.id)}
      onDragEnd={(e) => {
        onChange?.({
          ...imageNode,
          x: e.target.x(),
          y: e.target.y(),
        })
      }}
      onTransformEnd={(e) => {
        const node = shapeRef.current
        const scaleX = node.scaleX()
        const scaleY = node.scaleY()
        node.scaleX(1)
        node.scaleY(1)
        onChange?.({
          ...imageNode,
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
          width: Math.max(5, node.width() * scaleX),
          height: Math.max(5, node.height() * scaleY),
        })
      }}
    />
  )
}

export function CanvasEditor({ canvasData, onChange, selectedId, onSelect, maxWidth = 500 }: CanvasEditorProps) {
  const [mounted, setMounted] = useState(false)
  const stageRef = useRef<any>(null)
  const trRef = useRef<any>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (selectedId && trRef.current && stageRef.current) {
      const selectedNode = stageRef.current.findOne(`#${selectedId}`);
      if (selectedNode) {
        trRef.current.nodes([selectedNode]);
        trRef.current.getLayer().batchDraw();
      } else {
        trRef.current.nodes([]);
      }
    } else if (trRef.current) {
      trRef.current.nodes([]);
    }
  }, [selectedId, canvasData])

  if (!mounted) return null

  const handleExport = () => {
    if (!stageRef.current) return
    // Deselect before export to hide transformer
    onSelect?.(null)
    setTimeout(() => {
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 })
      const link = document.createElement('a')
      link.download = 'marketme-post.png'
      link.href = dataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }, 100)
  }

  const scale = canvasData.canvas.width > maxWidth ? maxWidth / canvasData.canvas.width : 1.0

  const handleNodeChange = (updatedNode: CanvasLayer) => {
    if (!onChange) return;
    onChange({
      ...canvasData,
      layers: canvasData.layers.map(layer => layer.id === updatedNode.id ? updatedNode : layer)
    })
  }

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.id() === 'bg-rect';
    if (clickedOnEmpty) {
      onSelect?.(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full h-full">
      <div className="flex justify-between w-full items-center" style={{ maxWidth: canvasData.canvas.width * scale }}>
        <h3 className="text-xs font-bold text-zinc-500 dark:text-white/40 uppercase tracking-wider">
          {canvasData.canvas.aspectRatioName} Format
        </h3>
        <button 
          onClick={handleExport} 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors shadow-lg"
        >
          Export PNG
        </button>
      </div>

      <div className="bg-white dark:bg-[#0c0c18] border border-black/5 dark:border-white/10 overflow-hidden shadow-2xl rounded-xl">
        <Stage 
          width={canvasData.canvas.width * scale} 
          height={canvasData.canvas.height * scale}
          scale={{ x: scale, y: scale }}
          ref={stageRef}
          onMouseDown={checkDeselect}
          onTouchStart={checkDeselect}
        >
          {/* Background Layer */}
          <Layer>
            <Rect 
              id="bg-rect"
              x={0} 
              y={0} 
              width={canvasData.canvas.width} 
              height={canvasData.canvas.height} 
              fill={canvasData.canvas.backgroundColor} 
            />
          </Layer>

          {/* Element Layers */}
          <Layer>
            {canvasData.layers.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)).map((node) => {
              
              if (node.type === 'text') {
                const textNode = node as TextNode
                return (
                  <Text
                    key={textNode.id}
                    id={textNode.id}
                    x={textNode.x}
                    y={textNode.y}
                    text={textNode.content}
                    fontSize={textNode.fontSize}
                    fontFamily={textNode.fontFamily}
                    fill={textNode.fill}
                    align={textNode.align || 'left'}
                    width={textNode.width}
                    rotation={textNode.rotation || 0}
                    scaleX={textNode.scaleX || 1}
                    scaleY={textNode.scaleY || 1}
                    opacity={textNode.opacity ?? 1}
                    draggable={!!onChange}
                    onClick={() => onSelect?.(textNode.id)}
                    onTap={() => onSelect?.(textNode.id)}
                    onDragEnd={(e) => {
                      handleNodeChange({ ...textNode, x: e.target.x(), y: e.target.y() })
                    }}
                    onTransformEnd={(e) => {
                      const shape = e.target;
                      handleNodeChange({
                        ...textNode,
                        x: shape.x(),
                        y: shape.y(),
                        rotation: shape.rotation(),
                        scaleX: shape.scaleX(),
                        scaleY: shape.scaleY(),
                      })
                    }}
                  />
                )
              }

              if (node.type === 'image') {
                return (
                  <URLImage 
                    key={node.id} 
                    imageNode={node as ImageNode} 
                    onSelect={onSelect}
                    onChange={handleNodeChange}
                    isSelected={node.id === selectedId}
                  />
                )
              }

              if (node.type === 'rect') {
                const rectNode = node as RectNode
                return (
                  <Rect
                    key={rectNode.id}
                    id={rectNode.id}
                    x={rectNode.x}
                    y={rectNode.y}
                    width={rectNode.width}
                    height={rectNode.height}
                    fill={rectNode.fill}
                    stroke={rectNode.stroke}
                    strokeWidth={rectNode.strokeWidth}
                    cornerRadius={rectNode.cornerRadius as number}
                    rotation={rectNode.rotation || 0}
                    scaleX={rectNode.scaleX || 1}
                    scaleY={rectNode.scaleY || 1}
                    opacity={rectNode.opacity ?? 1}
                    draggable={!!onChange}
                    onClick={() => onSelect?.(rectNode.id)}
                    onTap={() => onSelect?.(rectNode.id)}
                    onDragEnd={(e) => {
                      handleNodeChange({ ...rectNode, x: e.target.x(), y: e.target.y() })
                    }}
                    onTransformEnd={(e) => {
                      const node = e.target;
                      const scaleX = node.scaleX();
                      const scaleY = node.scaleY();
                      node.scaleX(1);
                      node.scaleY(1);
                      handleNodeChange({
                        ...rectNode,
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                        width: Math.max(5, node.width() * scaleX),
                        height: Math.max(5, node.height() * scaleY),
                      })
                    }}
                  />
                )
              }
              return null
            })}

            {/* Transformer handles resizing UI */}
            {onChange && (
              <Transformer 
                ref={trRef} 
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 5 || newBox.height < 5) return oldBox;
                  return newBox;
                }}
              />
            )}
          </Layer>
        </Stage>
      </div>
      
      {!onChange && (
        <p className="text-[11px] text-zinc-500 dark:text-white/30 mt-2 font-medium">
          This is a live canvas. AI modifies the underlying JSON, and this canvas renders the changes instantly.
        </p>
      )}
    </div>
  )
}
