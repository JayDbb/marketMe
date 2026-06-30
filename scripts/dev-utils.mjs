import { readdirSync, readFileSync, existsSync, rmSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

export const DEV_PORTS = [3000, 3001]

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getNextDir(root = process.cwd()) {
  return join(root, '.next')
}

export function getTurbopackCacheDir(nextDir) {
  return join(nextDir, 'dev', 'cache', 'turbopack')
}

/** True when .meta files reference .sst files that were deleted (partial clean / crash). */
export function isTurbopackCacheCorrupt(nextDir) {
  const turbopackRoot = getTurbopackCacheDir(nextDir)
  if (!existsSync(turbopackRoot)) return false

  try {
    const sessionDirs = readdirSync(turbopackRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => join(turbopackRoot, entry.name))

    for (const dir of sessionDirs) {
      let files
      try {
        files = new Set(readdirSync(dir))
      } catch {
        return true
      }

      for (const file of files) {
        if (!file.endsWith('.meta')) continue
        let content
        try {
          content = readFileSync(join(dir, file), 'utf8')
        } catch {
          return true
        }
        const refs = content.match(/\d+\.sst/g) ?? []
        for (const ref of refs) {
          if (!files.has(ref)) return true
        }
      }
    }
  } catch {
    return true
  }

  return false
}

export function stopListenersOnPort(port) {
  if (process.platform === 'win32') {
    execSync(
      `powershell -NoProfile -Command "$ids = (Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue).OwningProcess | Select-Object -Unique; foreach ($id in $ids) { if ($id) { Stop-Process -Id $id -Force -ErrorAction SilentlyContinue } }"`,
      { stdio: 'ignore' }
    )
    return
  }

  try {
    execSync(`lsof -ti tcp:${port} | xargs kill -9 2>/dev/null`, {
      stdio: 'ignore',
      shell: true,
    })
  } catch {
    // No listener on this port
  }
}

export function stopDevServers(ports = DEV_PORTS) {
  for (const port of ports) {
    try {
      stopListenersOnPort(port)
    } catch {
      // Best effort
    }
  }
}

export async function removePath(target, label = target) {
  if (!existsSync(target)) return false

  const maxAttempts = 6
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      rmSync(target, { recursive: true, force: true })
      return true
    } catch (err) {
      const code = err && typeof err === 'object' && 'code' in err ? err.code : null
      const retryable = code === 'EPERM' || code === 'EBUSY'
      if (!retryable || attempt === maxAttempts) throw err
      await sleep(500 * attempt)
    }
  }
  return false
}

/** Drop only Turbopack cache (fast). Falls back to full .next removal. */
export async function repairTurbopackCache(nextDir) {
  const turbopackRoot = getTurbopackCacheDir(nextDir)
  if (!existsSync(turbopackRoot)) return false

  try {
    await removePath(turbopackRoot, 'Turbopack cache')
    return true
  } catch {
    stopDevServers()
    await sleep(400)
    await removePath(nextDir, '.next')
    return true
  }
}

export async function ensureDevCacheHealthy(nextDir = getNextDir()) {
  if (!existsSync(nextDir)) return

  if (isTurbopackCacheCorrupt(nextDir)) {
    console.warn(
      '[dev] Corrupt Turbopack cache detected (usually from stopping dev mid-clean). Repairing...'
    )
    await repairTurbopackCache(nextDir)
    console.warn('[dev] Cache repaired — starting fresh.\n')
  }
}
