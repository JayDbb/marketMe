import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const hasToken = !!process.env.LINEAR_PERSONAL_ACCESS_TOKEN;
  return NextResponse.json({ hasToken });
}

export async function POST(req: NextRequest) {
  try {
    let token = req.headers.get("x-linear-token");
    
    // Fall back to server environment variable if header is missing or set to "default"
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

    if (!query) {
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
      const errorText = await linearResponse.text();
      return NextResponse.json(
        { error: `Linear API responded with status ${linearResponse.status}: ${errorText}` },
        { status: linearResponse.status }
      );
    }

    const data = await linearResponse.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error occurred." },
      { status: 500 }
    );
  }
}
