import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/admin", "/api/admin", "/api/gateway"];

export function middleware(request: NextRequest) {
  const required = process.env.ADMIN_API_KEY?.trim();
  if (!required) {
    return NextResponse.next();
  }
  const { pathname, searchParams } = request.nextUrl;
  if (!PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }
  const headerKey = request.headers.get("x-admin-key")?.trim();
  if (headerKey && headerKey === required) {
    return NextResponse.next();
  }
  const auth = request.headers.get("authorization")?.trim();
  if (auth && auth === `Bearer ${required}`) {
    return NextResponse.next();
  }
  const cookieKey = request.cookies.get("admin_key")?.value;
  if (cookieKey && cookieKey === required) {
    return NextResponse.next();
  }
  const queryKey = searchParams.get("admin_key")?.trim();
  if (queryKey && queryKey === required) {
    const res = NextResponse.next();
    res.cookies.set("admin_key", queryKey, { httpOnly: true, sameSite: "lax", path: "/" });
    return res;
  }
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const nextUrl = request.nextUrl.clone();
  nextUrl.pathname = "/";
  return NextResponse.redirect(nextUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/gateway/:path*"],
};
