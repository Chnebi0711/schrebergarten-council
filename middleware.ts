import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow login page and auth API through
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Allow Next.js internals and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  try {
    const session = req.cookies.get("sc_session");
    const correct = process.env.ACCESS_PASSWORD;

    // req.cookies.get() may return a string or { name, value } depending on Next.js version
    const sessionValue =
      typeof session === "string" ? session : session?.value;

    if (!correct || !sessionValue || sessionValue !== correct) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch {
    // On any unexpected error fall through to login
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
