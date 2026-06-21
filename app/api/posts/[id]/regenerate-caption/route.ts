import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import { regenerateCaption } from "@/src/trigger/content-generator";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { feedback } = body;

    // Trigger the background task
    const resolvedParams = await params;
    const handle = await tasks.trigger<typeof regenerateCaption>("regenerate-caption", {
      postId: resolvedParams.id,
      feedback,
    });

    return NextResponse.json({ success: true, jobId: handle.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
