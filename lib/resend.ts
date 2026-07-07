import { Resend } from 'resend'

let client: Resend | null | undefined

/** Lazy Resend client — only created when RESEND_API_KEY is set. */
export function getResendClient(): Resend | null {
  if (client !== undefined) return client

  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) {
    client = null
    return client
  }

  client = new Resend(apiKey)
  return client
}
