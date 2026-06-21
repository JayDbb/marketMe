import { CanvasData, TextNode } from "@/types/canvas";

/**
 * Studio Domain: Canvas Text Injection Utility
 * 
 * Injects AI-generated text into a JSON Canvas Template.
 * This is the core engine for the "Canvas-first" integration approach.
 * 
 * @param baseCanvas The JSON canvas template (e.g., fetched from Supabase `studio_templates`)
 * @param newHeadline The AI generated headline or text to inject
 * @returns A new modified CanvasData object ready for rendering or editing
 */
export function injectTextIntoCanvas(baseCanvas: CanvasData, newHeadline: string): CanvasData {
  // Deep clone to avoid mutating the original template state
  const modifiedCanvas: CanvasData = JSON.parse(JSON.stringify(baseCanvas));

  // Find the primary text node to update.
  // For this MVP, we assume the first text node is the primary headline.
  // In a future iteration, templates could designate a specific layer id (e.g., id: 'ai-target').
  const targetTextNode = modifiedCanvas.layers.find(layer => layer.type === 'text') as TextNode | undefined;

  if (targetTextNode) {
    targetTextNode.content = newHeadline;
  }

  return modifiedCanvas;
}
