import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import { generateWeeklyContent } from "@/src/trigger/content-generator";
import { requireAuth, AuthError } from "@/lib/services/auth.service";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
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
    const { businessProfileId, startDate } = body;

    if (!businessProfileId || !startDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify ownership of the business profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('business_profiles')
      .select('id')
      .eq('id', businessProfileId)
      .eq('user_id', session.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found or unauthorized" }, { status: 403 });
    }

    // Trigger the background task
    const handle = await tasks.trigger<typeof generateWeeklyContent>("generate-weekly-content", {
      businessProfileId,
      startDate,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true, jobId: handle.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
