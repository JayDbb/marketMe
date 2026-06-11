import { LinearClient } from '@linear/sdk'

const apiKey = process.env.LINEAR_API_KEY

if (!apiKey) {
  console.warn('Linear API key is not set. Linear integration will not work.')
}

export const linearClient = new LinearClient({ apiKey: apiKey ?? 'dummy_key' })
