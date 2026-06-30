#!/usr/bin/env node
/**
 * Removes .next safely on Windows/macOS/Linux.
 * Stops dev servers on ports 3000/3001 first, then retries on EPERM/EBUSY.
 */
import {
  getNextDir,
  removePath,
  sleep,
  stopDevServers,
} from './dev-utils.mjs'

const nextDir = getNextDir()

console.log('Cleaning Next.js cache...')
stopDevServers()
await sleep(400)

try {
  const removed = await removePath(nextDir)
  if (removed) {
    console.log('Removed .next')
  } else {
    console.log('No .next folder — nothing to clean.')
  }
} catch {
  console.error(
    '\nCould not delete .next — a process is still locking Turbopack cache files.',
    '\n1. Press Ctrl+C in any terminal running `next dev`',
    '\n2. Run: npm run clean',
    '\n3. Then: npm run dev\n'
  )
  process.exit(1)
}
