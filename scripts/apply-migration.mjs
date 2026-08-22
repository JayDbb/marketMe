import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { Pool } from 'pg'

function parseEnvFile(path) {
  if (!existsSync(path)) return {}
  const vars = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    vars[trimmed.slice(0, eq).trim()] = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, '')
  }
  return vars
}

const file = process.argv[2]
if (!file) {
  console.error('Usage: node scripts/apply-migration.mjs <path-to-sql>')
  process.exit(1)
}

const fileVars = parseEnvFile(join(process.cwd(), '.env.local'))
const DATABASE_URL = process.env.DATABASE_URL || fileVars.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const sql = readFileSync(resolve(process.cwd(), file), 'utf8')

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

try {
  console.log(`Applying migration: ${file}`)
  await pool.query(sql)
  console.log('Migration applied successfully.')
} catch (err) {
  console.error('Migration failed:', err.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
