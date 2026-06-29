import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY is missing from the environment variables.')
}

const apiKey = process.env.OPENAI_API_KEY || 'missing-key'
const isOpenRouter = apiKey.startsWith('sk-or-')

export const openai = new OpenAI({
  apiKey,
  baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : undefined,
  defaultHeaders: isOpenRouter ? {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'X-Title': 'MarketMe AI',
  } : undefined,
})
