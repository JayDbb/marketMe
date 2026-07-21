'use client'

import {
  Image as ImageIcon,
  Type,
  Square,
  Circle,
  Minus,
  LayoutTemplate,
  Heading1,
  Heading2,
  Text as TextIcon,
  Layers,
  Images,
} from 'lucide-react'
import type { CanvasData, CircleNode, RectNode, TextNode } from '@/types/canvas'
import {
  INSTAGRAM_FORMATS,
  type InstagramFormatId,
} from '@/lib/instagram-formats'
import { nextZIndex } from '@/lib/canvas-layer-utils'
import { enablePages } from '@/lib/canvas-pages'
import type { StudioBrandKit } from '@/lib/studio-brand-kit'
import { StudioStockPicker } from './studio-stock-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type StudioToolTab = 'design' | 'text' | 'elements' | 'photos'

const TABS: { id: StudioToolTab; label: string; icon: React.ElementType }[] = [
  { id: 'design', label: 'Design', icon: LayoutTemplate },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'elements', label: 'Elements', icon: Layers },
  { id: 'photos', label: 'Photos', icon: Images },
]

interface StudioToolsPanelProps {
  canvasData: CanvasData
  activeTab: StudioToolTab
  onTabChange: (tab: StudioToolTab) => void
  onCanvasChange: (data: CanvasData) => void
  onFormatChange: (formatId: InstagramFormatId) => void
  onAddLayer: (layer: CanvasData['layers'][number]) => void
  onImageUpload: () => void
  brandKit?: StudioBrandKit
}

export function StudioToolsPanel({
  canvasData,
  activeTab,
  onTabChange,
  onCanvasChange,
  onFormatChange,
  onAddLayer,
  onImageUpload,
  brandKit,
}: StudioToolsPanelProps) {
  const z = nextZIndex(canvasData.layers)
  const brandColors = brandKit?.colors ?? []

  const addTextPreset = (preset: 'heading' | 'subheading' | 'body') => {
    const presets: Record<typeof preset, Partial<TextNode>> = {
      heading: {
        content: 'Add a heading',
        fontSize: 72,
        fontStyle: 'bold',
        align: 'center',
        width: canvasData.canvas.width - 160,
        y: canvasData.canvas.height * 0.38,
      },
      subheading: {
        content: 'Add a subheading',
        fontSize: 40,
        fontStyle: 'normal',
        align: 'center',
        width: canvasData.canvas.width - 200,
        y: canvasData.canvas.height * 0.48,
      },
      body: {
        content: 'Add body text',
        fontSize: 28,
        fontStyle: 'normal',
        align: 'left',
        width: canvasData.canvas.width - 160,
        y: canvasData.canvas.height * 0.58,
      },
    }
    const p = presets[preset]
    const layer: TextNode = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: p.content!,
      x: 80,
      y: p.y!,
      fontSize: p.fontSize!,
      fontFamily: 'Inter',
      fontStyle: p.fontStyle,
      fill: '#ffffff',
      align: p.align,
      width: p.width,
      zIndex: z,
    }
    onAddLayer(layer)
  }

  const addRect = () => {
    const layer: RectNode = {
      id: `rect-${Date.now()}`,
      type: 'rect',
      x: 120,
      y: 120,
      width: 320,
      height: 200,
      fill: '#3b82f6',
      cornerRadius: 16,
      zIndex: z,
    }
    onAddLayer(layer)
  }

  const addCircle = () => {
    const layer: CircleNode = {
      id: `circle-${Date.now()}`,
      type: 'circle',
      x: 200,
      y: 200,
      width: 200,
      height: 200,
      fill: '#8b5cf6',
      zIndex: z,
    }
    onAddLayer(layer)
  }

  const addLine = () => {
    const layer: RectNode = {
      id: `line-${Date.now()}`,
      type: 'rect',
      x: 80,
      y: canvasData.canvas.height / 2,
      width: canvasData.canvas.width - 160,
      height: 4,
      fill: '#ffffff',
      cornerRadius: 2,
      zIndex: z,
    }
    onAddLayer(layer)
  }

  const addGradientOverlay = () => {
    const { width, height } = canvasData.canvas
    const layer: RectNode = {
      id: `overlay-${Date.now()}`,
      type: 'rect',
      x: 0,
      y: 0,
      width,
      height,
      fill: 'rgba(0,0,0,0.45)',
      gradientColors: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.65)'],
      zIndex: z,
    }
    onAddLayer(layer)
  }

  return (
    <div className="flex flex-col w-full min-h-0">
      <div className="sticky top-0 z-10 flex border-b border-black/5 dark:border-white/8 shrink-0 bg-zinc-50 dark:bg-[#161b22]">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/5'
                  : 'text-zinc-500 dark:text-white/40 hover:text-zinc-800 dark:hover:text-white/70'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="p-4 space-y-5">
        {activeTab === 'design' && (
          <>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-white/40 mb-3">
                Instagram format
              </h4>
              <div className="space-y-2">
                {INSTAGRAM_FORMATS.map((format) => {
                  const active =
                    canvasData.canvas.width === format.width &&
                    canvasData.canvas.height === format.height
                  return (
                    <button
                      key={format.id}
                      type="button"
                      onClick={() => onFormatChange(format.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-colors ${
                        active
                          ? 'border-blue-500/40 bg-blue-500/10'
                          : 'border-black/5 dark:border-white/10 hover:bg-white dark:hover:bg-white/5'
                      }`}
                    >
                      <div
                        className={`shrink-0 rounded-md border border-white/20 bg-zinc-800 ${
                          format.id === 'story'
                            ? 'w-5 h-8'
                            : format.id === 'landscape'
                              ? 'w-8 h-5'
                              : format.id === 'portrait' || format.id === 'portrait-grid'
                                ? 'w-6 h-7'
                                : 'w-7 h-7'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                          {format.label}
                          {format.recommended && (
                            <span className="ml-1.5 text-[9px] font-bold uppercase text-blue-400">
                              Best
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-zinc-500 dark:text-white/40">{format.subtitle}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-white/40">
                Background
              </Label>
              <div className="flex gap-2 mt-2">
                <input
                  type="color"
                  value={canvasData.canvas.backgroundColor}
                  onChange={(e) =>
                    onCanvasChange({
                      ...canvasData,
                      canvas: { ...canvasData.canvas, backgroundColor: e.target.value },
                    })
                  }
                  className="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer shrink-0"
                />
                <Input
                  value={canvasData.canvas.backgroundColor}
                  onChange={(e) =>
                    onCanvasChange({
                      ...canvasData,
                      canvas: { ...canvasData.canvas, backgroundColor: e.target.value },
                    })
                  }
                  className="bg-white dark:bg-white/5 border-transparent dark:border-white/10 text-zinc-900 dark:text-white font-mono uppercase text-xs"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {(brandColors.length > 0 ? brandColors : ['#0d1117', '#3b82f6', '#ffffff', '#f59e0b', '#10b981']).map(
                  (color) => (
                  <button
                    key={color}
                    type="button"
                    title={color}
                    onClick={() =>
                      onCanvasChange({
                        ...canvasData,
                        canvas: { ...canvasData.canvas, backgroundColor: color },
                      })
                    }
                    className="w-7 h-7 rounded-lg border border-black/10 dark:border-white/15 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              {brandKit && (
                <p className="text-[10px] text-zinc-400 dark:text-white/30 mt-2">
                  Brand palette from your industry
                </p>
              )}
            </div>

            {!canvasData.pages?.length && (
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-white/40 mb-2">
                  Carousel
                </h4>
                <button
                  type="button"
                  onClick={() => onCanvasChange(enablePages(canvasData))}
                  className="w-full h-9 rounded-xl border border-dashed border-purple-500/40 text-purple-400 hover:bg-purple-500/10 text-xs font-semibold"
                >
                  Convert to carousel
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'text' && (
          <>
            <div>
              <h4 className="text-xs font-semibold text-zinc-900 dark:text-white mb-1">
                Text styles
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-white/40 leading-relaxed">
                Tap a style to add it to your design.
              </p>
            </div>
            <div className="space-y-2">
              <TextPresetCard
                icon={Heading1}
                preview="Aa"
                previewClass="text-xl font-bold tracking-tight"
                title="Heading"
                subtitle="Large · bold · centered"
                onClick={() => addTextPreset('heading')}
              />
              <TextPresetCard
                icon={Heading2}
                preview="Aa"
                previewClass="text-base font-semibold"
                title="Subheading"
                subtitle="Medium · centered"
                onClick={() => addTextPreset('subheading')}
              />
              <TextPresetCard
                icon={TextIcon}
                preview="Aa"
                previewClass="text-sm font-normal"
                title="Body text"
                subtitle="Smaller · left aligned"
                onClick={() => addTextPreset('body')}
              />
            </div>
          </>
        )}

        {activeTab === 'elements' && (
          <>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-white/40 mb-3">
                Media
              </h4>
              <button
                type="button"
                onClick={onImageUpload}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 transition-colors"
              >
                <ImageIcon className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-medium text-zinc-700 dark:text-white/80">Upload image</span>
              </button>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-white/40 mb-3">
                Shapes
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <ToolButton icon={Square} label="Rectangle" onClick={addRect} />
                <ToolButton icon={Circle} label="Circle" onClick={addCircle} />
                <ToolButton icon={Minus} label="Line" onClick={addLine} />
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-white/40 mb-3">
                Overlays
              </h4>
              <button
                type="button"
                onClick={addGradientOverlay}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-black/5 dark:border-white/10 hover:bg-white dark:hover:bg-white/5 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-linear-to-b from-transparent to-black/70 border border-white/10 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-zinc-900 dark:text-white">Gradient overlay</p>
                  <p className="text-[10px] text-zinc-500 dark:text-white/40">Darken bottom for text</p>
                </div>
              </button>
            </div>
          </>
        )}

        {activeTab === 'photos' && (
          <StudioStockPicker
            canvasWidth={canvasData.canvas.width}
            canvasHeight={canvasData.canvas.height}
            existingZIndex={z}
            onAddImage={onAddLayer}
          />
        )}
      </div>
    </div>
  )
}

function TextPresetCard({
  icon: Icon,
  preview,
  previewClass,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ElementType
  preview: string
  previewClass: string
  title: string
  subtitle: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full flex items-stretch overflow-hidden rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-blue-500/35 hover:bg-blue-500/[0.06] transition-all text-left"
    >
      <div className="w-[52px] shrink-0 flex flex-col items-center justify-center gap-1 border-r border-black/5 dark:border-white/8 bg-zinc-100/80 dark:bg-white/[0.04]">
        <span className={`text-zinc-800 dark:text-white leading-none ${previewClass}`}>
          {preview}
        </span>
        <Icon className="w-3 h-3 text-blue-400/80" />
      </div>
      <div className="flex-1 min-w-0 px-3 py-2.5 flex flex-col justify-center">
        <p className="text-xs font-semibold text-zinc-900 dark:text-white">{title}</p>
        <p className="text-[10px] text-zinc-500 dark:text-white/40 mt-0.5">{subtitle}</p>
      </div>
    </button>
  )
}

function ToolButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-blue-500/10 hover:border-blue-500/30 transition-colors"
    >
      <Icon className="w-5 h-5 text-blue-400" />
      <span className="text-[10px] font-medium text-zinc-600 dark:text-white/70">{label}</span>
    </button>
  )
}
