import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/services/auth.service";
import { rateLimitOrThrow } from "@/lib/rate-limit";
import { transitionPostStatus } from "@/lib/services/post-lifecycle.service";
import type { PostStatus } from "@/types/content-plan";

const ALLOWED_STATUSES: PostStatus[] = [
  'draft',
  'approved',
  'scheduled',
  'rejected',
  'published',
  'failed',
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;

  let session
  try {
    session = await requireAuth()
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    return NextResponse.json({ error: "Authentication error" }, { status: 401 })
  }

  try {
    rateLimitOrThrow(`post-status:${session.user.id}`, 30, 60_000)

    const body = await request.json();
    const { status, scheduled_at } = body;

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { data: post, error } = await transitionPostStatus(
      session.user.id,
      id,
      status,
      scheduled_at ? { scheduledAt: scheduled_at } : undefined
    )

    if (error) {
      throw new Error(error);
    }

    return NextResponse.json({ success: true, post });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
