import { NextRequest, NextResponse } from 'next/server'
import { legalCompany } from '@/lib/legal-company'
import { getResendClient } from '@/lib/resend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TOPIC_LABELS: Record<string, string> = {
  support: 'Product & account support',
  privacy: 'Privacy / data request',
  legal: 'Legal',
  billing: 'Billing',
  other: 'Other',
}

const TOPIC_TO_EMAIL: Record<string, string> = {
  support: legalCompany.supportEmail,
  privacy: legalCompany.privacyEmail,
  legal: legalCompany.legalEmail,
  billing: legalCompany.supportEmail,
  other: legalCompany.supportEmail,
}

type Body = {
  name?: string
  email?: string
  topic?: string
  message?: string
}

export async function POST(request: NextRequest) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const name = body.name?.trim() ?? ''
  const email = body.email?.trim() ?? ''
  const topic = body.topic?.trim() ?? ''
  const message = body.message?.trim() ?? ''

  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ error: 'Enter a valid name.' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }
  if (!TOPIC_LABELS[topic]) {
    return NextResponse.json({ error: 'Choose a valid topic.' }, { status: 400 })
  }
  if (message.length < 20 || message.length > 4000) {
    return NextResponse.json(
      { error: 'Message must be between 20 and 4,000 characters.' },
      { status: 400 }
    )
  }

  const to = TOPIC_TO_EMAIL[topic] || legalCompany.supportEmail
  const topicLabel = TOPIC_LABELS[topic]
  const resend = getResendClient()

  if (!resend) {
    return NextResponse.json(
      {
        error: `Email is not configured on the server. Please write to ${to} directly.`,
      },
      { status: 503 }
    )
  }

  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    'Marketme <onboarding@resend.dev>'

  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: email,
    subject: `[Marketme contact] ${topicLabel} — ${name}`,
    text: [
      `Topic: ${topicLabel}`,
      `From: ${name} <${email}>`,
      '',
      message,
    ].join('\n'),
  })

  if (error) {
    console.error('[contact]', error)
    return NextResponse.json(
      { error: `Could not send. Email ${to} directly.` },
      { status: 502 }
    )
  }

  return NextResponse.json({ ok: true })
}
