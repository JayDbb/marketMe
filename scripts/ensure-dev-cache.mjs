#!/usr/bin/env node
/**
 * Validates Turbopack cache before dev starts.
 * Run automatically via `npm run dev` — or manually: node scripts/ensure-dev-cache.mjs
 */
import { ensureDevCacheHealthy } from './dev-utils.mjs'

await ensureDevCacheHealthy()
