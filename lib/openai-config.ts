/**
 * Resolve the API key used by the OpenAI SDK client and direct image calls.
 * Supports native OpenAI keys and OpenRouter keys stored under either env name.
 */
export function getOpenAiApiKey(): string {
  return (
    process.env.OPENAI_API_KEY?.trim() ||
    process.env.OPENROUTER_API_KEY?.trim() ||
    ''
  )
}

export function hasOpenAiConfigured(): boolean {
  return getOpenAiApiKey().length > 0
}

export function isOpenRouterApiKey(apiKey = getOpenAiApiKey()): boolean {
  return apiKey.startsWith('sk-or-')
}

export function openAiClientHeaders(): Record<string, string> | undefined {
  if (!isOpenRouterApiKey()) return undefined
  return {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'X-Title': 'MarketMe AI',
  }
}
