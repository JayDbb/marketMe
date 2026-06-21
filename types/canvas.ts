/**
 * Represents the structure of a JSON-based Canvas Template.
 * This structure is rendered by react-konva on the frontend.
 */

// Basic node properties shared across all layer types
export interface BaseNode {
  id: string;
  type: 'text' | 'image' | 'rect' | 'circle';
  x: number;
  y: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  opacity?: number;
  zIndex?: number;
}

export interface TextNode extends BaseNode {
  type: 'text';
  content: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  align?: 'left' | 'center' | 'right';
  width?: number; // useful for text wrapping
}

export interface ImageNode extends BaseNode {
  type: 'image';
  src: string; // URL to the image (from Supabase Storage or Unsplash)
  width: number;
  height: number;
  cornerRadius?: number | number[];
}

export interface RectNode extends BaseNode {
  type: 'rect';
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number | number[];
}

// Union of all possible nodes
export type CanvasNode = TextNode | ImageNode | RectNode;

// The top-level JSON structure stored in Supabase `canvas_data`
export interface CanvasData {
  version: string;
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
    aspectRatioName: 'square' | 'portrait' | 'story' | 'custom';
  };
  layers: CanvasNode[];
}
