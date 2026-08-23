import { NextRequest, NextResponse } from 'next/server'
import { isAutoPublishEnabled } from '@/lib/auto-publish'
import { publishDueScheduledPosts } from '@/lib/services/scheduled-publishing.service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
/** Allow enough time for several Instagram publishes in one tick. */
export const maxDuration = 300

/**
 * Unattended scheduled publishing.
 * Call from Vercel Cron, Trigger.dev, or any external scheduler.
 * Auth: Authorization: Bearer <CRON_SECRET> (or ?secret=).
 *
 * Instagram tokens live on MarketMe AI — the user does not need to be online.
 */
export async function GET(request: NextRequest) {
  return runCron(request)
}

export async function POST(request: NextRequest) {
  return runCron(request)
}

async function runCron(request: NextRequest) {
  const expected = process.env.CRON_SECRET?.trim()
  if (!expected) {
    return NextResponse.json(
      { error: 'CRON_SECRET is not configured' },
      { status: 503 }
    )
  }

  const authHeader = request.headers.get('authorization')
  const bearer = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : null
  const querySecret = request.nextUrl.searchParams.get('secret')
  const provided = bearer || querySecret

  if (!provided || provided !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isAutoPublishEnabled()) {
    return NextResponse.json({
      success: true,
      skipped: true,
      count: 0,
      message:
        'Auto-publish is disabled. Set ENABLE_AUTO_PUBLISH=true or INSTAGRAM_PUBLISH_ENABLED=true.',
    })
  }

  try {
    const result = await publishDueScheduledPosts()
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Publish cron failed'
    console.error('[cron/publish-scheduled]', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
