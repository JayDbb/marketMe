import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/services/auth.service";
import { updatePostStatus } from "@/lib/services/content.service";

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
    const body = await request.json();
    const { status, scheduled_at } = body;

    if (!['draft', 'approved', 'scheduled', 'rejected'].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { data: post, error } = await updatePostStatus(
      session.user.id,
      id,
      status,
      scheduled_at
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
