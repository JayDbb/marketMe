import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import { generateWeeklyContent } from "@/src/trigger/content-generator";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { businessProfileId, startDate } = body;

    if (!businessProfileId || !startDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Trigger the background task
    const handle = await tasks.trigger<typeof generateWeeklyContent>("generate-weekly-content", {
      businessProfileId,
      startDate,
    });

    return NextResponse.json({ success: true, jobId: handle.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
