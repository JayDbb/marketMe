import OpenAI from 'openai'
import {
  getOpenAiApiKey,
  hasOpenAiConfigured,
  isOpenRouterApiKey,
  openAiClientHeaders,
} from '@/lib/openai-config'

if (!hasOpenAiConfigured()) {
  console.warn(
    'OPENAI_API_KEY / OPENROUTER_API_KEY is missing from the environment variables.'
  )
}

const apiKey = getOpenAiApiKey() || 'missing-key'
const isOpenRouter = isOpenRouterApiKey(apiKey)

export const openai = new OpenAI({
  apiKey,
  baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : undefined,
  defaultHeaders: openAiClientHeaders(),
})
