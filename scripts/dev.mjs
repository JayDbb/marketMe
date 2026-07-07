#!/usr/bin/env node
/**
 * Starts `next dev` with:
 * - automatic Turbopack cache repair on startup
 * - graceful shutdown on Ctrl+C (reduces locked .next files on Windows)
 */
import { spawn } from 'child_process'
import { join } from 'path'
import { ensureDevCacheHealthy } from './dev-utils.mjs'
import { checkEnv } from './check-env.mjs'

await ensureDevCacheHealthy()
checkEnv()

const nextBin = join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next')
const args = ['dev', ...process.argv.slice(2)]

const child = spawn(process.execPath, [nextBin, ...args], {
  stdio: 'inherit',
  env: process.env,
  windowsHide: true,
})

let shuttingDown = false

function shutdown(signal) {
  if (shuttingDown || child.killed) return
  shuttingDown = true
  child.kill(signal)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

child.on('exit', (code, signal) => {
  if (signal === 'SIGINT' || signal === 'SIGTERM') {
    process.exit(0)
    return
  }
  process.exit(code ?? 1)
})

child.on('error', (err) => {
  console.error('[dev] Failed to start Next.js:', err.message)
  process.exit(1)
})
