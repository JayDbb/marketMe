import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import { generateImage } from "@/src/trigger/content-generator";
import { requireAuth, AuthError } from "@/lib/services/auth.service";
import {
  PostLifecycleError,
  verifyPostOwnership,
} from "@/lib/services/post-lifecycle.service";
import { rateLimitOrThrow } from "@/lib/rate-limit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    rateLimitOrThrow(`generate-image:${session.user.id}`, 20, 60_000)
    await verifyPostOwnership(session.user.id, id)
  } catch (e) {
    if (e instanceof PostLifecycleError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    if (e instanceof Error && e.message.includes('Rate limit')) {
      return NextResponse.json({ error: e.message }, { status: 429 })
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json();
    const { style } = body;

    const handle = await tasks.trigger<typeof generateImage>("generate-image", {
      postId: id,
      style,
    });

    return NextResponse.json({ success: true, jobId: handle.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
