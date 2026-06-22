/**
 * MarketMe-AI API Connectivity Test Script
 *
 * Tests all registered endpoints of the FastAPI backend.
 * Run with: npx tsx test-marketing-ai.ts
 *
 * Requirements:
 *   - MarketMe-AI backend running at MARKETME_AI_API_URL (default: http://localhost:8000)
 *   - A valid business_id and strategy_id in your Supabase DB for non-health tests
 */

const API_URL = process.env.MARKETME_AI_API_URL ?? 'http://localhost:8000'
const TIMEOUT_MS = 30_000

// ---------------------------------------------------------------------------
// Test utilities
// ---------------------------------------------------------------------------

interface TestResult {
  name: string
  endpoint: string
  method: string
  passed: boolean
  statusCode?: number
  responseTime?: number
  error?: string
  responseBody?: unknown
}

const results: TestResult[] = []

async function runTest(
  name: string,
  endpoint: string,
  method: string,
  fetchFn: () => Promise<Response>
): Promise<void> {
  const start = Date.now()
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
    const res = await fetchFn()
    clearTimeout(timeout)
    const elapsed = Date.now() - start
    const body = await res.json().catch(() => null)

    const passed = res.status >= 200 && res.status < 300
    results.push({
      name,
      endpoint,
      method,
      passed,
      statusCode: res.status,
      responseTime: elapsed,
      responseBody: body,
    })

    const icon = passed ? '✅' : '❌'
    console.log(`${icon} [${res.status}] ${method} ${endpoint} (${elapsed}ms)`)
    if (!passed) {
      console.log(`   Error body:`, JSON.stringify(body, null, 2))
    }
  } catch (err) {
    const elapsed = Date.now() - start
    const message = err instanceof Error ? err.message : String(err)
    results.push({
      name,
      endpoint,
      method,
      passed: false,
      responseTime: elapsed,
      error: message,
    })
    console.log(`❌ [NETWORK] ${method} ${endpoint} — ${message}`)
  }
}

// ---------------------------------------------------------------------------
// Test runner
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\n🔍 MarketMe-AI API Test Suite`)
  console.log(`📡 Target: ${API_URL}`)
  console.log(`${'─'.repeat(60)}\n`)

  // 1. Health check
  await runTest('Health Check', '/api/v1/health', 'GET', () =>
    fetch(`${API_URL}/api/v1/health`)
  )

  // 2. Strategy generation
  await runTest('Generate Strategy', '/api/v1/strategy/generate', 'POST', () =>
    fetch(`${API_URL}/api/v1/strategy/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_id: 'test-business-id',
        business_name: 'Test Bakery',
        industry: 'Food & Beverage',
        target_audience: 'Local families and professionals',
        goals: 'Increase foot traffic by 20%',
        budget_range: '$500/month',
        platforms: ['instagram'],
      }),
    })
  )

  // 3. List posts (requires a real business_id in DB)
  await runTest('List Posts', '/api/v1/posts?business_id=test-business-id', 'GET', () =>
    fetch(`${API_URL}/api/v1/posts?business_id=test-business-id`)
  )

  // 4. Creative generate (requires a real post_id in DB)
  await runTest('Generate Creative Brief', '/api/v1/creative/generate', 'POST', () =>
    fetch(`${API_URL}/api/v1/creative/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        post_id: 'test-post-id',
        style_hint: 'warm, artisan, modern',
      }),
    })
  )

  // 5. Publish auth URL
  await runTest('Get Instagram Auth URL', '/api/v1/publish/auth-url?business_id=test-business-id', 'GET', () =>
    fetch(`${API_URL}/api/v1/publish/auth-url?business_id=test-business-id`)
  )

  // 6. FastAPI /docs availability
  await runTest('OpenAPI Docs Available', '/docs', 'GET', () =>
    fetch(`${API_URL}/docs`)
  )

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------

  console.log(`\n${'─'.repeat(60)}`)
  console.log('📊 Test Summary\n')

  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length
  const avgTime = Math.round(
    results.reduce((sum, r) => sum + (r.responseTime ?? 0), 0) / results.length
  )

  console.log(`  Total:   ${results.length}`)
  console.log(`  Passed:  ${passed} ✅`)
  console.log(`  Failed:  ${failed} ❌`)
  console.log(`  Avg RT:  ${avgTime}ms\n`)

  if (failed > 0) {
    console.log('❌ Failed tests:')
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  - ${r.name}: ${r.error ?? `HTTP ${r.statusCode}`}`)
      })
  }

  console.log('\n' + (failed === 0 ? '🎉 All tests passed!' : '⚠️  Some tests failed — check above for details'))

  // Write JSON report
  const report = {
    timestamp: new Date().toISOString(),
    apiUrl: API_URL,
    summary: { total: results.length, passed, failed, avgResponseTimeMs: avgTime },
    results,
  }

  const { writeFileSync } = await import('fs')
  const reportPath = './marketing-ai-test-report.json'
  writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`\n📄 Full report written to: ${reportPath}\n`)

  process.exit(failed > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('Test runner error:', err)
  process.exit(1)
})
