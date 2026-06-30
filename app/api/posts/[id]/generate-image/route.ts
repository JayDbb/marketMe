import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import { generateImage } from "@/src/trigger/content-generator";
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

  // Suppress unused variable warning — session is used for auth enforcement above
  void session

  try {
    const body = await request.json();
    const { style } = body;

    // Trigger the background task
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
