import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import { regenerateCaption } from "@/src/trigger/content-generator";
import { requireAuth, AuthError } from "@/lib/services/auth.service";

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

  // session used for auth enforcement above
  void session

  try {
    const body = await request.json();
    const { feedback } = body;

    // Trigger the background task
    const handle = await tasks.trigger<typeof regenerateCaption>("regenerate-caption", {
      postId: id,
      feedback,
    });

    return NextResponse.json({ success: true, jobId: handle.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
