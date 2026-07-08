import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/services/auth.service";
import { rateLimitOrThrow } from "@/lib/rate-limit";

export async function GET() {
  let session
  try {
    session = await requireAuth()
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  void session

  const hasToken = !!process.env.LINEAR_PERSONAL_ACCESS_TOKEN;
  return NextResponse.json({ hasToken });
}

export async function POST(req: NextRequest) {
  let session
  try {
    session = await requireAuth()
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    rateLimitOrThrow(`linear:${session.user.id}`, 30, 60_000)
  } catch {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }

  try {
    let token = req.headers.get("x-linear-token");

    if (!token || token === "default") {
      token = process.env.LINEAR_PERSONAL_ACCESS_TOKEN || null;
    }

    if (!token) {
      return NextResponse.json(
        { error: "Authorization token is missing. Please connect to Linear first." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { query, variables } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "GraphQL query is required." },
        { status: 400 }
      );
    }

    const linearResponse = await fetch("https://api.linear.app/v2/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });

    if (!linearResponse.ok) {
      return NextResponse.json(
        { error: `Linear API responded with status ${linearResponse.status}` },
        { status: linearResponse.status }
      );
    }

    const data = await linearResponse.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error occurred." },
      { status: 500 }
    );
  }
}
