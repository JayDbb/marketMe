/**
 * Allowed AI models for user selection.
 * IDs are OpenRouter-style (`provider/model`). Native OpenAI keys are remapped in resolveChatModel.
 */

export type AiProviderPreference = 'auto' | 'marketme-api' | 'openai'

export type AiModelOption = {
  id: string
  label: string
  provider: string
  /** Where this model is used when selected */
  tasks: Array<'caption' | 'image'>
  hint?: string
}

export const AI_PROVIDER_OPTIONS: {
  value: AiProviderPreference
  label: string
  description: string
}[] = [
  {
    value: 'auto',
    label: 'Auto',
    description: 'Prefer MarketMe AI pipeline when configured, otherwise OpenAI/OpenRouter.',
  },
  {
    value: 'marketme-api',
    label: 'MarketMe AI pipeline',
    description: 'Strategy → schedule → posts on the MarketMe AI API (models set on the API server).',
  },
  {
    value: 'openai',
    label: 'OpenAI / OpenRouter',
    description: 'Direct captions with the model you pick below (uses OPENAI_API_KEY).',
  },
]

export const CAPTION_MODEL_OPTIONS: AiModelOption[] = [
  {
    id: 'openai/gpt-4o-mini',
    label: 'GPT-4o mini',
    provider: 'OpenAI',
    tasks: ['caption'],
    hint: 'Fast and affordable',
  },
  {
    id: 'openai/gpt-4o',
    label: 'GPT-4o',
    provider: 'OpenAI',
    tasks: ['caption'],
    hint: 'Higher quality copy',
  },
  {
    id: 'openai/gpt-4.1-mini',
    label: 'GPT-4.1 mini',
    provider: 'OpenAI',
    tasks: ['caption'],
  },
  {
    id: 'anthropic/claude-sonnet-4',
    label: 'Claude Sonnet 4',
    provider: 'Anthropic',
    tasks: ['caption'],
    hint: 'Strong writing (OpenRouter)',
  },
  {
    id: 'anthropic/claude-haiku-4.5',
    label: 'Claude Haiku 4.5',
    provider: 'Anthropic',
    tasks: ['caption'],
    hint: 'Fast Claude (OpenRouter)',
  },
  {
    id: 'google/gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
    provider: 'Google',
    tasks: ['caption'],
  },
  {
    id: 'google/gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    provider: 'Google',
    tasks: ['caption'],
  },
]

export const IMAGE_MODEL_OPTIONS: AiModelOption[] = [
  {
    id: 'dall-e-3',
    label: 'DALL·E 3',
    provider: 'OpenAI',
    tasks: ['image'],
  },
  {
    id: 'gpt-image-1',
    label: 'GPT Image 1',
    provider: 'OpenAI',
    tasks: ['image'],
    hint: 'Requires a key that supports image models',
  },
]

export const DEFAULT_CAPTION_MODEL = 'openai/gpt-4o-mini'
export const DEFAULT_IMAGE_MODEL = 'dall-e-3'
export const DEFAULT_AI_PROVIDER: AiProviderPreference = 'auto'

export type UserAiPreferences = {
  aiProvider: AiProviderPreference
  captionModel: string
  imageModel: string
}

export const DEFAULT_AI_PREFERENCES: UserAiPreferences = {
  aiProvider: DEFAULT_AI_PROVIDER,
  captionModel: DEFAULT_CAPTION_MODEL,
  imageModel: DEFAULT_IMAGE_MODEL,
}

export function isAiProviderPreference(value: string): value is AiProviderPreference {
  return value === 'auto' || value === 'marketme-api' || value === 'openai'
}

export function isAllowedCaptionModel(id: string): boolean {
  return CAPTION_MODEL_OPTIONS.some((m) => m.id === id)
}

export function isAllowedImageModel(id: string): boolean {
  return IMAGE_MODEL_OPTIONS.some((m) => m.id === id)
}

import { getOpenAiApiKey, isOpenRouterApiKey } from '@/lib/openai-config'

/** Map stored preference to a model id the configured OpenAI/OpenRouter client accepts. */
export function resolveChatModel(preferred: string | null | undefined): string {
  const apiKey = getOpenAiApiKey()
  const isOpenRouter = isOpenRouterApiKey(apiKey)
  const chosen =
    preferred && isAllowedCaptionModel(preferred) ? preferred : DEFAULT_CAPTION_MODEL

  if (isOpenRouter) {
    return chosen.includes('/') ? chosen : `openai/${chosen}`
  }

  // Native OpenAI — only OpenAI model names work
  if (chosen.startsWith('openai/')) {
    return chosen.slice('openai/'.length)
  }
  if (chosen.includes('/')) {
    return 'gpt-4o-mini'
  }
  return chosen
}

export function resolveImageModel(preferred: string | null | undefined): string {
  const chosen =
    preferred && isAllowedImageModel(preferred) ? preferred : DEFAULT_IMAGE_MODEL
  return chosen
}

export function captionModelLabel(id: string): string {
  return CAPTION_MODEL_OPTIONS.find((m) => m.id === id)?.label ?? id
}
