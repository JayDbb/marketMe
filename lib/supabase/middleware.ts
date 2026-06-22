import { auth } from "@/lib/auth"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  // Get the session from Better Auth
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  // Protected routes: redirect to login if not authenticated
  if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (!session && request.nextUrl.pathname.startsWith("/onboarding")) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}
