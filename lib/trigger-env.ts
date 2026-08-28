/**
 * Trigger.dev SDK reads TRIGGER_SECRET_KEY.
 * TRIGGER_DEV_API_KEY is accepted as an alias (Python/API env naming).
 */
export function getTriggerSecretKey(): string {
  return (
    process.env.TRIGGER_SECRET_KEY?.trim() ||
    process.env.TRIGGER_DEV_API_KEY?.trim() ||
    ''
  )
}

export function hasTriggerConfigured(): boolean {
  return getTriggerSecretKey().length > 0
}

/** Copy the alias into TRIGGER_SECRET_KEY so @trigger.dev/sdk can authenticate. */
export function ensureTriggerSecretKey(): string {
  const key = getTriggerSecretKey()
  if (key && !process.env.TRIGGER_SECRET_KEY?.trim()) {
    process.env.TRIGGER_SECRET_KEY = key
  }
  return key
}

ensureTriggerSecretKey()
