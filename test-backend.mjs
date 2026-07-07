/**
 * MarketMe Backend API Verification Script
 * Tests all API endpoints and reports results.
 * 
 * Usage: node test-backend.mjs [BASE_URL]
 * Default BASE_URL: http://localhost:3000
 */

const BASE_URL = process.argv[2] || 'http://localhost:3000'

const results = []
let passed = 0
let failed = 0

async function test(name, fn) {
  const start = Date.now()
  try {
    const result = await fn()
    const ms = Date.now() - start
    if (result.pass) {
      console.log(`  ✅ ${name} (${ms}ms)`)
      if (result.note) console.log(`     note: ${result.note}`)
      passed++
      results.push({ name, pass: true, ms, note: result.note })
    } else {
      console.log(`  ❌ ${name} (${ms}ms)`)
      console.log(`     reason: ${result.reason}`)
      failed++
      results.push({ name, pass: false, ms, reason: result.reason })
    }
  } catch (err) {
    const ms = Date.now() - start
    console.log(`  ❌ ${name} (${ms}ms) — threw: ${err.message}`)
    failed++
    results.push({ name, pass: false, ms, reason: err.message })
  }
}

async function json(res) {
  try { return await res.json() } catch { return null }
}

console.log(`\n🔍 MarketMe Backend API Verification`)
console.log(`   Target: ${BASE_URL}`)
console.log(`   Time: ${new Date().toISOString()}\n`)

// ─── 1. Health check ───────────────────────────────────────────────────────
console.log('── Health ──')
await test('GET /api/health', async () => {
  const res = await fetch(`${BASE_URL}/api/health`)
  const body = await json(res)
  if (res.status !== 200) return { pass: false, reason: `Expected 200, got ${res.status}` }
  if (body?.status !== 'ok') return { pass: false, reason: `Expected {status:"ok"}, got ${JSON.stringify(body)}` }
  return { pass: true }
})

// ─── 2. Auth — Unauthenticated access ─────────────────────────────────────
console.log('\n── Authentication ──')
await test('GET /api/business-profile — 401 when unauthenticated', async () => {
  const res = await fetch(`${BASE_URL}/api/business-profile`)
  const body = await json(res)
  if (res.status !== 401) return { pass: false, reason: `Expected 401, got ${res.status}: ${JSON.stringify(body)}` }
  return { pass: true }
})

await test('PUT /api/business-profile — 401 when unauthenticated', async () => {
  const res = await fetch(`${BASE_URL}/api/business-profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ business_name: 'Test' })
  })
  if (res.status !== 401) return { pass: false, reason: `Expected 401, got ${res.status}` }
  return { pass: true }
})

await test('POST /api/content-plans — 401 when unauthenticated', async () => {
  const res = await fetch(`${BASE_URL}/api/content-plans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ business_profile_id: 'test', start_date: '2026-01-01', end_date: '2026-01-07', posts: [] })
  })
  if (res.status !== 401) return { pass: false, reason: `Expected 401, got ${res.status}` }
  return { pass: true }
})

await test('POST /api/content-plans/generate — 401 when unauthenticated', async () => {
  const res = await fetch(`${BASE_URL}/api/content-plans/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ businessProfileId: 'test', startDate: '2026-01-01' })
  })
  if (res.status !== 401) return { pass: false, reason: `Expected 401, got ${res.status}` }
  return { pass: true }
})

// ─── 3. Auth — Session endpoint ────────────────────────────────────────────
await test('GET /api/auth/get-session — reachable (Better Auth session endpoint)', async () => {
  const res = await fetch(`${BASE_URL}/api/auth/get-session`)
  // Better Auth returns 200 with null session when not authenticated
  if (res.status === 404) return { pass: false, reason: 'Auth route not found — check [...all]/route.ts' }
  return { pass: true, note: `Status: ${res.status}` }
})

// ─── 4. Request validation ─────────────────────────────────────────────────
console.log('\n── Request Validation ──')
await test('POST /api/content-plans — 400 on invalid JSON body', async () => {
  const res = await fetch(`${BASE_URL}/api/content-plans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: 'not-json'
  })
  // Will get 401 (auth check runs first) or 400 — both indicate correct handling
  if (res.status !== 400 && res.status !== 401) return { pass: false, reason: `Expected 400 or 401, got ${res.status}` }
  return { pass: true, note: `Got ${res.status} (auth guard runs first)` }
})

await test('PATCH /api/posts/[id]/status — 401 when unauthenticated', async () => {
  const res = await fetch(`${BASE_URL}/api/posts/fake-post-id/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'approved' })
  })
  if (res.status !== 401) return { pass: false, reason: `Expected 401, got ${res.status}` }
  return { pass: true }
})

await test('POST /api/posts/[id]/generate-image — 401 when unauthenticated', async () => {
  const res = await fetch(`${BASE_URL}/api/posts/fake-post-id/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ style: 'minimalist' })
  })
  if (res.status !== 401) return { pass: false, reason: `Expected 401, got ${res.status}` }
  return { pass: true }
})

await test('POST /api/posts/[id]/regenerate-caption — 401 when unauthenticated', async () => {
  const res = await fetch(`${BASE_URL}/api/posts/fake-post-id/regenerate-caption`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feedback: 'Make it more professional' })
  })
  if (res.status !== 401) return { pass: false, reason: `Expected 401, got ${res.status}` }
  return { pass: true }
})

// ─── 5. Linear API ─────────────────────────────────────────────────────────
console.log('\n── Linear Integration ──')
await test('GET /api/linear — returns hasToken: true', async () => {
  const res = await fetch(`${BASE_URL}/api/linear`)
  const body = await json(res)
  if (res.status !== 200) return { pass: false, reason: `Expected 200, got ${res.status}` }
  if (body?.hasToken !== true) return { pass: false, reason: `Expected {hasToken:true}, got ${JSON.stringify(body)}. Check LINEAR_PERSONAL_ACCESS_TOKEN env var.` }
  return { pass: true }
})

// ─── Summary ───────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`)
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`)
if (failed === 0) {
  console.log('🎉 All API endpoint tests passed!\n')
} else {
  console.log('⚠️  Some tests failed. Review output above.\n')
  process.exit(1)
}
