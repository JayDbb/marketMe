#!/usr/bin/env node
/**
 * Warns when .env.local is missing or required variables are unset.
 * Marketing pages still work; login/dashboard need a full env file.
 */
import { existsSync, readFileSync } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'

const root = process.cwd()
const envLocalPath = join(root, '.env.local')

const REQUIRED = [
  { key: 'DATABASE_URL', feature: 'auth & database' },
  { key: 'BETTER_AUTH_SECRET', feature: 'auth sessions' },
  { key: 'NEXT_PUBLIC_SUPABASE_URL', feature: 'Supabase client' },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', feature: 'Supabase client' },
  { key: 'SUPABASE_SERVICE_ROLE_KEY', feature: 'dashboard data' },
]

function parseEnvFile(path) {
  if (!existsSync(path)) return {}
  const vars = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    vars[key] = value
  }
  return vars
}

function getEnv(key, fileVars) {
  return process.env[key]?.trim() || fileVars[key]?.trim() || ''
}

export function checkEnv({ strict = false } = {}) {
  const fileVars = parseEnvFile(envLocalPath)
  const missing = REQUIRED.filter(({ key }) => !getEnv(key, fileVars))
  let warned = false

  if (!existsSync(envLocalPath)) {
    console.warn('\n[env] No .env.local found.')
    console.warn('[env] Copy .env.example → .env.local and add your credentials.')
    warned = true
  }

  if (missing.length > 0) {
    console.warn('\n[env] Missing variables (needed for login & dashboard):')
    for (const { key, feature } of missing) {
      console.warn(`      ${key}  — ${feature}`)
    }
    console.warn('\n[env] Marketing pages still work. Auth routes will fail until these are set.\n')
    warned = true
  }

  if (strict && warned) {
    process.exit(1)
  }

  return { ok: !warned, missing: missing.map((m) => m.key) }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  checkEnv({ strict: process.argv.includes('--strict') })
}
